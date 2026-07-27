/**
 * Non-interactive, idempotent database migration runner.
 * Uses raw SQL with IF NOT EXISTS guards — safe on both fresh and existing DBs.
 * Run via: pnpm --filter @workspace/db run migrate
 */
import pg from "pg";

const { Pool } = pg;

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL must be set before running migrations.");
}

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

console.log("Applying schema migrations…");

await pool.query(`
  CREATE TABLE IF NOT EXISTS "users" (
    "id" serial PRIMARY KEY NOT NULL,
    "full_name" text NOT NULL,
    "username" text NOT NULL,
    "email" text NOT NULL,
    "phone" text,
    "password" text NOT NULL,
    "role" text DEFAULT 'user' NOT NULL,
    "email_verified" boolean DEFAULT false NOT NULL,
    "account_status" text DEFAULT 'active' NOT NULL,
    "balance" numeric(15, 2) DEFAULT '0' NOT NULL,
    "total_deposit" numeric(15, 2) DEFAULT '0' NOT NULL,
    "total_withdrawal" numeric(15, 2) DEFAULT '0' NOT NULL,
    "current_plan" text,
    "created_at" timestamp DEFAULT now() NOT NULL,
    "updated_at" timestamp DEFAULT now() NOT NULL,
    CONSTRAINT "users_username_unique" UNIQUE("username"),
    CONSTRAINT "users_email_unique" UNIQUE("email")
  );

  CREATE TABLE IF NOT EXISTS "email_otps" (
    "id" serial PRIMARY KEY NOT NULL,
    "user_id" integer NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
    "code" text NOT NULL,
    "expires_at" timestamp NOT NULL,
    "used" boolean DEFAULT false NOT NULL,
    "created_at" timestamp DEFAULT now() NOT NULL
  );

  CREATE TABLE IF NOT EXISTS "deposit_requests" (
    "id" serial PRIMARY KEY NOT NULL,
    "user_id" integer NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
    "plan_id" text,
    "plan_name" text,
    "amount" numeric(15, 2) NOT NULL,
    "approved_amount" numeric(15, 2),
    "payment_method" text DEFAULT 'BTC' NOT NULL,
    "transaction_id" text,
    "screenshot_data" text,
    "status" text DEFAULT 'Pending' NOT NULL,
    "reviewed_by" text,
    "reviewed_at" timestamp,
    "created_at" timestamp DEFAULT now() NOT NULL,
    "updated_at" timestamp DEFAULT now() NOT NULL
  );

  CREATE TABLE IF NOT EXISTS "transactions" (
    "id" serial PRIMARY KEY NOT NULL,
    "user_id" integer NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
    "type" text NOT NULL,
    "amount" numeric(15, 2) NOT NULL,
    "description" text,
    "reference_id" text,
    "status" text DEFAULT 'Completed' NOT NULL,
    "created_at" timestamp DEFAULT now() NOT NULL
  );

  CREATE TABLE IF NOT EXISTS "investments" (
    "id" serial PRIMARY KEY NOT NULL,
    "user_id" integer NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
    "deposit_request_id" integer REFERENCES "deposit_requests"("id") ON DELETE SET NULL,
    "plan_id" text,
    "plan_name" text NOT NULL,
    "plan_execution_cycle" text DEFAULT '30 Days' NOT NULL,
    "investment_amount" numeric(15, 2) NOT NULL,
    "profit_percentage" numeric(8, 4) DEFAULT '100' NOT NULL,
    "start_date" timestamp DEFAULT now() NOT NULL,
    "end_date" timestamp NOT NULL,
    "status" text DEFAULT 'Active' NOT NULL,
    "total_profit" numeric(15, 2),
    "created_at" timestamp DEFAULT now() NOT NULL,
    "updated_at" timestamp DEFAULT now() NOT NULL
  );
`);

await pool.query(`
  CREATE TABLE IF NOT EXISTS "investment_plans" (
    "id" text PRIMARY KEY NOT NULL,
    "name" text NOT NULL,
    "min_investment" numeric(15, 2) NOT NULL,
    "max_investment" numeric(15, 2),
    "profit_percentage" numeric(8, 4) NOT NULL,
    "return_range" text,
    "execution_cycle" text NOT NULL,
    "description" text NOT NULL DEFAULT '',
    "overview" text,
    "features" text[] NOT NULL DEFAULT '{}',
    "status" text NOT NULL DEFAULT 'Active',
    "display_order" integer NOT NULL DEFAULT 0,
    "investors" integer NOT NULL DEFAULT 0,
    "total_deposited" numeric(15, 2) NOT NULL DEFAULT '0',
    "created_at" timestamp DEFAULT now() NOT NULL,
    "updated_at" timestamp DEFAULT now() NOT NULL
  );
`);

