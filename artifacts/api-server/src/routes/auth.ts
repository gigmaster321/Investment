import { Router } from "express";
import { z } from "zod";
import {
  registerUser,
  loginUser,
  getUserById,
} from "../services/auth.js";
import { createNotification } from "../lib/notifications.js";
import { createAdminNotification } from "../lib/admin-notifications.js";

const router = Router();

// ─── Validation schemas ───────────────────────────────────────────────────────

const registerSchema = z.object({
  full_name: z.string().min(2, "Full name must be at least 2 characters"),
  username: z
    .string()
    .min(3, "Username must be at least 3 characters")
    .max(30, "Username must be at most 30 characters")
    .regex(
      /^[a-zA-Z0-9_]+$/,
      "Username may only contain letters, numbers, and underscores",
    ),
  email: z.string().email("Invalid email address"),
  phone: z.string().optional(),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
  rememberMe: z.boolean().optional().default(false),
});

// ─── Helpers ──────────────────────────────────────────────────────────────────

function setSession(
  req: Express.Request,
  user: { id: number; role: "user" | "admin"; email: string; full_name?: string },
) {
  req.session.userId = user.id;
  req.session.userRole = user.role;
  req.session.userEmail = user.email;
  if (user.full_name) req.session.userName = user.full_name;
}

function dbError(res: any, err: any) {
  if (err?.code === "DB_UNAVAILABLE") {
    res.status(503).json({ error: "SERVICE_UNAVAILABLE", message: err.message });
    return true;
  }
  return false;
}

// ─── Routes ───────────────────────────────────────────────────────────────────

/**
 * POST /api/auth/register
 * Creates account and immediately marks email as verified.
 * User can log in right away — no OTP step required.
 */
router.post("/register", async (req, res) => {
  const parsed = registerSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({
      error: "VALIDATION_ERROR",
      details: parsed.error.flatten().fieldErrors,
    });
    return;
  }

  try {
    const user = await registerUser(parsed.data);

    // Non-blocking welcome notification
    void createNotification(
      user.id,
      "System",
      "Welcome to Quantum Investments",
      `Hi ${parsed.data.full_name.split(" ")[0]}! Your account is ready. Explore our investment plans to get started.`,
    );

    // Non-blocking admin alert
    void createAdminNotification(
      "User",
      "New User Registered",
      `${parsed.data.full_name} (${parsed.data.email}) just created an account.`,
    );

    res.status(201).json({ success: true, userId: user.id });
  } catch (err: any) {
    if (dbError(res, err)) return;
    if (err.code === "EMAIL_EXISTS") {
      res.status(409).json({ error: "EMAIL_EXISTS", message: "An account with this email already exists." });
      return;
    }
    if (err.code === "USERNAME_EXISTS") {
      res.status(409).json({ error: "USERNAME_EXISTS", message: "This username is already taken." });
      return;
    }
    res.status(500).json({ error: "INTERNAL_ERROR", message: "Registration failed. Please try again." });
  }
});

/**
 * POST /api/auth/login
 * Authenticates with email + password and creates a session.
 */
router.post("/login", async (req, res) => {
  const parsed = loginSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "VALIDATION_ERROR" });
    return;
  }

  try {
    const { email, password, rememberMe } = parsed.data;
    const user = await loginUser(email, password);
    setSession(req, user);

    // Remember Me: extend cookie to 30 days; otherwise keep the 7-day default
    // from the session middleware.
    // NOTE: do NOT set maxAge/expires to undefined here — that turns the cookie
    // into a browser-session cookie (deleted on tab/window close), which is the
    // exact failure mode the client reported (forced re-login after refresh).
    if (rememberMe) {
      req.session.cookie.maxAge = 30 * 24 * 60 * 60 * 1000; // 30 days
    }

    res.json({ user });
  } catch (err: any) {
    if (dbError(res, err)) return;
    if (err.code === "USER_NOT_FOUND") {
      res.status(401).json({ error: "USER_NOT_FOUND", message: "No account found with this email address." });
      return;
    }
    if (err.code === "INVALID_PASSWORD") {
      res.status(401).json({ error: "INVALID_PASSWORD", message: "Incorrect password. Please try again." });
      return;
    }
    if (err.code === "ACCOUNT_INACTIVE") {
      res.status(403).json({ error: "ACCOUNT_INACTIVE", message: err.message || "Your account has been suspended." });
      return;
    }
    res.status(500).json({ error: "INTERNAL_ERROR", message: "Login failed. Please try again." });
  }
});

