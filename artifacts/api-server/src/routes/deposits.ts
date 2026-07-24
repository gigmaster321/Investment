import { Router } from "express";
import { requireAuth, requireAdmin } from "../middleware/requireAuth.js";
import { logger } from "../lib/logger.js";
import { getInvestmentPlanById, parseCycleDaysFromCycle } from "./plans.js";

const router = Router();

async function getDb() {
  return import("@workspace/db");
}

// POST /api/deposits — create a deposit request (user)
router.post("/", requireAuth, async (req, res) => {
  const { amount, plan_id, plan_name, payment_method, transaction_id, screenshot_data } = req.body;

  const numericAmount = Number(amount);
  if (!amount || isNaN(numericAmount) || numericAmount <= 0) {
    res.status(400).json({ error: "INVALID_AMOUNT", message: "A valid positive amount is required." });
    return;
  }

  try {
    const { db, depositRequestsTable } = await getDb();

    const [deposit] = await db
      .insert(depositRequestsTable)
      .values({
        user_id: req.session.userId!,
        plan_id: plan_id ?? null,
        plan_name: plan_name ?? null,
        amount: numericAmount.toFixed(2),
        payment_method: payment_method ?? "BTC",
        transaction_id: transaction_id ?? null,
        screenshot_data: screenshot_data ?? null,
        status: "Pending",
      })
      .returning();

    res.status(201).json(deposit);
  } catch (err) {
    logger.error({ err }, "Failed to create deposit request");
    res.status(500).json({ error: "SERVER_ERROR", message: "Could not create deposit." });
  }
});

// GET /api/deposits — list deposits (user: own; admin: all with user info)
router.get("/", requireAuth, async (req, res) => {
  try {
    const { db, depositRequestsTable, usersTable } = await getDb();
    const { eq, desc } = await import("drizzle-orm");

    const isAdmin = req.session.userRole === "admin" || req.session.isAdmin === true;

    if (isAdmin) {
      const rows = await db
        .select({
          id: depositRequestsTable.id,
          user_id: depositRequestsTable.user_id,
          user_full_name: usersTable.full_name,
          user_email: usersTable.email,
          user_username: usersTable.username,
          plan_id: depositRequestsTable.plan_id,
          plan_name: depositRequestsTable.plan_name,
          amount: depositRequestsTable.amount,
          approved_amount: depositRequestsTable.approved_amount,
          payment_method: depositRequestsTable.payment_method,
          transaction_id: depositRequestsTable.transaction_id,
          screenshot_data: depositRequestsTable.screenshot_data,
          status: depositRequestsTable.status,
          reviewed_by: depositRequestsTable.reviewed_by,
          reviewed_at: depositRequestsTable.reviewed_at,
          created_at: depositRequestsTable.created_at,
          updated_at: depositRequestsTable.updated_at,
        })
        .from(depositRequestsTable)
        .leftJoin(usersTable, eq(depositRequestsTable.user_id, usersTable.id))
        .orderBy(desc(depositRequestsTable.created_at));
      res.json(rows);
    } else {
      const rows = await db
        .select()
        .from(depositRequestsTable)
        .where(eq(depositRequestsTable.user_id, req.session.userId!))
        .orderBy(desc(depositRequestsTable.created_at));
      res.json(rows);
    }
  } catch (err) {
    logger.error({ err }, "Failed to list deposits");
    res.status(500).json({ error: "SERVER_ERROR" });
  }
});

// GET /api/deposits/:id — single deposit
router.get("/:id", requireAuth, async (req, res) => {
  const id = parseInt(String(req.params.id), 10);
  if (isNaN(id)) {
    res.status(400).json({ error: "INVALID_ID" });
    return;
  }

  try {
    const { db, depositRequestsTable, usersTable } = await getDb();
    const { eq, and } = await import("drizzle-orm");

    const isAdmin = req.session.userRole === "admin" || req.session.isAdmin === true;

    const [row] = await db
      .select({
        id: depositRequestsTable.id,
        user_id: depositRequestsTable.user_id,
        user_full_name: usersTable.full_name,
        user_email: usersTable.email,
        user_username: usersTable.username,
        plan_id: depositRequestsTable.plan_id,
        plan_name: depositRequestsTable.plan_name,
        amount: depositRequestsTable.amount,
        approved_amount: depositRequestsTable.approved_amount,
        payment_method: depositRequestsTable.payment_method,
        transaction_id: depositRequestsTable.transaction_id,
        screenshot_data: depositRequestsTable.screenshot_data,
        status: depositRequestsTable.status,
        reviewed_by: depositRequestsTable.reviewed_by,
        reviewed_at: depositRequestsTable.reviewed_at,
        created_at: depositRequestsTable.created_at,
        updated_at: depositRequestsTable.updated_at,
      })
      .from(depositRequestsTable)
      .leftJoin(usersTable, eq(depositRequestsTable.user_id, usersTable.id))
      .where(
        isAdmin
          ? eq(depositRequestsTable.id, id)
          : and(eq(depositRequestsTable.id, id), eq(depositRequestsTable.user_id, req.session.userId!)),
      )
      .limit(1);

    if (!row) {
      res.status(404).json({ error: "NOT_FOUND" });
      return;
    }
    res.json(row);
  } catch (err) {
    logger.error({ err }, "Failed to fetch deposit");
    res.status(500).json({ error: "SERVER_ERROR" });
  }
});

