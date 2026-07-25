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

console.log("Schema applied successfully.");
await pool.end();
