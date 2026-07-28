/**
 * Lightweight helper for inserting admin notification rows.
 * Errors are swallowed so a notification failure never breaks the primary action.
 */

import { logger } from "./logger.js";

type AdminNotifType = "Deposit" | "Withdrawal" | "User" | "System";

async function getDb() {
  return import("@workspace/db");
}

export async function createAdminNotification(
  type: AdminNotifType,
  title: string,
  description: string,
): Promise<void> {
  try {
    const { db, adminNotificationsTable } = await getDb();
    await db
      .insert(adminNotificationsTable)
      .values({ type, title, description });
  } catch (err) {
    logger.error({ err, title }, "Failed to create admin notification (non-fatal)");
  }
}
