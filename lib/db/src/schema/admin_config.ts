import { pgTable, text, timestamp } from "drizzle-orm/pg-core";

/**
 * Single-row key/value store for admin configuration.
 * Currently used to persist the hashed admin password so it can be changed at runtime.
 */
export const adminConfigTable = pgTable("admin_config", {
  key: text("key").primaryKey(),
  value: text("value").notNull(),
  updated_at: timestamp("updated_at").notNull().defaultNow(),
});

export type AdminConfig = typeof adminConfigTable.$inferSelect;
