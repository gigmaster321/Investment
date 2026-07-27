import { Router } from "express";
import { requireAuth, requireAdmin } from "../middleware/requireAuth.js";
import { logger } from "../lib/logger.js";
import { createNotification } from "../lib/notifications.js";

const router = Router();

async function getDb() {
  return import("@workspace/db");
}

// ── POST /api/withdrawals — user submits a withdrawal request ─────────────────

router.post("/", requireAuth, async (req, res) => {
  const { amount, method, crypto, wallet_address } = req.body ?? {};

  const numericAmount = Number(amount);
  if (!amount || isNaN(numericAmount) || numericAmount <= 0) {
    res.status(400).json({ error: "INVALID_AMOUNT", message: "A valid positive amount is required." });
    return;
  }
  if (!wallet_address || typeof wallet_address !== "string" || !wallet_address.trim()) {
    res.status(400).json({ error: "INVALID_WALLET", message: "Wallet address is required." });
    return;
  }
  if (!crypto || typeof crypto !== "string" || !crypto.trim()) {
    res.status(400).json({ error: "INVALID_CRYPTO", message: "Cryptocurrency is required." });
    return;
  }

  try {
    const { db, withdrawalRequestsTable, usersTable } = await getDb();
    const { eq } = await import("drizzle-orm");

    // Verify balance
    const [user] = await db
      .select({ balance: usersTable.balance })
      .from(usersTable)
      .where(eq(usersTable.id, req.session.userId!))
      .limit(1);

    if (!user) {
      res.status(404).json({ error: "USER_NOT_FOUND" });
      return;
    }

    const balance = Number(user.balance);
    if (numericAmount > balance) {
      res.status(400).json({
        error: "INSUFFICIENT_BALANCE",
        message: `Amount exceeds your available balance of $${balance.toFixed(2)}.`,
      });
      return;
    }

    const [withdrawal] = await db
      .insert(withdrawalRequestsTable)
      .values({
        user_id: req.session.userId!,
        amount: numericAmount.toFixed(2),
        method: typeof method === "string" && method.trim() ? method.trim() : "Crypto Withdrawal",
        crypto: crypto.trim().toUpperCase(),
        wallet_address: wallet_address.trim(),
        status: "Pending",
      })
      .returning();

    res.status(201).json(withdrawal);
  } catch (err) {
    logger.error({ err }, "Failed to create withdrawal request");
    res.status(500).json({ error: "SERVER_ERROR", message: "Could not create withdrawal request." });
  }
});

// ── GET /api/withdrawals — user: own; admin: all with user info ───────────────

router.get("/", requireAuth, async (req, res) => {
  try {
    const { db, withdrawalRequestsTable, usersTable } = await getDb();
    const { eq, desc } = await import("drizzle-orm");

    const isAdmin = req.session.userRole === "admin" || req.session.isAdmin === true;

    if (isAdmin) {
      const rows = await db
        .select({
          id: withdrawalRequestsTable.id,
          user_id: withdrawalRequestsTable.user_id,
          user_full_name: usersTable.full_name,
          user_email: usersTable.email,
          user_username: usersTable.username,
          amount: withdrawalRequestsTable.amount,
          method: withdrawalRequestsTable.method,
          crypto: withdrawalRequestsTable.crypto,
          wallet_address: withdrawalRequestsTable.wallet_address,
          status: withdrawalRequestsTable.status,
          approved_amount: withdrawalRequestsTable.approved_amount,
          reviewed_by: withdrawalRequestsTable.reviewed_by,
          reviewed_at: withdrawalRequestsTable.reviewed_at,
          created_at: withdrawalRequestsTable.created_at,
          updated_at: withdrawalRequestsTable.updated_at,
        })
        .from(withdrawalRequestsTable)
        .leftJoin(usersTable, eq(withdrawalRequestsTable.user_id, usersTable.id))
        .orderBy(desc(withdrawalRequestsTable.created_at));
      res.json(rows);
    } else {
      const rows = await db
        .select()
        .from(withdrawalRequestsTable)
        .where(eq(withdrawalRequestsTable.user_id, req.session.userId!))
        .orderBy(desc(withdrawalRequestsTable.created_at));
      res.json(rows);
    }
  } catch (err) {
    logger.error({ err }, "Failed to list withdrawals");
    res.status(500).json({ error: "SERVER_ERROR" });
  }
});

// ── PATCH /api/withdrawals/:id/approve — admin approves ──────────────────────

