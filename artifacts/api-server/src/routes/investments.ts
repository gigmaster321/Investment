import { Router, type IRouter, type Request } from "express";
import { requireAuth, requireAdmin } from "../middleware/requireAuth.js";
import { logger } from "../lib/logger.js";
import { getInvestmentPlanById } from "./plans.js";

export type InvestmentStatus = "Active" | "Completed" | "Expired" | "Cancelled";
export type InvestmentAction = "activate" | "pause" | "complete" | "cancel";

async function getDb() {
  return import("@workspace/db");
}

// ── Helpers ───────────────────────────────────────────────────────────────────

export function parseCycleDays(cycle: string): number {
  const match = cycle.match(/\d+/);
  const num = match ? Number(match[0]) : 30;
  const lower = cycle.toLowerCase();
  if (lower.includes("hour")) return Math.max(1 / 24, num / 24);
  return num > 0 ? num : 30;
}

function calculateCurrentProfit(
  investmentAmount: number,
  profitPercentage: number,
  startDate: Date,
  endDate: Date,
): number {
  const totalExpected = investmentAmount * (profitPercentage / 100);
  const now = Date.now();
  const start = startDate.getTime();
  const end = endDate.getTime();
  if (now >= end) return Number(totalExpected.toFixed(2));
  if (now <= start || end <= start) return 0;
  const ratio = (now - start) / (end - start);
  return Number((ratio * totalExpected).toFixed(2));
}

function calculateNextCreditDate(startDate: Date, endDate: Date, cycle: string): Date {
  const cycleDays = parseCycleDays(cycle);
  const cycleMsec = cycleDays * 24 * 60 * 60 * 1000;
  const now = Date.now();

  let next = new Date(startDate.getTime() + cycleMsec);
  while (next.getTime() <= now && next <= endDate) {
    next = new Date(next.getTime() + cycleMsec);
  }
  return next > endDate ? endDate : next;
}

function toInvestmentResponse(
  row: {
    id: number;
    user_id: number;
    plan_id: string | null;
    plan_name: string;
    plan_execution_cycle: string;
    investment_amount: string;
    profit_percentage: string;
    start_date: Date;
    end_date: Date;
    status: string;
    total_profit: string | null;
    created_at: Date;
    updated_at: Date;
  },
  user: { id: string; name: string; email: string },
) {
  const investmentAmount = Number(row.investment_amount);
  const profitPercentage = Number(row.profit_percentage);
  const totalExpectedProfit = investmentAmount * (profitPercentage / 100);
  const expectedReturn = Number((investmentAmount + totalExpectedProfit).toFixed(2));

  const startDate = row.start_date;
  const endDate = row.end_date;
  const now = Date.now();

  const remainingSeconds = Math.max(0, Math.ceil((endDate.getTime() - now) / 1000));

  const currentProfit = calculateCurrentProfit(investmentAmount, profitPercentage, startDate, endDate);

  const total = endDate.getTime() - startDate.getTime();
  const elapsed = now - startDate.getTime();
  const roiProgress = total <= 0 ? 100 : Number((Math.min(100, Math.max(0, (elapsed / total) * 100))).toFixed(1));

  const nextProfitCreditDate = calculateNextCreditDate(startDate, endDate, row.plan_execution_cycle);

  const status = row.status as InvestmentStatus;
  const totalProfitEarned = row.total_profit != null
    ? Number(row.total_profit)
    : (status !== "Active" ? Number(totalExpectedProfit.toFixed(2)) : null);

  return {
    id: String(row.id),
    user,
    plan: {
      id: row.plan_id ?? "",
      name: row.plan_name,
      executionCycle: row.plan_execution_cycle,
    },
    investmentAmount,
    profitPercentage,
    investmentDate: startDate.toISOString(),
    maturityDate: endDate.toISOString(),
    status,
    isPaused: false,
    expectedReturn,
    remainingSeconds,
    displayStatus: status,
    currentProfit,
    roiProgress,
    nextProfitCreditDate: nextProfitCreditDate.toISOString(),
    totalProfitEarned,
  };
}

// ── Router ────────────────────────────────────────────────────────────────────

const router: IRouter = Router();
router.use(requireAuth);

