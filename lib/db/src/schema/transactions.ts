import { pgTable, serial, integer, text, numeric, timestamp } from "drizzle-orm/pg-core";
import { usersTable } from "./users";

export const transactionsTable = pgTable("transactions", {
  id: serial("id").primaryKey(),
  user_id: integer("user_id")
    .notNull()
    .references(() => usersTable.id, { onDelete: "cascade" }),
  type: text("type")
    .$type<"Deposit" | "Withdrawal" | "Profit">()
    .notNull(),
  amount: numeric("amount", { precision: 15, scale: 2 }).notNull(),
  description: text("description"),
  reference_id: text("reference_id"),
  status: text("status")
    .$type<"Pending" | "Completed" | "Rejected">()
    .notNull()
    .default("Completed"),
  created_at: timestamp("created_at").notNull().defaultNow(),
});

export type Transaction = typeof transactionsTable.$inferSelect;
export type InsertTransaction = typeof transactionsTable.$inferInsert;
