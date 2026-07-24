import { pgTable, serial, integer, text, numeric, timestamp } from "drizzle-orm/pg-core";
import { usersTable } from "./users";

export const depositRequestsTable = pgTable("deposit_requests", {
  id: serial("id").primaryKey(),
  user_id: integer("user_id")
    .notNull()
    .references(() => usersTable.id, { onDelete: "cascade" }),
  plan_id: text("plan_id"),
  plan_name: text("plan_name"),
  amount: numeric("amount", { precision: 15, scale: 2 }).notNull(),
  approved_amount: numeric("approved_amount", { precision: 15, scale: 2 }),
  payment_method: text("payment_method").notNull().default("BTC"),
  transaction_id: text("transaction_id"),
  screenshot_data: text("screenshot_data"), // base64 data URL or external URL
  status: text("status")
    .$type<"Pending" | "Approved" | "Rejected">()
    .notNull()
    .default("Pending"),
  reviewed_by: text("reviewed_by"),
  reviewed_at: timestamp("reviewed_at"),
  created_at: timestamp("created_at").notNull().defaultNow(),
  updated_at: timestamp("updated_at").notNull().defaultNow(),
});

export type DepositRequest = typeof depositRequestsTable.$inferSelect;
export type InsertDepositRequest = typeof depositRequestsTable.$inferInsert;
