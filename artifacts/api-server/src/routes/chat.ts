import { Router } from "express";
import { requireAuth, requireAdmin } from "../middleware/requireAuth.js";
import { logger } from "../lib/logger.js";

const router = Router();

async function getDb() {
  return import("@workspace/db");
}

// ── POST /api/chat/conversations — user: get or create their conversation ─────

router.post("/conversations", requireAuth, async (req, res) => {
  const userId = req.session.userId;
  if (!userId) {
    res.status(401).json({ error: "UNAUTHENTICATED" });
    return;
  }

  try {
    const { db, chatConversationsTable } = await getDb();
    const { eq } = await import("drizzle-orm");

    // Return existing conversation or create a new one
    const [existing] = await db
      .select()
      .from(chatConversationsTable)
      .where(eq(chatConversationsTable.user_id, userId))
      .limit(1);

    if (existing) {
      res.json(existing);
      return;
    }

    const [created] = await db
      .insert(chatConversationsTable)
      .values({ user_id: userId })
      .returning();

    res.status(201).json(created);
  } catch (err) {
    logger.error({ err }, "Failed to create/get conversation");
    res.status(500).json({ error: "SERVER_ERROR" });
  }
});

// ── GET /api/chat/conversations — user: own; admin: all with user info ────────

router.get("/conversations", requireAuth, async (req, res) => {
  const isAdmin =
    req.session.isAdmin === true || req.session.userRole === "admin";

  try {
    const { db, chatConversationsTable, chatMessagesTable, usersTable } =
      await getDb();
    const { eq, desc, sql, and, ne } = await import("drizzle-orm");

    if (isAdmin) {
      // All conversations with user info + last message + unread count
      const rows = await db
        .select({
          id: chatConversationsTable.id,
          user_id: chatConversationsTable.user_id,
          user_full_name: usersTable.full_name,
          user_email: usersTable.email,
          user_username: usersTable.username,
          created_at: chatConversationsTable.created_at,
          updated_at: chatConversationsTable.updated_at,
        })
        .from(chatConversationsTable)
        .leftJoin(usersTable, eq(chatConversationsTable.user_id, usersTable.id))
        .orderBy(desc(chatConversationsTable.updated_at));

      // For each conversation, get unread (from user) count and last message
      const enriched = await Promise.all(
        rows.map(async (conv) => {
          const [unreadRow] = await db
            .select({ count: sql<number>`count(*)::int` })
            .from(chatMessagesTable)
            .where(
              and(
                eq(chatMessagesTable.conversation_id, conv.id),
                eq(chatMessagesTable.sender_type, "user"),
                eq(chatMessagesTable.is_read, false),
              ),
            );

          const [lastMsg] = await db
            .select({
              message: chatMessagesTable.message,
              created_at: chatMessagesTable.created_at,
              sender_type: chatMessagesTable.sender_type,
            })
            .from(chatMessagesTable)
            .where(eq(chatMessagesTable.conversation_id, conv.id))
            .orderBy(desc(chatMessagesTable.created_at))
            .limit(1);

          return {
            ...conv,
            unread_count: unreadRow?.count ?? 0,
            last_message: lastMsg ?? null,
          };
        }),
      );

      res.json(enriched);
    } else {
      // User's own conversation
      const userId = req.session.userId!;
      const [conv] = await db
        .select()
        .from(chatConversationsTable)
        .where(eq(chatConversationsTable.user_id, userId))
        .limit(1);

      if (!conv) {
        res.json(null);
        return;
      }

      // Unread count (admin messages not yet read by user)
      const [unreadRow] = await db
        .select({ count: sql<number>`count(*)::int` })
        .from(chatMessagesTable)
        .where(
          and(
            eq(chatMessagesTable.conversation_id, conv.id),
            eq(chatMessagesTable.sender_type, "admin"),
            eq(chatMessagesTable.is_read, false),
          ),
        );

      res.json({ ...conv, unread_count: unreadRow?.count ?? 0 });
    }
  } catch (err) {
    logger.error({ err }, "Failed to list conversations");
    res.status(500).json({ error: "SERVER_ERROR" });
  }
});

// ── GET /api/chat/conversations/:id/messages — paginated messages ─────────────

router.get("/conversations/:id/messages", requireAuth, async (req, res) => {
  const convId = parseInt(String(req.params.id), 10);
  if (isNaN(convId)) {
    res.status(400).json({ error: "INVALID_ID" });
    return;
  }

  const isAdmin =
    req.session.isAdmin === true || req.session.userRole === "admin";

  try {
    const { db, chatConversationsTable, chatMessagesTable } = await getDb();
    const { eq, asc } = await import("drizzle-orm");

    // Authorization: non-admin users may only access their own conversation
    if (!isAdmin) {
      const [conv] = await db
        .select({ user_id: chatConversationsTable.user_id })
        .from(chatConversationsTable)
        .where(eq(chatConversationsTable.id, convId))
        .limit(1);

      if (!conv || conv.user_id !== req.session.userId) {
        res.status(403).json({ error: "UNAUTHORIZED" });
        return;
      }
    }

    const messages = await db
      .select()
      .from(chatMessagesTable)
      .where(eq(chatMessagesTable.conversation_id, convId))
      .orderBy(asc(chatMessagesTable.created_at));

    res.json(messages);
  } catch (err) {
    logger.error({ err }, "Failed to fetch messages");
    res.status(500).json({ error: "SERVER_ERROR" });
  }
});

