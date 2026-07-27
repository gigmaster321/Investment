import { Router } from "express";
import { requireAdmin } from "../middleware/requireAuth.js";
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
  await db.insert(depositWalletsTable).values(DEFAULT_WALLETS).onConflictDoNothing();
}

// GET /api/admin/wallets — list all wallets (admin)
router.get("/", requireAdmin, async (_req, res) => {
  try {
    const { db, depositWalletsTable } = await getDb();
    const { asc } = await import("drizzle-orm");

    await seedWalletsIfEmpty();

    const rows = await db
      .select()
      .from(depositWalletsTable)
      .orderBy(asc(depositWalletsTable.id));

    res.json(rows);
  } catch (err) {
    logger.error({ err }, "Failed to list wallets");
    res.status(500).json({ error: "SERVER_ERROR" });
  }
});

// PATCH /api/admin/wallets/:id — update wallet address and/or active status (admin)
router.patch("/:id", requireAdmin, async (req, res) => {
  const id = parseInt(String(req.params["id"]), 10);
  if (isNaN(id)) {
    res.status(400).json({ error: "INVALID_ID" });
    return;
  }

  const { address, is_active } = req.body as { address?: string; is_active?: boolean };

  if (address !== undefined && typeof address !== "string") {
    res.status(400).json({ error: "INVALID_ADDRESS", message: "Address must be a string." });
    return;
  }

  try {
    const { db, depositWalletsTable } = await getDb();
    const { eq } = await import("drizzle-orm");

    const updates: Record<string, unknown> = { updated_at: new Date() };
    if (address !== undefined) updates["address"] = address.trim();
    if (typeof is_active === "boolean") updates["is_active"] = is_active;

    const [updated] = await db
      .update(depositWalletsTable)
      .set(updates)
      .where(eq(depositWalletsTable.id, id))
      .returning();

    if (!updated) {
      res.status(404).json({ error: "NOT_FOUND", message: "Wallet not found." });
      return;
    }

    res.json(updated);
  } catch (err) {
    logger.error({ err }, "Failed to update wallet");
    res.status(500).json({ error: "SERVER_ERROR" });
  }
});

export default router;
