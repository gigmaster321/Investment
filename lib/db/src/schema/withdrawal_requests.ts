import { pgTable, serial, integer, text, numeric, timestamp } from "drizzle-orm/pg-core";
import { usersTable } from "./users";

export const withdrawalRequestsTable = pgTable("withdrawal_requests", {
  id: serial("id").primaryKey(),
  user_id: integer("user_id")
    .notNull()
    .references(() => usersTable.id, { onDelete: "cascade" }),
  amount: numeric("amount", { precision: 15, scale: 2 }).notNull(),
  method: text("method").notNull().default("Crypto Withdrawal"),
  crypto: text("crypto").notNull(),
  wallet_address: text("wallet_address").notNull(),
  status: text("status")
    .$type<"Pending" | "Approved" | "Rejected">()
    .notNull()
    .default("Pending"),
  approved_amount: numeric("approved_amount", { precision: 15, scale: 2 }),
  reviewed_by: text("reviewed_by"),
  reviewed_at: timestamp("reviewed_at"),
  created_at: timestamp("created_at").notNull().defaultNow(),
  updated_at: timestamp("updated_at").notNull().defaultNow(),
});

export type WithdrawalRequest = typeof withdrawalRequestsTable.$inferSelect;
export type InsertWithdrawalRequest = typeof withdrawalRequestsTable.$inferInsert;
