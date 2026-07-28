import { Router } from "express";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { db, adminConfigTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { requireAdmin } from "../middleware/requireAuth";

const router = Router();

/** Default password (only used on first boot before a custom one is saved). */
const DEFAULT_ADMIN_PASSWORD = "Admin@123";
const PASSWORD_CONFIG_KEY = "admin_password_hash";

/**
 * Returns the current admin password hash from the DB.
 * On first call (no row yet) it hashes the default password, persists it, and returns it.
 */
async function getAdminPasswordHash(): Promise<string> {
  const rows = await db
    .select()
    .from(adminConfigTable)
    .where(eq(adminConfigTable.key, PASSWORD_CONFIG_KEY))
    .limit(1);

  if (rows.length > 0) return rows[0].value;

  // First boot — hash & store the default password
  const hash = await bcrypt.hash(DEFAULT_ADMIN_PASSWORD, 12);
  await db
    .insert(adminConfigTable)
    .values({ key: PASSWORD_CONFIG_KEY, value: hash })
    .onConflictDoUpdate({
      target: adminConfigTable.key,
      set: { value: hash, updated_at: new Date() },
    });
  return hash;
}

const loginSchema = z.object({
  password: z.string().min(1),
});

/**
 * POST /api/auth/admin-login
 * Password-only admin login. Sets a persistent session flag.
 */
router.post("/admin-login", async (req, res) => {
  const parsed = loginSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "VALIDATION_ERROR" });
    return;
  }

  try {
    const hash = await getAdminPasswordHash();
    const valid = await bcrypt.compare(parsed.data.password, hash);

    if (!valid) {
      res.status(401).json({ error: "INVALID_PASSWORD", message: "Invalid password." });
      return;
    }

    req.session.isAdmin = true;
    // Persistent session: 30 days
    req.session.cookie.maxAge = 30 * 24 * 60 * 60 * 1000;

    // Explicitly flush the session to the store BEFORE sending the response.
    // Without this, express-session auto-saves asynchronously after the response
    // is flushed. The browser immediately fires the next request (e.g. /api/admin/users)
    // and it can arrive before the PostgreSQL write completes, causing a 401 race.
    req.session.save((err) => {
      if (err) {
        res.status(500).json({ error: "SESSION_ERROR", message: "Failed to save session." });
        return;
      }
      res.json({ success: true });
    });
  } catch {
    res.status(500).json({ error: "SERVER_ERROR", message: "An error occurred." });
  }
});

/**
 * GET /api/auth/admin-me
 * Returns admin status from session.
 */
router.get("/admin-me", (req, res) => {
  if (!req.session.isAdmin) {
    res.status(401).json({ error: "UNAUTHENTICATED" });
    return;
  }
  res.json({ isAdmin: true });
});

/**
 * POST /api/auth/admin-logout
 * Clears the admin session flag.
 */
router.post("/admin-logout", (req, res) => {
  req.session.isAdmin = undefined;
  req.session.save(() => {
    res.clearCookie("qinvest.sid");
    res.json({ success: true });
  });
});

const changePasswordSchema = z.object({
  currentPassword: z.string().min(1),
  newPassword: z.string().min(8, "New password must be at least 8 characters."),
  confirmPassword: z.string().min(1),
});

/**
 * POST /api/auth/admin-change-password
 * Changes the admin password. Requires an active admin session.
 */
router.post("/admin-change-password", requireAdmin, async (req, res) => {
  const parsed = changePasswordSchema.safeParse(req.body);
  if (!parsed.success) {
    const msg = parsed.error.errors[0]?.message ?? "Validation error.";
    res.status(400).json({ error: "VALIDATION_ERROR", message: msg });
    return;
  }

  const { currentPassword, newPassword, confirmPassword } = parsed.data;

  if (newPassword !== confirmPassword) {
    res.status(400).json({ error: "PASSWORD_MISMATCH", message: "New password and confirmation do not match." });
    return;
  }

  try {
    const hash = await getAdminPasswordHash();
    const valid = await bcrypt.compare(currentPassword, hash);
    if (!valid) {
      res.status(401).json({ error: "INVALID_CURRENT_PASSWORD", message: "Current password is incorrect." });
      return;
    }

    const newHash = await bcrypt.hash(newPassword, 12);
    await db
      .insert(adminConfigTable)
      .values({ key: PASSWORD_CONFIG_KEY, value: newHash })
      .onConflictDoUpdate({
        target: adminConfigTable.key,
        set: { value: newHash, updated_at: new Date() },
      });

    res.json({ success: true, message: "Password updated successfully." });
  } catch {
    res.status(500).json({ error: "SERVER_ERROR", message: "An error occurred." });
  }
});

export default router;
