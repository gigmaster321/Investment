import { Router } from "express";
import { requireAuth } from "../middleware/requireAuth.js";
import { logger } from "../lib/logger.js";

const router = Router();

/** Default wallet rows seeded on first use (idempotent). */
const DEFAULT_WALLETS = [
  { coin_id: "btc",        name: "Bitcoin",      ticker: "BTC",   network: "BTC Network",    address: "" },
  { coin_id: "eth",        name: "Ethereum",     ticker: "ETH",   network: "ERC20",           address: "" },
  { coin_id: "usdt_trc20", name: "USDT (TRC20)", ticker: "TRC20", network: "TRC20 (TRON)",    address: "" },
  { coin_id: "usdt_erc20", name: "USDT (ERC20)", ticker: "ERC20", network: "ERC20 (Ethereum)", address: "" },
];

async function getDb() {
  return import("@workspace/db");
}

async function seedWalletsIfEmpty(): Promise<void> {
  const { db, depositWalletsTable } = await getDb();
  // onConflictDoNothing skips rows whose coin_id already exists — safe to call every startup.
  await db.insert(depositWalletsTable).values(DEFAULT_WALLETS).onConflictDoNothing();
}

// GET /api/wallets — active wallets (logged-in user; used by deposit page)
router.get("/", requireAuth, async (_req, res) => {
  try {
    const { db, depositWalletsTable } = await getDb();
    const { eq } = await import("drizzle-orm");

    await seedWalletsIfEmpty();

    const rows = await db
      .select()
      .from(depositWalletsTable)
      .where(eq(depositWalletsTable.is_active, true));

    res.json(rows);
  } catch (err) {
    logger.error({ err }, "Failed to fetch wallets");
    res.status(500).json({ error: "SERVER_ERROR" });
  }
});

export default router;
