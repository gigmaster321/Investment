import { Router } from "express";
import { requireAdmin } from "../middleware/requireAuth.js";
import { logger } from "../lib/logger.js";

const router = Router();

async function getDb() {
  return import("@workspace/db");
}

// GET /api/admin/notifications — all admin notifications, newest first
router.get("/", requireAdmin, async (req, res) => {
  try {
    const { db, adminNotificationsTable } = await getDb();
    const { desc } = await import("drizzle-orm");

    const rows = await db
      .select()
      .from(adminNotificationsTable)
      .orderBy(desc(adminNotificationsTable.created_at));

    res.json(rows);
  } catch (err) {
    logger.error({ err }, "Failed to fetch admin notifications");
    res.status(500).json({ error: "SERVER_ERROR" });
  }
});

// GET /api/admin/notifications/unread-count — badge count for admin sidebar
router.get("/unread-count", requireAdmin, async (req, res) => {
  try {
    const { db, adminNotificationsTable } = await getDb();
    const { eq, sql } = await import("drizzle-orm");

    const [row] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(adminNotificationsTable)
      .where(eq(adminNotificationsTable.read, false));

    res.json({ count: row?.count ?? 0 });
  } catch (err) {
    logger.error({ err }, "Failed to get admin unread count");
    res.status(500).json({ error: "SERVER_ERROR" });
  }
});

// PATCH /api/admin/notifications/read-all — mark all as read
router.patch("/read-all", requireAdmin, async (req, res) => {
  try {
    const { db, adminNotificationsTable } = await getDb();
    const { eq } = await import("drizzle-orm");

    await db
      .update(adminNotificationsTable)
      .set({ read: true })
      .where(eq(adminNotificationsTable.read, false));

    res.json({ success: true });
  } catch (err) {
    logger.error({ err }, "Failed to mark all admin notifications read");
    res.status(500).json({ error: "SERVER_ERROR" });
  }
});

// PATCH /api/admin/notifications/:id/read — mark one as read
router.patch("/:id/read", requireAdmin, async (req, res) => {
  const id = parseInt(String(req.params.id), 10);
  if (isNaN(id)) {
    res.status(400).json({ error: "INVALID_ID" });
    return;
  }

  try {
    const { db, adminNotificationsTable } = await getDb();
    const { eq } = await import("drizzle-orm");

    await db
      .update(adminNotificationsTable)
      .set({ read: true })
      .where(eq(adminNotificationsTable.id, id));

    res.json({ success: true });
  } catch (err) {
    logger.error({ err }, "Failed to mark admin notification read");
    res.status(500).json({ error: "SERVER_ERROR" });
  }
});

export default router;
