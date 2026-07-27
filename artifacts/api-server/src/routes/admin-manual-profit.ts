/**
 * Admin Manual Profit Management
 *
 * Allows admins to manually credit profit to any user's account.
 * All operations run inside a single DB transaction — partial writes
 * are never committed. The automatic earnings cron is unaffected.
 */

import { Router, type IRouter } from "express";
import { eq, and, desc } from "drizzle-orm";
import { sql } from "drizzle-orm";
import {
  db,
  usersTable,
  investmentsTable,
  earningsTable,
  transactionsTable,
} from "@workspace/db";
import { requireAdmin } from "../middleware/requireAuth.js";
import { createNotification } from "../lib/notifications.js";
import { logger } from "../lib/logger.js";

const router: IRouter = Router();
router.use(requireAdmin);

/** Parse "#U-123" → 123, or return null for invalid format. */
function parseDbId(userId: string): number | null {
  const match = userId.match(/^#U-(\d+)$/);
  return match ? Number(match[1]) : null;
}

function toDateStr(d: Date): string {
  return d.toISOString().split("T")[0]!;
}

function formatMoney(value: string | null | undefined): string {
  const num = parseFloat(value ?? "0") || 0;
  return `$${num.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

// ─── GET /user/:userId/investments ────────────────────────────────────────────
// Returns active investments for a given user (for the admin profit modal).

router.get("/user/:userId/investments", async (req, res) => {
  const dbId = parseDbId(String(req.params.userId));
  if (!dbId) {
    res.status(400).json({ title: "Invalid user ID", detail: "Expected format: #U-<number>" });
    return;
  }

  try {
    const investments = await db
      .select()
      .from(investmentsTable)
      .where(and(eq(investmentsTable.user_id, dbId), eq(investmentsTable.status, "Active")))
      .orderBy(desc(investmentsTable.created_at));

    const result = investments.map((inv) => ({
      id: inv.id,
      planName: inv.plan_name,
      investmentAmount: formatMoney(inv.investment_amount),
      profitPercentage: inv.profit_percentage,
      totalProfit: formatMoney(inv.total_profit),
      startDate: inv.start_date.toISOString().split("T")[0],
      status: inv.status,
    }));

    res.json(result);
  } catch (err) {
    logger.error({ err }, "Failed to fetch investments for manual profit modal");
    res.status(500).json({ title: "Failed to load investments", detail: "Internal server error." });
  }
});

// ─── POST /credit ─────────────────────────────────────────────────────────────
// Credits a manual profit to a user. Everything runs in one transaction.

router.post("/credit", async (req, res) => {
  const { userId, investmentId, amount, note } = req.body as {
    userId?: string;
    investmentId?: number;
    amount?: number;
    note?: string;
  };

  // ── Validation ───────────────────────────────────────────────────────────
  if (!userId || typeof userId !== "string") {
    res.status(400).json({ title: "Missing userId", detail: "userId is required." });
    return;
  }

  const dbUserId = parseDbId(userId);
  if (!dbUserId) {
    res.status(400).json({ title: "Invalid userId", detail: "Expected format: #U-<number>" });
    return;
  }

  if (typeof investmentId !== "number" || !Number.isInteger(investmentId) || investmentId <= 0) {
    res.status(400).json({ title: "Invalid investmentId", detail: "investmentId must be a positive integer." });
    return;
  }

  if (typeof amount !== "number" || amount <= 0 || !isFinite(amount)) {
    res.status(400).json({ title: "Invalid amount", detail: "amount must be a positive number." });
    return;
  }

  if (amount > 999_999_999) {
    res.status(400).json({ title: "Amount too large", detail: "Amount exceeds maximum allowed value." });
    return;
  }

  const amountStr = amount.toFixed(2);
  const noteStr = typeof note === "string" ? note.trim().slice(0, 500) : "";
  const description = noteStr
    ? `Manual profit credit: ${noteStr}`
    : "Manual profit credit by administrator";

  try {
    // ── Verify investment belongs to this user and is Active ─────────────
    const [investment] = await db
      .select()
      .from(investmentsTable)
      .where(and(eq(investmentsTable.id, investmentId), eq(investmentsTable.user_id, dbUserId)))
      .limit(1);

    if (!investment) {
      res.status(404).json({
        title: "Investment not found",
        detail: "No active investment found for this user with the given ID.",
      });
      return;
    }

    if (investment.status !== "Active") {
      res.status(409).json({
        title: "Investment not active",
        detail: `Investment is ${investment.status}. Only Active investments can receive manual profit.`,
      });
      return;
    }

    // ── Verify user exists ───────────────────────────────────────────────
    const [user] = await db
      .select({ id: usersTable.id, full_name: usersTable.full_name, balance: usersTable.balance })
      .from(usersTable)
      .where(eq(usersTable.id, dbUserId))
      .limit(1);

    if (!user) {
      res.status(404).json({ title: "User not found", detail: "User does not exist." });
      return;
    }

    const today = toDateStr(new Date());
    const referenceId = `manual_profit_${investmentId}_${Date.now()}`;

    // ── Atomic DB transaction ────────────────────────────────────────────
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const result = await (db as any).transaction(async (tx: any) => {
      // 1. Update user balance
      await tx
        .update(usersTable)
        .set({
          balance: sql`${usersTable.balance} + ${amountStr}::numeric`,
          updated_at: new Date(),
        })
        .where(eq(usersTable.id, dbUserId));

      // 2. Create earnings record (source = 'manual')
      const [earning] = await tx
        .insert(earningsTable)
        .values({
          user_id: dbUserId,
          investment_id: investmentId,
          amount: amountStr,
          credit_date: today,
          source: "manual",
        })
        .returning({ id: earningsTable.id });

      // 3. Create transaction record
      await tx.insert(transactionsTable).values({
        user_id: dbUserId,
        type: "Profit",
        amount: amountStr,
        description,
        reference_id: referenceId,
        status: "Completed",
      });

      // 4. Accumulate total_profit on the investment row
      await tx.execute(
        sql`UPDATE investments SET total_profit = COALESCE(total_profit, 0) + ${amountStr}::numeric, updated_at = NOW() WHERE id = ${investmentId}`,
      );

      return { earningId: earning.id };
    });

    // ── Notify user (non-fatal, outside the transaction) ─────────────────
    const amountFormatted = Number(amountStr).toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
    await createNotification(
      dbUserId,
      "Investment",
      "Profit Credited",
      `Your account has been credited with $${amountFormatted} profit by the administrator.${noteStr ? ` Note: ${noteStr}` : ""}`,
    );

    logger.info(
      { userId, investmentId, amount: amountStr, earningId: result.earningId },
      "Manual profit credited by admin",
    );

    res.json({
      success: true,
      earningId: result.earningId,
      referenceId,
      amount: amountStr,
      message: `$${amountFormatted} credited to ${user.full_name}.`,
    });
  } catch (err) {
    logger.error({ err, userId, investmentId, amount }, "Failed to credit manual profit");
    res.status(500).json({ title: "Failed to credit profit", detail: "Internal server error. No funds were moved." });
  }
});

// ─── GET /history ─────────────────────────────────────────────────────────────
// Lists all manual profit credits (admin history view).

router.get("/history", async (_req, res) => {
  try {
    const rows = await db
      .select({
        id: earningsTable.id,
        userId: earningsTable.user_id,
        investmentId: earningsTable.investment_id,
        amount: earningsTable.amount,
        creditDate: earningsTable.credit_date,
        createdAt: earningsTable.created_at,
        userName: usersTable.full_name,
        userEmail: usersTable.email,
        planName: investmentsTable.plan_name,
      })
      .from(earningsTable)
      .innerJoin(usersTable, eq(earningsTable.user_id, usersTable.id))
      .innerJoin(investmentsTable, eq(earningsTable.investment_id, investmentsTable.id))
      .where(eq(earningsTable.source, "manual"))
      .orderBy(desc(earningsTable.created_at))
      .limit(200);

    const result = rows.map((r) => ({
      id: r.id,
      userId: `#U-${r.userId}`,
      userName: r.userName,
      userEmail: r.userEmail,
      investmentId: r.investmentId,
      planName: r.planName,
      amount: formatMoney(r.amount),
      creditDate: r.creditDate,
      createdAt: r.createdAt,
    }));

    res.json(result);
  } catch (err) {
    logger.error({ err }, "Failed to fetch manual profit history");
    res.status(500).json({ title: "Failed to load history", detail: "Internal server error." });
  }
});

export default router;
