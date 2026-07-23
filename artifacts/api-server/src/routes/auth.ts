import { Router } from "express";
import { z } from "zod";
import {
  registerUser,
  loginUser,
  getUserById,
  getUserRowByEmail,
  markEmailVerified,
} from "../services/auth.js";
import { createOtp, verifyOtp, getResendCooldownSeconds } from "../services/otp.js";
import { sendOtpEmail } from "../services/email.js";

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
});

const verifyEmailSchema = z.object({
  email: z.string().email(),
  code: z.string().length(6, "Code must be 6 digits").regex(/^\d+$/, "Code must be numeric"),
});

const resendOtpSchema = z.object({
  email: z.string().email(),
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
 * Creates account, sends OTP, does NOT create a session.
 * User must verify email before they can log in.
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

    // Generate OTP and send verification email
    const code = await createOtp(user.id);
    const emailResult = await sendOtpEmail(user.email, user.full_name, code);

    const response: Record<string, unknown> = { requiresVerification: true };
    // Include OTP in response only in development (no real email configured)
    if (emailResult.devOtp) {
      response.devOtp = emailResult.devOtp;
      response.devNote = "RESEND_API_KEY not configured — use this code to verify.";
    }

    res.status(201).json(response);
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
 * Requires email_verified = true before creating a session.
 */
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
    if (dbError(res, err)) return;
    if (err.code === "INVALID_CREDENTIALS") {
      res.status(401).json({ error: "INVALID_CREDENTIALS", message: "Invalid email or password." });
      return;
    }
    if (err.code === "EMAIL_NOT_VERIFIED") {
      res.status(403).json({
        error: "EMAIL_NOT_VERIFIED",
        message: "Please verify your email address before logging in.",
      });
      return;
    }
    if (err.code === "ACCOUNT_INACTIVE") {
      res.status(403).json({
        error: "ACCOUNT_INACTIVE",
        message:
          (err as any).status === "suspended"
            ? "Your account has been suspended. Please contact support."
            : "Your account has been blocked. Please contact support.",
      });
      return;
    }
    res.status(500).json({ error: "INTERNAL_ERROR", message: "Login failed. Please try again." });
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
    if (dbError(res, err)) return;
    res.status(500).json({ error: "INTERNAL_ERROR" });
  }
});

/**
 * POST /api/auth/verify-email
 * Verifies OTP code, marks email_verified = true.
 * Does NOT create a session — user must log in after verification.
 */
router.post("/verify-email", async (req, res) => {
  const parsed = verifyEmailSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({
      error: "VALIDATION_ERROR",
      details: parsed.error.flatten().fieldErrors,
    });
    return;
  }

  const { email, code } = parsed.data;

  try {
    const userRow = await getUserRowByEmail(email);
    if (!userRow) {
      res.status(404).json({ error: "USER_NOT_FOUND", message: "No account found with this email." });
      return;
    }

    if (userRow.email_verified) {
      res.json({ verified: true, alreadyVerified: true });
      return;
    }

    const result = await verifyOtp(userRow.id, code);

    if (!result.ok) {
      const messages: Record<string, string> = {
        INVALID_OTP: "Invalid verification code. Please check and try again.",
        OTP_EXPIRED: "This code has expired. Please request a new one.",
        OTP_USED: "This code has already been used. Please request a new one.",
        NO_OTP: "No verification code found. Please request a new one.",
      };
      res.status(400).json({
        error: result.error,
        message: messages[result.error!] ?? "Verification failed.",
      });
      return;
    }

    await markEmailVerified(userRow.id);
    res.json({ verified: true });
  } catch (err: any) {
    if (dbError(res, err)) return;
    res.status(500).json({ error: "INTERNAL_ERROR", message: "Verification failed. Please try again." });
  }
});

/**
 * POST /api/auth/resend-otp
 * Generates a new OTP and sends it. Enforces a 60-second cooldown.
 */
router.post("/resend-otp", async (req, res) => {
  const parsed = resendOtpSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "VALIDATION_ERROR" });
    return;
  }

  const { email } = parsed.data;

  try {
    const userRow = await getUserRowByEmail(email);
    if (!userRow) {
      // Don't reveal whether an account exists
      res.json({ sent: true });
      return;
    }

    if (userRow.email_verified) {
      res.status(400).json({ error: "ALREADY_VERIFIED", message: "This email is already verified." });
      return;
    }

    const cooldown = await getResendCooldownSeconds(userRow.id);
    if (cooldown > 0) {
      res.status(429).json({
        error: "COOLDOWN",
        message: `Please wait ${cooldown} seconds before requesting a new code.`,
        retryAfterSeconds: cooldown,
      });
      return;
    }

    const code = await createOtp(userRow.id);
    const emailResult = await sendOtpEmail(userRow.email, userRow.full_name, code);

    const response: Record<string, unknown> = { sent: true };
    if (emailResult.devOtp) {
      response.devOtp = emailResult.devOtp;
      response.devNote = "RESEND_API_KEY not configured — use this code to verify.";
    }

    res.json(response);
  } catch (err: any) {
    if (dbError(res, err)) return;
    res.status(500).json({ error: "INTERNAL_ERROR", message: "Failed to send code. Please try again." });
  }
});

export default router;
