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
 * Ensure the express-session table exists.
 *
 * connect-pg-simple ships a table.sql that uses `WITH (OIDS=FALSE)`, which was
 * removed in PostgreSQL 12. On PG12+ the library's `createTableIfMissing`
 * option silently fails, permanently poisoning its internal promise so that
 * every session.set() rejects — meaning no session is ever saved and every
 * authenticated request returns 401.
 *
 * We create the table ourselves at startup with correct modern SQL and let
 * connect-pg-simple find it already in place.
 */
async function ensureSessionTable(): Promise<void> {
  if (!process.env["DATABASE_URL"]) return; // MemoryStore path — no table needed

  // Reuse the workspace db pool — pg is a direct dep of @workspace/db so
  // esbuild can resolve it without needing pg in api-server's own deps.
  const { pool } = await import("@workspace/db");
  await pool.query(`
    CREATE TABLE IF NOT EXISTS "session" (
      "sid"    varchar       NOT NULL,
      "sess"   json          NOT NULL,
      "expire" timestamp(6)  NOT NULL,
      CONSTRAINT "session_pkey" PRIMARY KEY ("sid")
    );
    CREATE INDEX IF NOT EXISTS "IDX_session_expire" ON "session" ("expire");
  `);

  // Ensure chat tables exist (idempotent — safe to run on every startup).
  await pool.query(`
    CREATE TABLE IF NOT EXISTS "chat_conversations" (
      "id"         serial       PRIMARY KEY,
      "user_id"    integer      NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
      "created_at" timestamp    NOT NULL DEFAULT now(),
      "updated_at" timestamp    NOT NULL DEFAULT now()
    );

    CREATE TABLE IF NOT EXISTS "chat_messages" (
      "id"              serial      PRIMARY KEY,
      "conversation_id" integer     NOT NULL REFERENCES "chat_conversations"("id") ON DELETE CASCADE,
      "sender_type"     text        NOT NULL,
      "sender_id"       integer     NOT NULL,
      "message"         text        NOT NULL,
      "is_read"         boolean     NOT NULL DEFAULT false,
      "created_at"      timestamp   NOT NULL DEFAULT now()
    );

    CREATE INDEX IF NOT EXISTS "idx_chat_messages_conversation_id"
      ON "chat_messages" ("conversation_id");
    CREATE INDEX IF NOT EXISTS "idx_chat_messages_is_read"
      ON "chat_messages" ("is_read");
  `);
}

ensureSessionTable()
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
    logger.error({ err }, "Failed to ensure session table — aborting startup");
    process.exit(1);
  });
