import { pgTable, serial, integer, numeric, date, text, timestamp, unique } from "drizzle-orm/pg-core";
import { usersTable } from "./users";
import { investmentsTable } from "./investments";

export const earningsTable = pgTable(
  "earnings",
  {
    id: serial("id").primaryKey(),
    user_id: integer("user_id")
      .notNull()
      .references(() => usersTable.id, { onDelete: "cascade" }),
    investment_id: integer("investment_id")
      .notNull()
      .references(() => investmentsTable.id, { onDelete: "cascade" }),
    amount: numeric("amount", { precision: 15, scale: 2 }).notNull(),
    /** ISO date string YYYY-MM-DD — one auto row per investment per calendar day */
    credit_date: date("credit_date").notNull(),
    /** 'auto' = cron-credited daily profit; 'manual' = admin-credited manual profit */
    source: text("source").$type<"auto" | "manual">().notNull().default("auto"),
    created_at: timestamp("created_at").notNull().defaultNow(),
  },
  () => [
    /**
     * The real uniqueness is enforced by a partial SQL index (applied via migration):
     *   CREATE UNIQUE INDEX earnings_investment_date_uniq
     *     ON earnings (investment_id, credit_date) WHERE source = 'auto';
     *
     * This means:
     * - Auto cron: exactly one entry per (investment, date)          — protected
     * - Admin manual credits: unlimited per day per investment        — unrestricted
     *
     * Do NOT add a Drizzle unique() here — it cannot express partial indexes and
     * would recreate a full unique constraint that breaks multi-credit admin use.
     */
  ],
);

export type Earning = typeof earningsTable.$inferSelect;
export type InsertEarning = typeof earningsTable.$inferInsert;