// GET /api/investments — list investments from DB
router.get("/", async (req, res) => {
  try {
    const { db, investmentsTable, usersTable } = await getDb();
    const { eq, desc, and } = await import("drizzle-orm");

    const isAdmin = req.session.userRole === "admin" || req.session.isAdmin === true;
    const scope = req.query.scope;

    if (isAdmin && scope === "all") {
      // Admin sees all investments with user info
      const rows = await db
        .select({
          id: investmentsTable.id,
          user_id: investmentsTable.user_id,
          deposit_request_id: investmentsTable.deposit_request_id,
          plan_id: investmentsTable.plan_id,
          plan_name: investmentsTable.plan_name,
          plan_execution_cycle: investmentsTable.plan_execution_cycle,
          investment_amount: investmentsTable.investment_amount,
          profit_percentage: investmentsTable.profit_percentage,
          start_date: investmentsTable.start_date,
          end_date: investmentsTable.end_date,
          status: investmentsTable.status,
          total_profit: investmentsTable.total_profit,
          created_at: investmentsTable.created_at,
          updated_at: investmentsTable.updated_at,
          user_email: usersTable.email,
          user_full_name: usersTable.full_name,
        })
        .from(investmentsTable)
        .leftJoin(usersTable, eq(investmentsTable.user_id, usersTable.id))
        .orderBy(desc(investmentsTable.created_at));

      res.json(
        rows.map((row) =>
          toInvestmentResponse(row, {
            id: String(row.user_id),
            name: row.user_full_name ?? "Unknown",
            email: row.user_email ?? "",
          }),
        ),
      );
    } else {
      // Regular user sees only their own
      const userId = req.session.userId!;
      const rows = await db
        .select()
        .from(investmentsTable)
        .where(eq(investmentsTable.user_id, userId))
        .orderBy(desc(investmentsTable.created_at));

      const userEmail = req.session.userEmail ?? "";
      const userName = req.session.userName ?? userEmail;
      res.json(
        rows.map((row) =>
          toInvestmentResponse(row, {
            id: String(userId),
            name: userName,
            email: userEmail,
          }),
        ),
      );
    }
  } catch (err) {
    logger.error({ err }, "Failed to list investments");
    res.status(500).json({ error: "SERVER_ERROR", message: "Could not load investments." });
  }
});

// GET /api/investments/:investmentId — single investment
router.get("/:investmentId", async (req, res) => {
  const rawId = req.params.investmentId;
  const id = parseInt(String(rawId), 10);
  if (isNaN(id)) {
    res.status(400).json({ title: "Invalid investment ID", detail: "Investment ID must be a number." });
    return;
  }

  try {
    const { db, investmentsTable, usersTable } = await getDb();
    const { eq } = await import("drizzle-orm");

    const [row] = await db
      .select({
        id: investmentsTable.id,
        user_id: investmentsTable.user_id,
        deposit_request_id: investmentsTable.deposit_request_id,
        plan_id: investmentsTable.plan_id,
        plan_name: investmentsTable.plan_name,
        plan_execution_cycle: investmentsTable.plan_execution_cycle,
        investment_amount: investmentsTable.investment_amount,
        profit_percentage: investmentsTable.profit_percentage,
        start_date: investmentsTable.start_date,
        end_date: investmentsTable.end_date,
        status: investmentsTable.status,
        total_profit: investmentsTable.total_profit,
        created_at: investmentsTable.created_at,
        updated_at: investmentsTable.updated_at,
        user_email: usersTable.email,
        user_full_name: usersTable.full_name,
      })
      .from(investmentsTable)
      .leftJoin(usersTable, eq(investmentsTable.user_id, usersTable.id))
      .where(eq(investmentsTable.id, id))
      .limit(1);

    if (!row) {
      res.status(404).json({ title: "Investment not found", detail: "The requested investment does not exist." });
      return;
    }

    // Non-admin can only see their own
    const isAdmin = req.session.userRole === "admin" || req.session.isAdmin === true;
    if (!isAdmin && row.user_id !== req.session.userId) {
      res.status(403).json({ title: "Forbidden", detail: "You do not have access to this investment." });
      return;
    }

    res.json(
      toInvestmentResponse(row, {
        id: String(row.user_id),
        name: row.user_full_name ?? "Unknown",
        email: row.user_email ?? "",
      }),
    );
  } catch (err) {
    logger.error({ err }, "Failed to fetch investment");
    res.status(500).json({ error: "SERVER_ERROR" });
  }
});

