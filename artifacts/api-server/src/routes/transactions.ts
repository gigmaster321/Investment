import { Router } from "express";
import { requireAuth } from "../middleware/requireAuth.js";
import { logger } from "../lib/logger.js";

const router = Router();

async function getDb() {
  return import("@workspace/db");
}

// GET /api/transactions — list transactions for the current user (or all for admin)
router.get("/", requireAuth, async (req, res) => {
  try {
    const { db, transactionsTable } = await getDb();
    const { eq, desc } = await import("drizzle-orm");

    const isAdmin = req.session.userRole === "admin";
    const rows = isAdmin
      ? await db.select().from(transactionsTable).orderBy(desc(transactionsTable.created_at))
      : await db
          .select()
          .from(transactionsTable)
          .where(eq(transactionsTable.user_id, req.session.userId!))
          .orderBy(desc(transactionsTable.created_at));

    res.json(rows);
  } catch (err) {
    logger.error({ err }, "Failed to list transactions");
    res.status(500).json({ error: "SERVER_ERROR" });
  }
});

export default router;