// ── POST /api/chat/conversations/:id/messages — send a message ────────────────

router.post("/conversations/:id/messages", requireAuth, async (req, res) => {
  const convId = parseInt(String(req.params.id), 10);
  if (isNaN(convId)) {
    res.status(400).json({ error: "INVALID_ID" });
    return;
  }

  const message = typeof req.body?.message === "string" ? req.body.message.trim() : "";
  if (!message) {
    res.status(400).json({ error: "EMPTY_MESSAGE", message: "Message cannot be empty." });
    return;
  }

  const isAdmin =
    req.session.isAdmin === true || req.session.userRole === "admin";
  const senderType: "user" | "admin" = isAdmin ? "admin" : "user";
  const senderId = req.session.userId ?? 0;

  try {
    const { db, chatConversationsTable, chatMessagesTable } = await getDb();
    const { eq } = await import("drizzle-orm");

    // Authorization: non-admin users may only post to their own conversation
    if (!isAdmin) {
      const [conv] = await db
        .select({ user_id: chatConversationsTable.user_id })
        .from(chatConversationsTable)
        .where(eq(chatConversationsTable.id, convId))
        .limit(1);

      if (!conv || conv.user_id !== req.session.userId) {
        res.status(403).json({ error: "UNAUTHORIZED" });
        return;
      }
    }

    const [inserted] = await db
      .insert(chatMessagesTable)
      .values({
        conversation_id: convId,
        sender_type: senderType,
        sender_id: senderId,
        message,
        is_read: false,
      })
      .returning();

    // Bump conversation updated_at so it surfaces in sorted admin list
    await db
      .update(chatConversationsTable)
      .set({ updated_at: new Date() })
      .where(eq(chatConversationsTable.id, convId));

    res.status(201).json(inserted);
  } catch (err) {
    logger.error({ err }, "Failed to send message");
    res.status(500).json({ error: "SERVER_ERROR" });
  }
});

// ── PATCH /api/chat/conversations/:id/read — mark messages as read ────────────

router.patch("/conversations/:id/read", requireAuth, async (req, res) => {
  const convId = parseInt(String(req.params.id), 10);
  if (isNaN(convId)) {
    res.status(400).json({ error: "INVALID_ID" });
    return;
  }

  const isAdmin =
    req.session.isAdmin === true || req.session.userRole === "admin";

  try {
    const { db, chatConversationsTable, chatMessagesTable } = await getDb();
    const { eq, and } = await import("drizzle-orm");

    // Authorization: non-admin users may only mark messages in their own conversation
    if (!isAdmin) {
      const [conv] = await db
        .select({ user_id: chatConversationsTable.user_id })
        .from(chatConversationsTable)
        .where(eq(chatConversationsTable.id, convId))
        .limit(1);

      if (!conv || conv.user_id !== req.session.userId) {
        res.status(403).json({ error: "UNAUTHORIZED" });
        return;
      }
    }

    // Mark the opposite sender's messages as read (admin reads user msgs, user reads admin msgs)
    const markSenderType: "user" | "admin" = isAdmin ? "user" : "admin";

    await db
      .update(chatMessagesTable)
      .set({ is_read: true })
      .where(
        and(
          eq(chatMessagesTable.conversation_id, convId),
          eq(chatMessagesTable.sender_type, markSenderType),
          eq(chatMessagesTable.is_read, false),
        ),
      );

    res.json({ ok: true });
  } catch (err) {
    logger.error({ err }, "Failed to mark messages read");
    res.status(500).json({ error: "SERVER_ERROR" });
  }
});

// ── GET /api/chat/unread-count — badge count for sidebar ─────────────────────

router.get("/unread-count", requireAuth, async (req, res) => {
  const isAdmin =
    req.session.isAdmin === true || req.session.userRole === "admin";

  try {
    const { db, chatConversationsTable, chatMessagesTable } = await getDb();
    const { eq, and, sql } = await import("drizzle-orm");

    if (isAdmin) {
      // Count all unread messages sent by users
      const [row] = await db
        .select({ count: sql<number>`count(*)::int` })
        .from(chatMessagesTable)
        .where(
          and(
            eq(chatMessagesTable.sender_type, "user"),
            eq(chatMessagesTable.is_read, false),
          ),
        );
      res.json({ count: row?.count ?? 0 });
    } else {
      const userId = req.session.userId!;
      const [conv] = await db
        .select({ id: chatConversationsTable.id })
        .from(chatConversationsTable)
        .where(eq(chatConversationsTable.user_id, userId))
        .limit(1);

      if (!conv) {
        res.json({ count: 0 });
        return;
      }

      const [row] = await db
        .select({ count: sql<number>`count(*)::int` })
        .from(chatMessagesTable)
        .where(
          and(
            eq(chatMessagesTable.conversation_id, conv.id),
            eq(chatMessagesTable.sender_type, "admin"),
            eq(chatMessagesTable.is_read, false),
          ),
        );
      res.json({ count: row?.count ?? 0 });
    }
  } catch (err) {
    logger.error({ err }, "Failed to get unread count");
    res.status(500).json({ error: "SERVER_ERROR" });
  }
});

export default router;