/* Seed the three default plans — idempotent, never overwrites admin edits. */
await pool.query(`
  INSERT INTO "investment_plans"
    ("id","name","min_investment","max_investment","profit_percentage","return_range",
     "execution_cycle","description","overview","features","status","display_order","investors","total_deposited")
  VALUES
    ('starter-ai','Starter AI',1000,10000,200,'200% – 350%','24 Hours',
     'Based on historical backtesting and volatility-adjusted strategy modeling.',
     'Designed for new investors seeking structured exposure to innovation-focused equities with automated risk controls.',
     ARRAY['Automated trade execution','Risk-adjusted capital deployment','Portfolio rebalancing','Monthly performance reporting'],
     'Active',1,1842,284100),
    ('growth-ai','Growth AI',10000,100000,350,'350% – 550%','3 Days',
     'Advanced signal detection with volatility-aware execution framework.',
     'Enhanced AI signal modeling focused on high-growth innovation sectors and dynamic capital rotation.',
     ARRAY['High-frequency signal detection','Sector rotation strategy','Volatility hedging logic','Weekly analytics dashboard'],
     'Active',2,1203,3600000),
    ('elite-ai','Elite AI',100000,NULL,700,'+700%','5 Days',
     'Multi-layered AI execution across diversified innovation assets.',
     'Designed for large capital deployment with structured downside protection and dynamic reallocation systems.',
     ARRAY['Cross-sector AI allocation engine','Downside risk containment protocol','Real-time capital rebalancing','Dedicated strategy oversight'],
     'Active',3,614,18200000)
  ON CONFLICT (id) DO NOTHING;
`);

await pool.query(`
  CREATE TABLE IF NOT EXISTS "withdrawal_requests" (
    "id" serial PRIMARY KEY NOT NULL,
    "user_id" integer NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
    "amount" numeric(15, 2) NOT NULL,
    "method" text NOT NULL DEFAULT 'Crypto Withdrawal',
    "crypto" text NOT NULL,
    "wallet_address" text NOT NULL,
    "status" text NOT NULL DEFAULT 'Pending',
    "approved_amount" numeric(15, 2),
    "reviewed_by" text,
    "reviewed_at" timestamp,
    "created_at" timestamp NOT NULL DEFAULT now(),
    "updated_at" timestamp NOT NULL DEFAULT now()
  );
`);

await pool.query(`
  CREATE TABLE IF NOT EXISTS "earnings" (
    "id" serial PRIMARY KEY NOT NULL,
    "user_id" integer NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
    "investment_id" integer NOT NULL REFERENCES "investments"("id") ON DELETE CASCADE,
    "amount" numeric(15, 2) NOT NULL,
    "credit_date" date NOT NULL,
    "created_at" timestamp DEFAULT now() NOT NULL,
    CONSTRAINT "earnings_investment_date_uniq" UNIQUE("investment_id", "credit_date")
  );
`);

await pool.query(`
  CREATE TABLE IF NOT EXISTS "notifications" (
    "id" serial PRIMARY KEY NOT NULL,
    "user_id" integer NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
    "type" text NOT NULL,
    "title" text NOT NULL,
    "description" text NOT NULL,
    "read" boolean DEFAULT false NOT NULL,
    "created_at" timestamp DEFAULT now() NOT NULL
  );
  CREATE INDEX IF NOT EXISTS "notifications_user_id_idx" ON "notifications"("user_id");
  CREATE INDEX IF NOT EXISTS "notifications_user_created_idx" ON "notifications"("user_id", "created_at" DESC);
`);

await pool.query(`
  CREATE TABLE IF NOT EXISTS "deposit_wallets" (
    "id"         serial    PRIMARY KEY NOT NULL,
    "coin_id"    text      NOT NULL UNIQUE,
    "name"       text      NOT NULL,
    "ticker"     text      NOT NULL,
    "network"    text      NOT NULL,
    "address"    text      NOT NULL DEFAULT '',
    "is_active"  boolean   NOT NULL DEFAULT true,
    "updated_at" timestamp NOT NULL DEFAULT now()
  );
`);

console.log("Schema applied successfully.");
await pool.end();