// PATCH /api/deposits/:id/approve — admin approves a pending deposit
router.patch("/:id/approve", requireAdmin, async (req, res) => {
  const id = parseInt(String(req.params.id), 10);
  if (isNaN(id)) {
    res.status(400).json({ error: "INVALID_ID" });
    return;
  }

  try {
    const { db, depositRequestsTable, usersTable, transactionsTable } = await getDb();
    const { eq, sql } = await import("drizzle-orm");

    const [existing] = await db
      .select()
      .from(depositRequestsTable)
      .where(eq(depositRequestsTable.id, id))
      .limit(1);

    if (!existing) {
      res.status(404).json({ error: "NOT_FOUND", message: "Deposit request not found." });
      return;
    }
    if (existing.status !== "Pending") {
      res.status(409).json({ error: "NOT_PENDING", message: "Only pending deposits can be approved." });
      return;
    }

    const approvedAmount =
      req.body.approved_amount != null
        ? Number(req.body.approved_amount)
        : Number(existing.amount);

    if (isNaN(approvedAmount) || approvedAmount <= 0) {
      res.status(400).json({ error: "INVALID_AMOUNT", message: "Approved amount must be a positive number." });
      return;
    }

    const adminName = req.session.userEmail ?? "Admin";

    // 1. Mark deposit approved
    const [updated] = await db
      .update(depositRequestsTable)
      .set({
        status: "Approved",
        approved_amount: approvedAmount.toFixed(2),
        reviewed_by: adminName,
        reviewed_at: new Date(),
        updated_at: new Date(),
      })
      .where(eq(depositRequestsTable.id, id))
      .returning();

    // 2. Update user balance, total_deposit, current_plan
    await db
      .update(usersTable)
      .set({
        balance: sql`${usersTable.balance} + ${approvedAmount}`,
        total_deposit: sql`${usersTable.total_deposit} + ${approvedAmount}`,
        current_plan: existing.plan_id ?? usersTable.current_plan,
        updated_at: new Date(),
      })
      .where(eq(usersTable.id, existing.user_id));

    // 3. Create transaction record
    await db.insert(transactionsTable).values({
      user_id: existing.user_id,
      type: "Deposit",
      amount: approvedAmount.toFixed(2),
      description: `Deposit approved${existing.plan_name ? ` — ${existing.plan_name} Plan` : ""}`,
      reference_id: `DEP-${id}`,
      status: "Completed",
    });

    // 4. Auto-create active investment from the approved deposit
    const { investmentsTable } = await getDb();
    const plan = existing.plan_id ? getInvestmentPlanById(existing.plan_id) : null;
    const executionCycle = plan?.executionCycle ?? "30 Days";
    const profitPercentage = plan?.profitPercentage ?? 100;
    const cycleDays = parseCycleDaysFromCycle(executionCycle);
    const startDate = new Date();
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + cycleDays);

    await db.insert(investmentsTable).values({
      user_id: existing.user_id,
      deposit_request_id: existing.id,
      plan_id: existing.plan_id,
      plan_name: existing.plan_name ?? (plan?.name ?? "Investment"),
      plan_execution_cycle: executionCycle,
      investment_amount: approvedAmount.toFixed(2),
      profit_percentage: String(profitPercentage),
      start_date: startDate,
      end_date: endDate,
      status: "Active",
    });

    res.json(updated);
  } catch (err) {
    logger.error({ err }, "Failed to approve deposit");
    res.status(500).json({ error: "SERVER_ERROR" });
  }
});

// PATCH /api/deposits/:id/reject — admin rejects a pending deposit
router.patch("/:id/reject", requireAdmin, async (req, res) => {
  const id = parseInt(String(req.params.id), 10);
  if (isNaN(id)) {
    res.status(400).json({ error: "INVALID_ID" });
    return;
  }

  try {
    const { db, depositRequestsTable } = await getDb();
    const { eq } = await import("drizzle-orm");

    const [existing] = await db
      .select()
      .from(depositRequestsTable)
      .where(eq(depositRequestsTable.id, id))
      .limit(1);

    if (!existing) {
      res.status(404).json({ error: "NOT_FOUND", message: "Deposit request not found." });
      return;
    }
    if (existing.status !== "Pending") {
      res.status(409).json({ error: "NOT_PENDING", message: "Only pending deposits can be rejected." });
      return;
    }

    const adminName = req.session.userEmail ?? "Admin";

    const [updated] = await db
      .update(depositRequestsTable)
      .set({
        status: "Rejected",
        reviewed_by: adminName,
        reviewed_at: new Date(),
        updated_at: new Date(),
      })
      .where(eq(depositRequestsTable.id, id))
      .returning();

    res.json(updated);
  } catch (err) {
    logger.error({ err }, "Failed to reject deposit");
    res.status(500).json({ error: "SERVER_ERROR" });
  }
});

export default router;
