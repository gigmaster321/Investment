import { Router } from "express";
import { z } from "zod";
import {
  registerUser,
  loginUser,
  getUserById,
} from "../services/auth.js";

const router = Router();

// ─── Validation schemas ───────────────────────────────────────────────────────

const registerSchema = z.object({
  full_name: z.string().min(2, "Full name must be at least 2 characters"),
  username: z
    .string()
    .min(3, "Username must be at least 3 characters")
    .max(30, "Username must be at most 30 characters")
    .regex(/^[a-zA-Z0-9_]+$/, "Username may only contain letters, numbers, and underscores"),
  email: z.string().email("Invalid email address"),
  phone: z.string().optional(),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
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

// ─── Routes ───────────────────────────────────────────────────────────────────

/** POST /api/auth/register */
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
    setSession(req, user);
    res.status(201).json({ user });
  } catch (err: any) {
    if (err.code === "EMAIL_EXISTS") {
      res
        .status(409)
        .json({ error: "EMAIL_EXISTS", message: "An account with this email already exists." });
      return;
    }
    if (err.code === "USERNAME_EXISTS") {
      res
        .status(409)
        .json({ error: "USERNAME_EXISTS", message: "This username is already taken." });
      return;
    }
    if (err.code === "DB_UNAVAILABLE") {
      res.status(503).json({ error: "SERVICE_UNAVAILABLE", message: err.message });
      return;
    }
    res
      .status(500)
      .json({ error: "INTERNAL_ERROR", message: "Registration failed. Please try again." });
  }
});

/** POST /api/auth/login */
router.post("/login", async (req, res) => {
  const parsed = loginSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "VALIDATION_ERROR" });
    return;
  }

  try {
    const user = await loginUser(parsed.data.email, parsed.data.password);
    setSession(req, user);
    res.json({ user });
  } catch (err: any) {
    if (err.code === "INVALID_CREDENTIALS") {
      res
        .status(401)
        .json({ error: "INVALID_CREDENTIALS", message: "Invalid email or password." });
      return;
    }
    if (err.code === "ACCOUNT_INACTIVE") {
      res.status(403).json({
        error: "ACCOUNT_INACTIVE",
        message:
          err.status === "suspended"
            ? "Your account has been suspended. Please contact support."
            : "Your account has been blocked. Please contact support.",
      });
      return;
    }
    if (err.code === "DB_UNAVAILABLE") {
      res.status(503).json({ error: "SERVICE_UNAVAILABLE", message: err.message });
      return;
    }
    res
      .status(500)
      .json({ error: "INTERNAL_ERROR", message: "Login failed. Please try again." });
  }
});

/** POST /api/auth/logout */
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
    if (err.code === "DB_UNAVAILABLE") {
      res.status(503).json({ error: "SERVICE_UNAVAILABLE", message: err.message });
      return;
    }
    res.status(500).json({ error: "INTERNAL_ERROR" });
  }
});

export default router;
