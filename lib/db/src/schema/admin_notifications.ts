import { pgTable, serial, text, boolean, timestamp } from "drizzle-orm/pg-core";

export const adminNotificationsTable = pgTable("admin_notifications", {
  id: serial("id").primaryKey(),
  type: text("type")
    .$type<"Deposit" | "Withdrawal" | "User" | "System">()
    .notNull(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  read: boolean("read").notNull().default(false),
  created_at: timestamp("created_at").notNull().defaultNow(),
});

export type AdminNotification = typeof adminNotificationsTable.$inferSelect;
export type InsertAdminNotification = typeof adminNotificationsTable.$inferInsert;
