import { pgTable, serial, integer, text, numeric, timestamp } from "drizzle-orm/pg-core";
import { usersTable } from "./users";
import { depositRequestsTable } from "./deposit_requests";

export const investmentsTable = pgTable("investments", {
  id: serial("id").primaryKey(),
  user_id: integer("user_id")
    .notNull()
    .references(() => usersTable.id, { onDelete: "cascade" }),
  deposit_request_id: integer("deposit_request_id").references(
    () => depositRequestsTable.id,
    { onDelete: "set null" },
  ),
  plan_id: text("plan_id"),
  plan_name: text("plan_name").notNull(),
  plan_execution_cycle: text("plan_execution_cycle").notNull().default("30 Days"),
  investment_amount: numeric("investment_amount", { precision: 15, scale: 2 }).notNull(),
  profit_percentage: numeric("profit_percentage", { precision: 8, scale: 4 }).notNull().default("100"),
  start_date: timestamp("start_date").notNull().defaultNow(),
  end_date: timestamp("end_date").notNull(),
  status: text("status")
    .$type<"Active" | "Completed" | "Expired" | "Cancelled">()
    .notNull()
    .default("Active"),
  total_profit: numeric("total_profit", { precision: 15, scale: 2 }),
  created_at: timestamp("created_at").notNull().defaultNow(),
  updated_at: timestamp("updated_at").notNull().defaultNow(),
});

export type DbInvestment = typeof investmentsTable.$inferSelect;
export type InsertInvestment = typeof investmentsTable.$inferInsert;
