import { pgTable, text, numeric, integer, timestamp } from "drizzle-orm/pg-core";

export const investmentPlansTable = pgTable("investment_plans", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  min_investment: numeric("min_investment", { precision: 15, scale: 2 }).notNull(),
  max_investment: numeric("max_investment", { precision: 15, scale: 2 }),
  profit_percentage: numeric("profit_percentage", { precision: 8, scale: 4 }).notNull(),
  return_range: text("return_range"),
  execution_cycle: text("execution_cycle").notNull(),
  description: text("description").notNull().default(""),
  overview: text("overview"),
  features: text("features").array().notNull().default([]),
  status: text("status").$type<"Active" | "Disabled">().notNull().default("Active"),
  display_order: integer("display_order").notNull().default(0),
  investors: integer("investors").notNull().default(0),
  total_deposited: numeric("total_deposited", { precision: 15, scale: 2 }).notNull().default("0"),
  created_at: timestamp("created_at").notNull().defaultNow(),
  updated_at: timestamp("updated_at").notNull().defaultNow(),
});

export type DbInvestmentPlan = typeof investmentPlansTable.$inferSelect;
export type InsertInvestmentPlan = typeof investmentPlansTable.$inferInsert;
