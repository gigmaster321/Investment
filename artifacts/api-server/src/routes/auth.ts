import { Router } from "express";
import { z } from "zod";
import {
  registerUser,
  loginUser,
  getUserById,
} from "../services/auth.js";
import { createNotification } from "../lib/notifications.js";

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
  user: { id: number; role: "user" | "admin"; email: string },
) {
  req.session.userId = user.id;
  req.session.userRole = user.role;
  req.session.userEmail = user.email;
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

    // Remember Me: extend cookie to 30 days; otherwise it expires with the browser session
    if (rememberMe) {
      req.session.cookie.maxAge = 30 * 24 * 60 * 60 * 1000; // 30 days
    } else {
      req.session.cookie.expires = undefined;
      req.session.cookie.maxAge = undefined as any;
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
