import { Router } from "express";
import { requireAuth } from "../middleware/requireAuth.js";
import { logger } from "../lib/logger.js";

const router = Router();

async function getDb() {
  return import("@workspace/db");
}

function parseCycleDays(cycle: string): number {
  const match = cycle.match(/\d+/);
  const num = match ? Number(match[0]) : 30;
  const lower = cycle.toLowerCase();
  if (lower.includes("hour")) return Math.max(1 / 24, num / 24);
  return num > 0 ? num : 30;
}

// GET /api/earnings/summary — daily / monthly / total profit + ROI for the current user
router.get("/summary", requireAuth, async (req, res) => {
  try {
    const userId = req.session.userId!;
    const { db, earningsTable, investmentsTable } = await getDb();
    const { eq, and, gte, lte, sum } = await import("drizzle-orm");

    const now = new Date();
    const todayStr = now.toISOString().split("T")[0]!;
    const firstOfMonth = new Date(now.getUTCFullYear(), now.getUTCMonth(), 1)
      .toISOString()
      .split("T")[0]!;

    const [daily, monthly, total, invested] = await Promise.all([
      db
        .select({ v: sum(earningsTable.amount) })
        .from(earningsTable)
        .where(and(eq(earningsTable.user_id, userId), eq(earningsTable.credit_date, todayStr))),

      db
        .select({ v: sum(earningsTable.amount) })
        .from(earningsTable)
        .where(
          and(
            eq(earningsTable.user_id, userId),
            gte(earningsTable.credit_date, firstOfMonth),
            lte(earningsTable.credit_date, todayStr),
          ),
        ),

      db
        .select({ v: sum(earningsTable.amount) })
        .from(earningsTable)
        .where(eq(earningsTable.user_id, userId)),

      db
        .select({ v: sum(investmentsTable.investment_amount) })
        .from(investmentsTable)
        .where(eq(investmentsTable.user_id, userId)),
    ]);

    const totalProfit = Number(total[0]?.v ?? 0);
    const totalInvested = Number(invested[0]?.v ?? 0);
    const roi = totalInvested > 0 ? (totalProfit / totalInvested) * 100 : 0;

    res.json({
      dailyEarnings: Number(daily[0]?.v ?? 0),
      monthlyEarnings: Number(monthly[0]?.v ?? 0),
      totalProfit,
      roi: Number(roi.toFixed(2)),
    });
  } catch (err) {
    logger.error({ err }, "Failed to fetch earnings summary");
    res.status(500).json({ error: "SERVER_ERROR" });
  }
});

// GET /api/earnings/history — all earning records for the current user, newest first
router.get("/history", requireAuth, async (req, res) => {
  try {
    const userId = req.session.userId!;
    const { db, earningsTable, investmentsTable } = await getDb();
    const { eq, desc } = await import("drizzle-orm");

    const rows = await db
      .select({
        id: earningsTable.id,
        investment_id: earningsTable.investment_id,
        amount: earningsTable.amount,
        credit_date: earningsTable.credit_date,
        created_at: earningsTable.created_at,
        plan_name: investmentsTable.plan_name,
        investment_amount: investmentsTable.investment_amount,
        profit_percentage: investmentsTable.profit_percentage,
        plan_execution_cycle: investmentsTable.plan_execution_cycle,
      })
      .from(earningsTable)
      .leftJoin(investmentsTable, eq(earningsTable.investment_id, investmentsTable.id))
      .where(eq(earningsTable.user_id, userId))
      .orderBy(desc(earningsTable.credit_date), desc(earningsTable.id));

    // Compute cumulative total (oldest → newest), then reverse for display
    const ascending = [...rows].reverse();
    let running = 0;
    const withCumulative = ascending.map((row) => {
      running += Number(row.amount);
      const cycleDays = parseCycleDays(row.plan_execution_cycle ?? "30 Days");
      const dailyRate = Number(row.profit_percentage ?? 0) / cycleDays;
      return {
        id: row.id,
        investmentId: row.investment_id,
        planName: row.plan_name ?? "—",
        investmentAmount: Number(row.investment_amount ?? 0),
        profitPercentage: Number(row.profit_percentage ?? 0),
        cycleDays,
        dailyRate: Number(dailyRate.toFixed(4)),
        amount: Number(row.amount),
        cumulativeTotal: Number(running.toFixed(2)),
        creditDate: row.credit_date,
        createdAt: row.created_at.toISOString(),
      };
    });

    // Newest first for the client
    res.json(withCumulative.reverse());
  } catch (err) {
    logger.error({ err }, "Failed to fetch earnings history");
    res.status(500).json({ error: "SERVER_ERROR" });
  }
});

export default router;