/** PATCH /api/auth/profile — update full_name and/or phone for the current user */
router.patch("/profile", async (req, res) => {
  if (!req.session.userId) {
    res.status(401).json({ error: "UNAUTHENTICATED" });
    return;
  }

  const schema = z.object({
    full_name: z.string().min(2, "Full name must be at least 2 characters").optional(),
    phone: z.string().max(30).optional().nullable(),
  });

  const parsed = schema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "VALIDATION_ERROR", details: parsed.error.flatten().fieldErrors });
    return;
  }

  const updates: Record<string, unknown> = { updated_at: new Date() };
  if (parsed.data.full_name !== undefined) updates["full_name"] = parsed.data.full_name.trim();
  if (parsed.data.phone !== undefined) updates["phone"] = parsed.data.phone ?? null;

  if (Object.keys(updates).length === 1) {
    res.status(400).json({ error: "NO_FIELDS", message: "Provide at least one field to update." });
    return;
  }

  try {
    const { db, usersTable } = await import("@workspace/db");
    const { eq } = await import("drizzle-orm");

    await db.update(usersTable).set(updates).where(eq(usersTable.id, req.session.userId));

    const user = await getUserById(req.session.userId);
    res.json({ user });
  } catch (err: any) {
    if (dbError(res, err)) return;
    res.status(500).json({ error: "INTERNAL_ERROR", message: "Profile update failed." });
  }
});

/** POST /api/auth/change-password — change password for the current user */
router.post("/change-password", async (req, res) => {
  if (!req.session.userId) {
    res.status(401).json({ error: "UNAUTHENTICATED" });
    return;
  }

  const schema = z.object({
    currentPassword: z.string().min(1, "Current password is required"),
    newPassword: z.string().min(8, "New password must be at least 8 characters"),
    confirmPassword: z.string().min(1),
  });

  const parsed = schema.safeParse(req.body);
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
    const { db, usersTable } = await import("@workspace/db");
    const { eq } = await import("drizzle-orm");
    const { verifyPassword, hashPassword } = await import("../services/auth.js");

    const [row] = await db
      .select({ password: usersTable.password })
      .from(usersTable)
      .where(eq(usersTable.id, req.session.userId))
      .limit(1);

    if (!row) {
      res.status(404).json({ error: "USER_NOT_FOUND" });
      return;
    }

    const valid = await verifyPassword(currentPassword, row.password);
    if (!valid) {
      res.status(401).json({ error: "INVALID_CURRENT_PASSWORD", message: "Current password is incorrect." });
      return;
    }

    const hashed = await hashPassword(newPassword);
    await db.update(usersTable).set({ password: hashed, updated_at: new Date() }).where(eq(usersTable.id, req.session.userId));

    res.json({ success: true, message: "Password updated successfully." });
  } catch (err: any) {
    if (dbError(res, err)) return;
    res.status(500).json({ error: "INTERNAL_ERROR", message: "Password change failed." });
  }
});

/** POST /api/auth/logout — destroys the current session */
router.post("/logout", (req, res) => {
  req.session.destroy(() => {
    res.clearCookie("qinvest.sid");
    res.json({ success: true });
  });
});

/** GET /api/auth/me — returns the current session user */
router.get("/me", async (req, res) => {
  if (!req.session.userId) {
    res.status(401).json({ error: "UNAUTHENTICATED" });
    return;
  }

  try {
    const user = await getUserById(req.session.userId);
    if (!user) {
      req.session.destroy(() => {});
      res.status(401).json({ error: "UNAUTHENTICATED" });
      return;
    }
    res.json({ user });
  } catch (err: any) {
    if (dbError(res, err)) return;
    res.status(500).json({ error: "INTERNAL_ERROR" });
  }
});

export default router;