// POST /api/investments — create investment (user-initiated, balance-gated)
router.post("/", requireAuth, async (req, res) => {
  const { planId, amount } = req.body ?? {};
  if (!planId || typeof planId !== "string" || !amount || typeof amount !== "number" || amount <= 0) {
    res.status(400).json({ title: "Invalid investment", detail: "Provide a valid planId and investment amount." });
    return;
  }

  const plan = await getInvestmentPlanById(planId);
  if (!plan) {
    res.status(404).json({ title: "Plan not found", detail: "The selected investment plan does not exist." });
    return;
  }
  if (plan.status !== "Active") {
    res.status(409).json({ title: "Plan unavailable", detail: "The selected investment plan is not currently active." });
    return;
  }
  if (amount < plan.minInvestment || (plan.maxInvestment !== null && amount > plan.maxInvestment)) {
    res.status(400).json({ title: "Invalid amount", detail: "The investment amount is outside this plan's allowed range." });
    return;
  }

  try {
    const { db, investmentsTable, usersTable } = await getDb();
    const { eq, sql } = await import("drizzle-orm");

    const userId = req.session.userId!;
    const userEmail = req.session.userEmail ?? "";

    // ── Balance check ────────────────────────────────────────────────────────
    const [userRow] = await db
      .select({ balance: usersTable.balance })
      .from(usersTable)
      .where(eq(usersTable.id, userId))
      .limit(1);

    if (!userRow) {
      res.status(404).json({ error: "USER_NOT_FOUND" });
      return;
    }

    const balance = Number(userRow.balance);
    if (balance < amount) {
      res.status(400).json({
        error: "INSUFFICIENT_BALANCE",
        title: "Insufficient balance",
        detail: `Your wallet balance ($${balance.toFixed(2)}) is less than the investment amount. Please deposit at least $${(amount - balance).toFixed(2)} more.`,
        balance,
        required: amount,
      });
      return;
    }

    // ── Deduct balance & create investment atomically ────────────────────────
    const cycleDays = parseCycleDays(plan.executionCycle);
    const startDate = new Date();
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + cycleDays);

    const amountStr = amount.toFixed(2);

    const { transactionsTable } = await getDb();

    const [row] = await db.transaction(async (tx) => {
      // 1. Deduct from wallet
      await tx
        .update(usersTable)
        .set({ balance: sql`${usersTable.balance} - ${amountStr}::numeric` })
        .where(eq(usersTable.id, userId));

      // 2. Create investment record
      const [inv] = await tx
        .insert(investmentsTable)
        .values({
          user_id: userId,
          plan_id: plan.id,
          plan_name: plan.name,
          plan_execution_cycle: plan.executionCycle,
          investment_amount: amountStr,
          profit_percentage: String(plan.profitPercentage),
          start_date: startDate,
          end_date: endDate,
          status: "Active",
        })
        .returning();

      // 3. Write a transaction record so the balance deduction is visible
      //    in the user's transaction history.
      await tx.insert(transactionsTable).values({
        user_id: userId,
        type: "Withdrawal",
        amount: amountStr,
        description: `Investment placed — ${plan.name} Plan`,
        reference_id: `INV-${inv.id}`,
        status: "Completed",
      });

      return [inv];
    });

    res.status(201).json(
      toInvestmentResponse(row, {
        id: String(userId),
        name: userEmail,
        email: userEmail,
      }),
    );
  } catch (err) {
    logger.error({ err }, "Failed to create investment");
    res.status(500).json({ error: "SERVER_ERROR", message: "Could not create investment." });
  }
});

// PATCH /api/investments/:investmentId/status — admin updates investment status
router.patch("/:investmentId/status", requireAdmin, async (req, res) => {
  const rawId = req.params.investmentId;
  const id = parseInt(String(rawId), 10);
  if (isNaN(id)) {
    res.status(400).json({ title: "Invalid investment ID", detail: "Investment ID must be a number." });
    return;
  }

  const action = req.body?.action as InvestmentAction | undefined;
  if (!["activate", "pause", "complete", "cancel"].includes(action ?? "")) {
    res.status(400).json({ title: "Invalid action", detail: "Action must be activate, pause, complete, or cancel." });
    return;
  }

  try {
    const { db, investmentsTable } = await getDb();
    const { eq } = await import("drizzle-orm");

    const [existing] = await db
      .select()
      .from(investmentsTable)
      .where(eq(investmentsTable.id, id))
      .limit(1);

    if (!existing) {
      res.status(404).json({ title: "Investment not found", detail: "The requested investment does not exist." });
      return;
    }

    let newStatus: InvestmentStatus = existing.status as InvestmentStatus;
    let totalProfit: string | null = existing.total_profit;

    if (action === "activate") {
      newStatus = "Active";
    } else if (action === "pause") {
      // Keep Active status — pause is a display-only concept in this implementation
      newStatus = "Active";
    } else if (action === "complete") {
      newStatus = "Completed";
      const investmentAmount = Number(existing.investment_amount);
      const profitPct = Number(existing.profit_percentage);
      totalProfit = (investmentAmount * (profitPct / 100)).toFixed(2);
    } else if (action === "cancel") {
      newStatus = "Cancelled";
    }

    const [updated] = await db
      .update(investmentsTable)
      .set({
        status: newStatus,
        total_profit: totalProfit,
        updated_at: new Date(),
      })
      .where(eq(investmentsTable.id, id))
      .returning();

    const { usersTable } = await getDb();
    const [userRow] = await db
      .select({ email: usersTable.email, full_name: usersTable.full_name })
      .from(usersTable)
      .where(eq(usersTable.id, updated.user_id))
      .limit(1);

    res.json(
      toInvestmentResponse(updated, {
        id: String(updated.user_id),
        name: userRow?.full_name ?? "Unknown",
        email: userRow?.email ?? "",
      }),
    );
  } catch (err) {
    logger.error({ err }, "Failed to update investment status");
    res.status(500).json({ error: "SERVER_ERROR" });
  }
});

export default router;
