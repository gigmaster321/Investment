/**
 * Lightweight helper for inserting notification rows.
 * All errors are swallowed so a notification failure never breaks the
 * primary action (deposit approval, withdrawal, etc.).
 */

import { logger } from "./logger.js";

type NotifType = "Investment" | "Deposit" | "Withdrawal" | "System";

async function getDb() {
  return import("@workspace/db");
}

export async function createNotification(
  userId: number,
  type: NotifType,
  title: string,
  description: string,
): Promise<void> {
  try {
    const { db, notificationsTable } = await getDb();
    await db
      .insert(notificationsTable)
      .values({ user_id: userId, type, title, description });
  } catch (err) {
    logger.error({ err, userId, title }, "Failed to create notification (non-fatal)");
  }
}
