/**
 * Earnings cron — credits daily profit for every active investment.
 *
 * Runs every 60 seconds. For each Active investment it finds every calendar
 * day between start_date and today that has not yet been credited, then — in
 * a single DB transaction per day — inserts an earnings row, updates the
 * user's balance, and records a Profit transaction.
 *
 * The unique constraint on (investment_id, credit_date) makes each insert
 * idempotent: concurrent or repeated runs never double-credit.
 */

import { logger } from "../lib/logger.js";

/** Mirrors the helper in routes/investments.ts — no shared dep needed. */
function parseCycleDays(cycle: string): number {
  const match = cycle.match(/\d+/);
  const num = match ? Number(match[0]) : 30;
  const lower = cycle.toLowerCase();
  if (lower.includes("hour")) return Math.max(1 / 24, num / 24);
  return num > 0 ? num : 30;
}

/** Returns a YYYY-MM-DD string for a Date (UTC). */
function toDateStr(d: Date): string {
  return d.toISOString().split("T")[0]!;
}

async function creditEarningsForInvestment(investment: {
  id: number;
  user_id: number;
  plan_name: string;
  investment_amount: string;
  profit_percentage: string;
  plan_execution_cycle: string;
  start_date: Date;
  end_date: Date;
}): Promise<void> {
  const { db, earningsTable, transactionsTable, usersTable } = await import("@workspace/db");
  const { eq, sql } = await import("drizzle-orm");

  const cycleDays = parseCycleDays(investment.plan_execution_cycle);
  const dailyEarning = (
    (Number(investment.investment_amount) * Number(investment.profit_percentage)) /
    100 /
    cycleDays
  );
  if (dailyEarning <= 0) return;

  // Determine date window: [start_date, min(today, end_date)]
  const startDay = new Date(investment.start_date);
  startDay.setUTCHours(0, 0, 0, 0);
  const endDay = new Date(investment.end_date);
  endDay.setUTCHours(0, 0, 0, 0);
  const today = new Date();
  today.setUTCHours(0, 0, 0, 0);
  const creditUpTo = today < endDay ? today : endDay;

  if (creditUpTo < startDay) return;

  // Fetch already-credited dates for this investment
  const credited = await db
    .select({ credit_date: earningsTable.credit_date })
    .from(earningsTable)
    .where(eq(earningsTable.investment_id, investment.id));

  const creditedSet = new Set(credited.map((r: { credit_date: string }) => r.credit_date));

  const amountStr = dailyEarning.toFixed(2);

  // Walk each uncredited day and credit it
  const cursor = new Date(startDay);
  while (cursor <= creditUpTo) {
    const dateStr = toDateStr(cursor);

    if (!creditedSet.has(dateStr)) {
      try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        await (db as any).transaction(async (tx: any) => {
          // 1. Insert earning — skip silently if already credited by a concurrent run
          const [inserted] = await tx
            .insert(earningsTable)
            .values({
              user_id: investment.user_id,
              investment_id: investment.id,
              amount: amountStr,
              credit_date: dateStr,
            })
            .onConflictDoNothing()
            .returning({ id: earningsTable.id });

          if (!inserted) return; // another runner beat us to it

          // 2. Update user balance
          await tx
            .update(usersTable)
            .set({
              balance: sql`${usersTable.balance} + ${amountStr}::numeric`,
              updated_at: new Date(),
            })
            .where(eq(usersTable.id, investment.user_id));

          // 3. Record a Profit transaction
          await tx.insert(transactionsTable).values({
            user_id: investment.user_id,
            type: "Profit",
            amount: amountStr,
            description: `Daily profit from ${investment.plan_name}`,
            reference_id: `earning_${investment.id}_${dateStr}`,
            status: "Completed",
          });

          // 4. Accumulate total_profit on the investment row
          await tx.execute(
            sql`UPDATE investments SET total_profit = COALESCE(total_profit, 0) + ${amountStr}::numeric, updated_at = NOW() WHERE id = ${investment.id}`,
          );
        });
      } catch (err: unknown) {
        // Unique-constraint race on concurrent runs — safe to ignore
        const msg = err instanceof Error ? err.message : String(err);
        if (!msg.includes("earnings_investment_date_uniq")) {
          logger.error({ err, investmentId: investment.id, dateStr }, "Failed to credit earning");
        }
      }
    }

    cursor.setUTCDate(cursor.getUTCDate() + 1);
  }
}

async function runCreditCycle(): Promise<void> {
  try {
    const { db, investmentsTable } = await import("@workspace/db");
    const { eq } = await import("drizzle-orm");

    const active = await db
      .select()
      .from(investmentsTable)
      .where(eq(investmentsTable.status, "Active"));

    for (const inv of active) {
      await creditEarningsForInvestment(inv);
    }
  } catch (err) {
    logger.error({ err }, "Earnings cron cycle failed");
  }
}

/** Start the earnings cron. Runs immediately then every 60 seconds. */
export function startEarningsCron(): void {
  // Run immediately so earnings appear without waiting 60 s
  void runCreditCycle();
  setInterval(() => void runCreditCycle(), 60_000);
  logger.info("Earnings cron started (60 s interval)");
}
