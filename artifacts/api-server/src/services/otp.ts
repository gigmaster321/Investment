import { randomInt } from "node:crypto";

/** Lazy-load DB so server starts without DATABASE_URL. */
async function getDb() {
  try {
    return await import("@workspace/db");
  } catch {
    const err = new Error("Database not configured. Set DATABASE_URL.");
    (err as any).code = "DB_UNAVAILABLE";
    throw err;
  }
}

const OTP_TTL_MS = 10 * 60 * 1000; // 10 minutes
const RESEND_COOLDOWN_MS = 60 * 1000; // 60 seconds

/** Generate a cryptographically random 6-digit code. */
export function generateCode(): string {
  return String(randomInt(100_000, 1_000_000)); // always 6 digits
}

/**
 * Delete all existing OTPs for a user and store a fresh one.
 * Returns the plaintext code so it can be emailed.
 */
export async function createOtp(userId: number): Promise<string> {
  const { db, emailOtpsTable } = await getDb();
  const { eq } = await import("drizzle-orm");

  // Remove old codes for this user
  await db.delete(emailOtpsTable).where(eq(emailOtpsTable.user_id, userId));

  const code = generateCode();
  const expiresAt = new Date(Date.now() + OTP_TTL_MS);

  await db.insert(emailOtpsTable).values({
    user_id: userId,
    code,
    expires_at: expiresAt,
    used: false,
  });

  return code;
}

export interface OtpVerifyResult {
  ok: boolean;
  error?: "INVALID_OTP" | "OTP_EXPIRED" | "OTP_USED" | "NO_OTP";
}

/**
 * Verify a code against the most recent OTP for a user.
 * Marks it as used on success.
 */
export async function verifyOtp(
  userId: number,
  code: string,
): Promise<OtpVerifyResult> {
  const { db, emailOtpsTable } = await getDb();
  const { eq, and, desc } = await import("drizzle-orm");

  const [otp] = await db
    .select()
    .from(emailOtpsTable)
    .where(eq(emailOtpsTable.user_id, userId))
    .orderBy(desc(emailOtpsTable.created_at))
    .limit(1);

  if (!otp) return { ok: false, error: "NO_OTP" };
  if (otp.used) return { ok: false, error: "OTP_USED" };
  if (new Date() > otp.expires_at) return { ok: false, error: "OTP_EXPIRED" };
  if (otp.code !== code) return { ok: false, error: "INVALID_OTP" };

  // Mark used
  await db
    .update(emailOtpsTable)
    .set({ used: true })
    .where(eq(emailOtpsTable.id, otp.id));

  return { ok: true };
}

/**
 * Check if a new OTP can be sent (cooldown not expired).
 * Returns the seconds remaining if still within cooldown, or 0 if allowed.
 */
export async function getResendCooldownSeconds(userId: number): Promise<number> {
  const { db, emailOtpsTable } = await getDb();
  const { eq, desc } = await import("drizzle-orm");

  const [latest] = await db
    .select()
    .from(emailOtpsTable)
    .where(eq(emailOtpsTable.user_id, userId))
    .orderBy(desc(emailOtpsTable.created_at))
    .limit(1);

  if (!latest) return 0;

  const elapsed = Date.now() - new Date(latest.created_at).getTime();
  if (elapsed >= RESEND_COOLDOWN_MS) return 0;

  return Math.ceil((RESEND_COOLDOWN_MS - elapsed) / 1000);
}
