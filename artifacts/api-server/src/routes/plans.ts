import { Router, type IRouter } from "express";
import { requireAdmin } from "../middleware/requireAuth.js";
import { logger } from "../lib/logger.js";

export type PlanStatus = "Active" | "Disabled";

export interface InvestmentPlan {
  id: string;
  name: string;
  minInvestment: number;
  maxInvestment: number | null;
  profitPercentage: number;
  returnRange?: string;
  executionCycle: string;
  description: string;
  overview?: string;
  features: string[];
  status: PlanStatus;
  displayOrder: number;
  investors: number;
  totalDeposited: number;
}

type PlanInput = Omit<InvestmentPlan, "id" | "investors" | "totalDeposited">;

async function getDb() {
  return import("@workspace/db");
}

// ── DB row → API shape ────────────────────────────────────────────────────────

function rowToPlan(row: {
  id: string;
  name: string;
  min_investment: string;
  max_investment: string | null;
  profit_percentage: string;
  return_range: string | null;
  execution_cycle: string;
  description: string;
  overview: string | null;
  features: string[];
  status: string;
  display_order: number;
  investors: number;
  total_deposited: string;
}): InvestmentPlan {
  return {
    id: row.id,
    name: row.name,
    minInvestment: Number(row.min_investment),
    maxInvestment: row.max_investment != null ? Number(row.max_investment) : null,
    profitPercentage: Number(row.profit_percentage),
    returnRange: row.return_range ?? undefined,
    executionCycle: row.execution_cycle,
    description: row.description,
    overview: row.overview ?? undefined,
    features: row.features,
    status: row.status as PlanStatus,
    displayOrder: row.display_order,
    investors: row.investors,
    totalDeposited: Number(row.total_deposited),
  };
}

// ── Exported helpers (used by investments.ts and deposits.ts) ─────────────────

export async function getInvestmentPlanById(id: string): Promise<InvestmentPlan | undefined> {
  try {
    const { db, investmentPlansTable } = await getDb();
    const { eq } = await import("drizzle-orm");
    const [row] = await db
      .select()
      .from(investmentPlansTable)
      .where(eq(investmentPlansTable.id, id))
      .limit(1);
    return row ? rowToPlan(row) : undefined;
  } catch (err) {
    logger.error({ err }, "getInvestmentPlanById failed");
    return undefined;
  }
}

/** Pure helper — kept sync so existing callers need no change. */
export function parseCycleDaysFromCycle(cycle: string): number {
  const match = cycle.match(/\d+/);
  const num = match ? Number(match[0]) : 30;
  const lower = cycle.toLowerCase();
  if (lower.includes("hour")) return Math.max(1 / 24, num / 24);
  return num > 0 ? num : 30;
}

// ── Validation ────────────────────────────────────────────────────────────────

function validatePlanInput(value: unknown): value is PlanInput {
  if (!value || typeof value !== "object") return false;
  const input = value as Partial<PlanInput>;
  return (
    typeof input.name === "string" &&
    input.name.trim().length > 0 &&
    typeof input.minInvestment === "number" &&
    input.minInvestment >= 0 &&
    (input.maxInvestment === null ||
      (typeof input.maxInvestment === "number" && input.maxInvestment >= input.minInvestment)) &&
    typeof input.profitPercentage === "number" &&
    input.profitPercentage >= 0 &&
    typeof input.executionCycle === "string" &&
    input.executionCycle.trim().length > 0 &&
    typeof input.description === "string" &&
    Array.isArray(input.features) &&
    input.features.every((f) => typeof f === "string" && f.trim().length > 0) &&
    (input.status === "Active" || input.status === "Disabled") &&
    typeof input.displayOrder === "number" &&
    Number.isInteger(input.displayOrder) &&
    input.displayOrder >= 0
  );
}

function badRequest(res: Parameters<IRouter["post"]>[1] extends never ? never : any, detail: string) {
  res.status(400).json({ title: "Invalid plan", detail });
}

/** Generate a unique slug from a plan name. */
async function generateId(name: string): Promise<string> {
  const { db, investmentPlansTable } = await getDb();
  const { eq } = await import("drizzle-orm");

  const baseId = name.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "plan";
  let id = baseId;
  let suffix = 2;
  while (true) {
    const [existing] = await db
      .select({ id: investmentPlansTable.id })
      .from(investmentPlansTable)
      .where(eq(investmentPlansTable.id, id))
      .limit(1);
    if (!existing) return id;
    id = `${baseId}-${suffix++}`;
  }
}

// ── Router ────────────────────────────────────────────────────────────────────

const router: IRouter = Router();

// GET /api/plans
router.get("/", async (_req, res) => {
  try {
    const { db, investmentPlansTable } = await getDb();
    const { asc } = await import("drizzle-orm");
    const rows = await db
      .select()
      .from(investmentPlansTable)
      .orderBy(asc(investmentPlansTable.display_order));
    res.json(rows.map(rowToPlan));
  } catch (err) {
    logger.error({ err }, "Failed to list plans");
    res.status(500).json({ error: "SERVER_ERROR" });
  }
});

