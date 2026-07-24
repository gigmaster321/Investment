/**
 * Non-interactive database migration script.
 * Uses drizzle-orm's built-in migrator — no TTY required.
 * Run via: pnpm --filter @workspace/db run migrate
 */
import { drizzle } from "drizzle-orm/node-postgres";
import { migrate } from "drizzle-orm/node-postgres/migrator";
import pg from "pg";
import path from "path";
import { fileURLToPath } from "url";

const { Pool } = pg;

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL must be set before running migrations.");
}

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const db = drizzle(pool);

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const migrationsFolder = path.join(__dirname, "../drizzle");

console.log("Running migrations from:", migrationsFolder);

await migrate(db, { migrationsFolder });

console.log("Migrations applied successfully.");
await pool.end();