router.patch("/:id/approve", requireAdmin, async (req, res) => {
  const id = parseInt(String(req.params.id), 10);
  if (isNaN(id)) {
    res.status(400).json({ error: "INVALID_ID" });
    return;
  }

  try {
    const { db, withdrawalRequestsTable, usersTable, transactionsTable } = await getDb();
    const { eq, sql } = await import("drizzle-orm");

    const [existing] = await db
      .select()
      .from(withdrawalRequestsTable)
      .where(eq(withdrawalRequestsTable.id, id))
      .limit(1);

    if (!existing) {
      res.status(404).json({ error: "NOT_FOUND", message: "Withdrawal request not found." });
      return;
    }
    if (existing.status !== "Pending") {
      res.status(409).json({ error: "NOT_PENDING", message: "Only pending withdrawals can be approved." });
      return;
    }

    const approvedAmount =
      req.body?.approved_amount != null
        ? Number(req.body.approved_amount)
        : Number(existing.amount);

    if (isNaN(approvedAmount) || approvedAmount <= 0) {
      res.status(400).json({ error: "INVALID_AMOUNT", message: "Approved amount must be a positive number." });
      return;
    }

    const adminName = req.session.userEmail ?? "Admin";

    // 1. Mark withdrawal approved
    const [updated] = await db
      .update(withdrawalRequestsTable)
      .set({
        status: "Approved",
        approved_amount: approvedAmount.toFixed(2),
        reviewed_by: adminName,
        reviewed_at: new Date(),
        updated_at: new Date(),
      })
      .where(eq(withdrawalRequestsTable.id, id))
      .returning();

    // 2. Deduct approved amount from balance; increment total_withdrawal
    await db
      .update(usersTable)
      .set({
        balance: sql`GREATEST(0, ${usersTable.balance} - ${approvedAmount})`,
        total_withdrawal: sql`${usersTable.total_withdrawal} + ${approvedAmount}`,
        updated_at: new Date(),
      })
      .where(eq(usersTable.id, existing.user_id));

    // 3. Write a transaction record
    const walletSnippet =
      existing.wallet_address.length > 12
        ? existing.wallet_address.slice(0, 12) + "…"
        : existing.wallet_address;

    await db.insert(transactionsTable).values({
      user_id: existing.user_id,
      type: "Withdrawal",
      amount: approvedAmount.toFixed(2),
      description: `Withdrawal approved — ${existing.crypto} to ${walletSnippet}`,
      reference_id: `WDL-${id}`,
      status: "Completed",
    });

    await createNotification(
      existing.user_id,
      "Withdrawal",
      "Withdrawal Processed",
      `$${approvedAmount.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} withdrawal sent to your ${existing.crypto} wallet (${walletSnippet}).`,
    );

    res.json(updated);
  } catch (err) {
    logger.error({ err }, "Failed to approve withdrawal");
    res.status(500).json({ error: "SERVER_ERROR" });
  }
});

// ── PATCH /api/withdrawals/:id/reject — admin rejects ────────────────────────

router.patch("/:id/reject", requireAdmin, async (req, res) => {
  const id = parseInt(String(req.params.id), 10);
  if (isNaN(id)) {
    res.status(400).json({ error: "INVALID_ID" });
    return;
  }

  try {
    const { db, withdrawalRequestsTable } = await getDb();
    const { eq } = await import("drizzle-orm");

    const [existing] = await db
      .select()
      .from(withdrawalRequestsTable)
      .where(eq(withdrawalRequestsTable.id, id))
      .limit(1);

    if (!existing) {
      res.status(404).json({ error: "NOT_FOUND", message: "Withdrawal request not found." });
      return;
    }
    if (existing.status !== "Pending") {
      res.status(409).json({ error: "NOT_PENDING", message: "Only pending withdrawals can be rejected." });
      return;
    }

    const adminName = req.session.userEmail ?? "Admin";

    const [updated] = await db
      .update(withdrawalRequestsTable)
      .set({
        status: "Rejected",
        reviewed_by: adminName,
        reviewed_at: new Date(),
        updated_at: new Date(),
      })
      .where(eq(withdrawalRequestsTable.id, id))
      .returning();

    await createNotification(
      existing.user_id,
      "Withdrawal",
      "Withdrawal Rejected",
      `Your withdrawal request for $${Number(existing.amount).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} was not approved.`,
    );

    res.json(updated);
  } catch (err) {
    logger.error({ err }, "Failed to reject withdrawal");
    res.status(500).json({ error: "SERVER_ERROR" });
  }
});

export default router;