// GET /api/plans/:planId
router.get("/:planId", async (req, res) => {
  try {
    const plan = await getInvestmentPlanById(String(req.params.planId));
    if (!plan) {
      res.status(404).json({ title: "Plan not found", detail: "The requested investment plan does not exist." });
      return;
    }
    res.json(plan);
  } catch (err) {
    logger.error({ err }, "Failed to fetch plan");
    res.status(500).json({ error: "SERVER_ERROR" });
  }
});

// POST /api/plans — create plan (admin)
router.post("/", requireAdmin, async (req, res) => {
  if (!validatePlanInput(req.body)) {
    badRequest(res, "Provide a name, valid investment range, profit percentage, execution cycle, description, features, status, and display order.");
    return;
  }

  try {
    const { db, investmentPlansTable } = await getDb();
    const id = await generateId(req.body.name);

    const [row] = await db
      .insert(investmentPlansTable)
      .values({
        id,
        name: req.body.name.trim(),
        min_investment: req.body.minInvestment.toFixed(2),
        max_investment: req.body.maxInvestment != null ? req.body.maxInvestment.toFixed(2) : null,
        profit_percentage: String(req.body.profitPercentage),
        return_range: req.body.returnRange ?? null,
        execution_cycle: req.body.executionCycle.trim(),
        description: req.body.description.trim(),
        overview: req.body.overview ?? null,
        features: req.body.features.map((f: string) => f.trim()).filter(Boolean),
        status: req.body.status,
        display_order: req.body.displayOrder,
        investors: 0,
        total_deposited: "0",
      })
      .returning();

    res.status(201).json(rowToPlan(row));
  } catch (err) {
    logger.error({ err }, "Failed to create plan");
    res.status(500).json({ error: "SERVER_ERROR" });
  }
});

// PUT /api/plans/:planId — replace plan (admin)
router.put("/:planId", requireAdmin, async (req, res) => {
  if (!validatePlanInput(req.body)) {
    badRequest(res, "Provide all required plan fields with valid values.");
    return;
  }

  try {
    const { db, investmentPlansTable } = await getDb();
    const { eq } = await import("drizzle-orm");
    const planId = String(req.params.planId);

    const [existing] = await db
      .select({ investors: investmentPlansTable.investors, total_deposited: investmentPlansTable.total_deposited })
      .from(investmentPlansTable)
      .where(eq(investmentPlansTable.id, planId))
      .limit(1);

    if (!existing) {
      res.status(404).json({ title: "Plan not found", detail: "The requested investment plan does not exist." });
      return;
    }

    const [row] = await db
      .update(investmentPlansTable)
      .set({
        name: req.body.name.trim(),
        min_investment: req.body.minInvestment.toFixed(2),
        max_investment: req.body.maxInvestment != null ? req.body.maxInvestment.toFixed(2) : null,
        profit_percentage: String(req.body.profitPercentage),
        return_range: req.body.returnRange ?? null,
        execution_cycle: req.body.executionCycle.trim(),
        description: req.body.description.trim(),
        overview: req.body.overview ?? null,
        features: req.body.features.map((f: string) => f.trim()).filter(Boolean),
        status: req.body.status,
        display_order: req.body.displayOrder,
        updated_at: new Date(),
      })
      .where(eq(investmentPlansTable.id, planId))
      .returning();

    res.json(rowToPlan(row));
  } catch (err) {
    logger.error({ err }, "Failed to update plan");
    res.status(500).json({ error: "SERVER_ERROR" });
  }
});

// PATCH /api/plans/:planId/status — toggle status (admin)
router.patch("/:planId/status", requireAdmin, async (req, res) => {
  if (req.body?.status !== "Active" && req.body?.status !== "Disabled") {
    badRequest(res, 'Status must be either "Active" or "Disabled".');
    return;
  }

  try {
    const { db, investmentPlansTable } = await getDb();
    const { eq } = await import("drizzle-orm");
    const planId = String(req.params.planId);

    const [existing] = await db
      .select({ id: investmentPlansTable.id })
      .from(investmentPlansTable)
      .where(eq(investmentPlansTable.id, planId))
      .limit(1);

    if (!existing) {
      res.status(404).json({ title: "Plan not found", detail: "The requested investment plan does not exist." });
      return;
    }

    const [row] = await db
      .update(investmentPlansTable)
      .set({ status: req.body.status as PlanStatus, updated_at: new Date() })
      .where(eq(investmentPlansTable.id, planId))
      .returning();

    res.json(rowToPlan(row));
  } catch (err) {
    logger.error({ err }, "Failed to update plan status");
    res.status(500).json({ error: "SERVER_ERROR" });
  }
});

// DELETE /api/plans/:planId (admin)
router.delete("/:planId", requireAdmin, async (req, res) => {
  try {
    const { db, investmentPlansTable } = await getDb();
    const { eq } = await import("drizzle-orm");
    const planId = String(req.params.planId);

    const [deleted] = await db
      .delete(investmentPlansTable)
      .where(eq(investmentPlansTable.id, planId))
      .returning({ id: investmentPlansTable.id });

    if (!deleted) {
      res.status(404).json({ title: "Plan not found", detail: "The requested investment plan does not exist." });
      return;
    }

    res.json({ success: true, message: `Plan ${planId} deleted.` });
  } catch (err) {
    logger.error({ err }, "Failed to delete plan");
    res.status(500).json({ error: "SERVER_ERROR" });
  }
});

export default router;
