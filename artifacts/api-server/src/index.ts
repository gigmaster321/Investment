import app from "./app";
import { logger } from "./lib/logger";
import { seedAdminUser } from "./services/auth.js";
import { startEarningsCron } from "./services/earningsCron.js";

const rawPort = process.env["PORT"];

if (!rawPort) {
  throw new Error(
    "PORT environment variable is required but was not provided.",
  );
}

const port = Number(rawPort);

if (Number.isNaN(port) || port <= 0) {
  throw new Error(`Invalid PORT value: "${rawPort}"`);
}

/**
 * Ensure the full database schema is present before the server starts.
 *
 * All statements use CREATE TABLE IF NOT EXISTS / CREATE INDEX IF NOT EXISTS
 * so this is idempotent — safe to run on every startup against an already-
 * migrated database.
 *
 * Why here instead of a separate migration step?
 * In the Replit environment the server may start before a human has manually
 * run migrations. Running migrations inline guarantees the tables always exist
 * when the first request arrives, eliminating the "relation does not exist"
 * 500 errors that surface as "Registration failed. Please try again."
 */
async function ensureDatabase(): Promise<void> {
  if (!process.env["DATABASE_URL"]) return; // MemoryStore / no-DB path

  const { pool } = await import("@workspace/db");

  // ── 1. Core user and transaction tables ────────────────────────────────────
  await pool.query(`
    CREATE TABLE IF NOT EXISTS "users" (
      "id"               serial       PRIMARY KEY NOT NULL,
      "full_name"        text         NOT NULL,
      "username"         text         NOT NULL,
      "email"            text         NOT NULL,
      "phone"            text,
      "password"         text         NOT NULL,
      "role"             text         DEFAULT 'user' NOT NULL,
      "email_verified"   boolean      DEFAULT false NOT NULL,
      "account_status"   text         DEFAULT 'active' NOT NULL,
      "balance"          numeric(15,2) DEFAULT '0' NOT NULL,
      "total_deposit"    numeric(15,2) DEFAULT '0' NOT NULL,
      "total_withdrawal" numeric(15,2) DEFAULT '0' NOT NULL,
      "current_plan"     text,
      "created_at"       timestamp    DEFAULT now() NOT NULL,
      "updated_at"       timestamp    DEFAULT now() NOT NULL,
      CONSTRAINT "users_username_unique" UNIQUE("username"),
      CONSTRAINT "users_email_unique"    UNIQUE("email")
    );

    CREATE TABLE IF NOT EXISTS "email_otps" (
      "id"         serial    PRIMARY KEY NOT NULL,
      "user_id"    integer   NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
      "code"       text      NOT NULL,
      "expires_at" timestamp NOT NULL,
      "used"       boolean   DEFAULT false NOT NULL,
      "created_at" timestamp DEFAULT now() NOT NULL
    );

    CREATE TABLE IF NOT EXISTS "deposit_requests" (
      "id"              serial       PRIMARY KEY NOT NULL,
      "user_id"         integer      NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
      "plan_id"         text,
      "plan_name"       text,
      "amount"          numeric(15,2) NOT NULL,
      "approved_amount" numeric(15,2),
      "payment_method"  text         DEFAULT 'BTC' NOT NULL,
      "transaction_id"  text,
      "screenshot_data" text,
      "status"          text         DEFAULT 'Pending' NOT NULL,
      "reviewed_by"     text,
      "reviewed_at"     timestamp,
      "created_at"      timestamp    DEFAULT now() NOT NULL,
      "updated_at"      timestamp    DEFAULT now() NOT NULL
    );

    CREATE TABLE IF NOT EXISTS "transactions" (
      "id"           serial       PRIMARY KEY NOT NULL,
      "user_id"      integer      NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
      "type"         text         NOT NULL,
      "amount"       numeric(15,2) NOT NULL,
      "description"  text,
      "reference_id" text,
      "status"       text         DEFAULT 'Completed' NOT NULL,
      "created_at"   timestamp    DEFAULT now() NOT NULL
    );

    CREATE TABLE IF NOT EXISTS "investments" (
      "id"                   serial       PRIMARY KEY NOT NULL,
      "user_id"              integer      NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
      "deposit_request_id"   integer      REFERENCES "deposit_requests"("id") ON DELETE SET NULL,
      "plan_id"              text,
      "plan_name"            text         NOT NULL,
      "plan_execution_cycle" text         DEFAULT '30 Days' NOT NULL,
      "investment_amount"    numeric(15,2) NOT NULL,
      "profit_percentage"    numeric(8,4)  DEFAULT '100' NOT NULL,
      "start_date"           timestamp    DEFAULT now() NOT NULL,
      "end_date"             timestamp    NOT NULL,
      "status"               text         DEFAULT 'Active' NOT NULL,
      "total_profit"         numeric(15,2),
      "created_at"           timestamp    DEFAULT now() NOT NULL,
      "updated_at"           timestamp    DEFAULT now() NOT NULL
    );
  `);

  // ── 2. Investment plans + seed data ────────────────────────────────────────
  await pool.query(`
    CREATE TABLE IF NOT EXISTS "investment_plans" (
      "id"               text         PRIMARY KEY NOT NULL,
      "name"             text         NOT NULL,
      "min_investment"   numeric(15,2) NOT NULL,
      "max_investment"   numeric(15,2),
      "profit_percentage" numeric(8,4) NOT NULL,
      "return_range"     text,
      "execution_cycle"  text         NOT NULL,
      "description"      text         NOT NULL DEFAULT '',
      "overview"         text,
      "features"         text[]       NOT NULL DEFAULT '{}',
      "status"           text         NOT NULL DEFAULT 'Active',
      "display_order"    integer      NOT NULL DEFAULT 0,
      "investors"        integer      NOT NULL DEFAULT 0,
      "total_deposited"  numeric(15,2) NOT NULL DEFAULT '0',
      "created_at"       timestamp    DEFAULT now() NOT NULL,
      "updated_at"       timestamp    DEFAULT now() NOT NULL
    );
  `);

  await pool.query(`
    INSERT INTO "investment_plans"
      ("id","name","min_investment","max_investment","profit_percentage","return_range",
       "execution_cycle","description","overview","features","status","display_order","investors","total_deposited")
    VALUES
      ('starter-ai','Starter AI',1000,10000,200,'200% – 350%','24 Hours',
       'Based on historical backtesting and volatility-adjusted strategy modeling.',
       'Designed for new investors seeking structured exposure to innovation-focused equities with automated risk controls.',
       ARRAY['Automated trade execution','Risk-adjusted capital deployment','Portfolio rebalancing','Monthly performance reporting'],
       'Active',1,0,0),
      ('growth-ai','Growth AI',10000,100000,350,'350% – 550%','3 Days',
       'Advanced signal detection with volatility-aware execution framework.',
       'Enhanced AI signal modeling focused on high-growth innovation sectors and dynamic capital rotation.',
       ARRAY['High-frequency signal detection','Sector rotation strategy','Volatility hedging logic','Weekly analytics dashboard'],
       'Active',2,0,0),
      ('elite-ai','Elite AI',100000,NULL,700,'+700%','5 Days',
       'Multi-layered AI execution across diversified innovation assets.',
       'Designed for large capital deployment with structured downside protection and dynamic reallocation systems.',
       ARRAY['Cross-sector AI allocation engine','Downside risk containment protocol','Real-time capital rebalancing','Dedicated strategy oversight'],
       'Active',3,0,0)
    ON CONFLICT (id) DO NOTHING;
  `);

  // Reset the now-unused investors/total_deposited columns that were seeded
  // with fake demo values. Stats are computed live from the investments table.
  await pool.query(`
    UPDATE investment_plans SET investors = 0, total_deposited = 0
    WHERE id IN ('starter-ai', 'growth-ai', 'elite-ai')
      AND (investors != 0 OR total_deposited != 0);
  `);

  // ── 3. Withdrawals, earnings, notifications, wallets ───────────────────────
  await pool.query(`
    CREATE TABLE IF NOT EXISTS "withdrawal_requests" (
      "id"              serial       PRIMARY KEY NOT NULL,
      "user_id"         integer      NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
      "amount"          numeric(15,2) NOT NULL,
      "method"          text         NOT NULL DEFAULT 'Crypto Withdrawal',
      "crypto"          text         NOT NULL,
      "wallet_address"  text         NOT NULL,
      "status"          text         NOT NULL DEFAULT 'Pending',
      "approved_amount" numeric(15,2),
      "reviewed_by"     text,
      "reviewed_at"     timestamp,
      "created_at"      timestamp    NOT NULL DEFAULT now(),
      "updated_at"      timestamp    NOT NULL DEFAULT now()
    );

    CREATE TABLE IF NOT EXISTS "earnings" (
      "id"            serial  PRIMARY KEY NOT NULL,
      "user_id"       integer NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
      "investment_id" integer NOT NULL REFERENCES "investments"("id") ON DELETE CASCADE,
      "amount"        numeric(15,2) NOT NULL,
      "credit_date"   date    NOT NULL,
      "created_at"    timestamp DEFAULT now() NOT NULL
    );

    CREATE TABLE IF NOT EXISTS "notifications" (
      "id"          serial  PRIMARY KEY NOT NULL,
      "user_id"     integer NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
      "type"        text    NOT NULL,
      "title"       text    NOT NULL,
      "description" text    NOT NULL,
      "read"        boolean DEFAULT false NOT NULL,
      "created_at"  timestamp DEFAULT now() NOT NULL
    );
    CREATE INDEX IF NOT EXISTS "notifications_user_id_idx"      ON "notifications"("user_id");
    CREATE INDEX IF NOT EXISTS "notifications_user_created_idx" ON "notifications"("user_id","created_at" DESC);

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

  // ── 3b. Earnings table migrations ─────────────────────────────────────────
  //
  // The original CREATE TABLE was missing the `source` column and used a full
  // unique constraint instead of the required partial index. These idempotent
  // ALTER statements bring any existing database up to the correct shape:
  //   • Add `source` column (DEFAULT 'auto' so existing rows stay valid)
  //   • Drop the old full unique constraint if it still exists
  //   • Create the correct partial unique index (only for source = 'auto')
  //     so the auto-cron is idempotent while admin manual credits are unrestricted.
  await pool.query(`
    ALTER TABLE "earnings"
      ADD COLUMN IF NOT EXISTS "source" text NOT NULL DEFAULT 'auto';

    -- Drop old full unique constraint (may be a constraint or an index)
    ALTER TABLE "earnings"
      DROP CONSTRAINT IF EXISTS "earnings_investment_date_uniq";

    DROP INDEX IF EXISTS "earnings_investment_date_uniq";

    -- Partial unique index: only one auto credit per (investment, date)
    CREATE UNIQUE INDEX IF NOT EXISTS "earnings_investment_date_uniq"
      ON "earnings" ("investment_id", "credit_date")
      WHERE source = 'auto';
  `);

  // ── 4. Session table ───────────────────────────────────────────────────────
  //
  // connect-pg-simple ships a table.sql that uses `WITH (OIDS=FALSE)`, removed
  // in PostgreSQL 12. On PG12+ its createTableIfMissing silently poisons the
  // internal promise so every session.set() rejects → every auth request 401.
  // We create the table ourselves and use createTableIfMissing: false.
  await pool.query(`
    CREATE TABLE IF NOT EXISTS "session" (
      "sid"    varchar       NOT NULL,
      "sess"   json          NOT NULL,
      "expire" timestamp(6)  NOT NULL,
      CONSTRAINT "session_pkey" PRIMARY KEY ("sid")
    );
    CREATE INDEX IF NOT EXISTS "IDX_session_expire" ON "session"("expire");
  `);

  // ── 5. Chat tables ─────────────────────────────────────────────────────────
  await pool.query(`
    CREATE TABLE IF NOT EXISTS "chat_conversations" (
      "id"         serial    PRIMARY KEY,
      "user_id"    integer   NOT NULL,
      "created_at" timestamp NOT NULL DEFAULT now(),
      "updated_at" timestamp NOT NULL DEFAULT now()
    );

    CREATE TABLE IF NOT EXISTS "chat_messages" (
      "id"              serial   PRIMARY KEY,
      "conversation_id" integer  NOT NULL,
      "sender_type"     text     NOT NULL,
      "sender_id"       integer  NOT NULL,
      "message"         text     NOT NULL,
      "is_read"         boolean  NOT NULL DEFAULT false,
      "created_at"      timestamp NOT NULL DEFAULT now()
    );

    CREATE INDEX IF NOT EXISTS "idx_chat_messages_conversation_id"
      ON "chat_messages"("conversation_id");
    CREATE INDEX IF NOT EXISTS "idx_chat_messages_is_read"
      ON "chat_messages"("is_read");
  `);

  // ── 6. Admin config table ──────────────────────────────────────────────────
  // Stores runtime-mutable admin settings (e.g. hashed admin password).
  await pool.query(`
    CREATE TABLE IF NOT EXISTS "admin_config" (
      "key"        text      PRIMARY KEY NOT NULL,
      "value"      text      NOT NULL,
      "updated_at" timestamp NOT NULL DEFAULT now()
    );
  `);

  // ── 7. Admin notifications table ───────────────────────────────────────────
  // Global (not user-scoped) alerts for the admin: new deposits, withdrawals,
  // registrations. A separate table keeps admin and user concern cleanly apart.
  await pool.query(`
    CREATE TABLE IF NOT EXISTS "admin_notifications" (
      "id"          serial    PRIMARY KEY NOT NULL,
      "type"        text      NOT NULL,
      "title"       text      NOT NULL,
      "description" text      NOT NULL,
      "read"        boolean   DEFAULT false NOT NULL,
      "created_at"  timestamp DEFAULT now() NOT NULL
    );
    CREATE INDEX IF NOT EXISTS "admin_notifications_read_idx"
      ON "admin_notifications"("read");
    CREATE INDEX IF NOT EXISTS "admin_notifications_created_idx"
      ON "admin_notifications"("created_at" DESC);
  `);
}

ensureDatabase()
  .then(() => {
    app.listen(port, (err) => {
      if (err) {
        logger.error({ err }, "Error listening on port");
        process.exit(1);
      }

      logger.info({ port }, "Server listening");

      // Seed the fixed admin account (idempotent — safe to run every startup).
      seedAdminUser()
        .then(() => logger.info("Admin account ready."))
        .catch((err) => logger.error({ err }, "Failed to seed admin account."));

      // Start the earnings cron — credits daily profit for active investments.
      startEarningsCron();
    });
  })
  .catch((err) => {
    logger.error({ err }, "Failed to ensure database schema — aborting startup");
    process.exit(1);
  });
