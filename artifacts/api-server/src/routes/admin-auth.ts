import { Router } from "express";
import { z } from "zod";

const router = Router();

const ADMIN_PASSWORD = "Admin@123";

const loginSchema = z.object({
  password: z.string().min(1),
});

/**
 * POST /api/auth/admin-login
 * Password-only admin login. Sets a persistent session flag.
 */
router.post("/admin-login", (req, res) => {
  const parsed = loginSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "VALIDATION_ERROR" });
    return;
  }

  if (parsed.data.password !== ADMIN_PASSWORD) {
    res.status(401).json({ error: "INVALID_PASSWORD", message: "Invalid password." });
    return;
  }

  req.session.isAdmin = true;
  // Persistent session: 30 days
  req.session.cookie.maxAge = 30 * 24 * 60 * 60 * 1000;

  res.json({ success: true });
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

export default router;
