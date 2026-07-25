import { pgTable, serial, integer, numeric, date, timestamp, unique } from "drizzle-orm/pg-core";
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
    /** ISO date string YYYY-MM-DD — one row per investment per calendar day */
    credit_date: date("credit_date").notNull(),
    created_at: timestamp("created_at").notNull().defaultNow(),
  },
  (table) => [
    unique("earnings_investment_date_uniq").on(table.investment_id, table.credit_date),
  ],
);

export type Earning = typeof earningsTable.$inferSelect;
export type InsertEarning = typeof earningsTable.$inferInsert;
