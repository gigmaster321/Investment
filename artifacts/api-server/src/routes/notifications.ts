import { Router } from "express";
import { requireAuth } from "../middleware/requireAuth.js";
import { logger } from "../lib/logger.js";

const router = Router();

async function getDb() {
  return import("@workspace/db");
}

// GET /api/notifications/unread-count — badge count for the sidebar
router.get("/unread-count", requireAuth, async (req, res) => {
  try {
    const userId = req.session.userId!;
    const { db, notificationsTable } = await getDb();
    const { eq, and, sql } = await import("drizzle-orm");

    const [row] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(notificationsTable)
      .where(
        and(
          eq(notificationsTable.user_id, userId),
          eq(notificationsTable.read, false),
        ),
      );

    res.json({ count: row?.count ?? 0 });
  } catch (err) {
    logger.error({ err }, "Failed to get notification unread count");
    res.status(500).json({ error: "SERVER_ERROR" });
  }
});

// GET /api/notifications — all notifications for the current user, newest first
router.get("/", requireAuth, async (req, res) => {
  try {
    const userId = req.session.userId!;
    const { db, notificationsTable } = await getDb();
    const { eq, desc } = await import("drizzle-orm");

    const rows = await db
      .select()
      .from(notificationsTable)
      .where(eq(notificationsTable.user_id, userId))
      .orderBy(desc(notificationsTable.created_at));

    res.json(rows);
  } catch (err) {
    logger.error({ err }, "Failed to fetch notifications");
    res.status(500).json({ error: "SERVER_ERROR" });
  }
});

// PATCH /api/notifications/read-all — mark every notification as read for this user
router.patch("/read-all", requireAuth, async (req, res) => {
  try {
    const userId = req.session.userId!;
    const { db, notificationsTable } = await getDb();
    const { eq } = await import("drizzle-orm");

    await db
      .update(notificationsTable)
      .set({ read: true })
      .where(eq(notificationsTable.user_id, userId));

    res.json({ success: true });
  } catch (err) {
    logger.error({ err }, "Failed to mark all notifications read");
    res.status(500).json({ error: "SERVER_ERROR" });
  }
});

// PATCH /api/notifications/:id/read — mark a single notification as read
router.patch("/:id/read", requireAuth, async (req, res) => {
  const id = parseInt(String(req.params.id), 10);
  if (isNaN(id)) {
    res.status(400).json({ error: "INVALID_ID" });
    return;
  }

  try {
    const userId = req.session.userId!;
    const { db, notificationsTable } = await getDb();
    const { eq, and } = await import("drizzle-orm");

    await db
      .update(notificationsTable)
      .set({ read: true })
      // Scope to this user so one user can't mark another's notification
      .where(and(eq(notificationsTable.id, id), eq(notificationsTable.user_id, userId)));

    res.json({ success: true });
  } catch (err) {
    logger.error({ err }, "Failed to mark notification read");
    res.status(500).json({ error: "SERVER_ERROR" });
  }
});

export default router;
