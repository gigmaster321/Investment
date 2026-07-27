import { pgTable, serial, integer, text, boolean, timestamp } from "drizzle-orm/pg-core";
import { usersTable } from "./users";

export const notificationsTable = pgTable("notifications", {
  id: serial("id").primaryKey(),
  user_id: integer("user_id")
    .notNull()
    .references(() => usersTable.id, { onDelete: "cascade" }),
  /** Maps to the filter tabs in the UI */
  type: text("type")
    .$type<"Investment" | "Deposit" | "Withdrawal" | "System">()
    .notNull(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  read: boolean("read").notNull().default(false),
  created_at: timestamp("created_at").notNull().defaultNow(),
});

export type Notification = typeof notificationsTable.$inferSelect;
export type InsertNotification = typeof notificationsTable.$inferInsert;
