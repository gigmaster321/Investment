import { pgTable, serial, text, boolean, timestamp } from "drizzle-orm/pg-core";

export const depositWalletsTable = pgTable("deposit_wallets", {
  id: serial("id").primaryKey(),
  coin_id: text("coin_id").notNull().unique(),
  name: text("name").notNull(),
  ticker: text("ticker").notNull(),
  network: text("network").notNull(),
  address: text("address").notNull().default(""),
  is_active: boolean("is_active").notNull().default(true),
  updated_at: timestamp("updated_at").notNull().defaultNow(),
});

export type DepositWallet = typeof depositWalletsTable.$inferSelect;
export type InsertDepositWallet = typeof depositWalletsTable.$inferInsert;
