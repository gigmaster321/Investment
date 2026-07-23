import { logger } from "../lib/logger.js";

const FROM_ADDRESS =
  process.env.EMAIL_FROM || "Quantum Investments <noreply@quantuminvestments.com>";

function otpEmailHtml(name: string, otp: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Verify your email</title>
</head>
<body style="margin:0;padding:0;background:#0a1628;font-family:'Segoe UI',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#0a1628;padding:40px 0;">
    <tr>
      <td align="center">
        <table width="520" cellpadding="0" cellspacing="0" style="background:#0f1e36;border:1px solid rgba(255,255,255,0.08);border-radius:16px;overflow:hidden;">
          <!-- Header -->
          <tr>
            <td style="background:linear-gradient(135deg,#1e3a5f,#0a1628);padding:32px 40px;text-align:center;border-bottom:1px solid rgba(255,255,255,0.06);">
              <p style="margin:0;font-size:22px;font-weight:700;color:#ffffff;letter-spacing:1px;">
                QUANTUM <span style="color:#1ea7ff;">INVESTMENTS</span>
              </p>
              <p style="margin:6px 0 0;font-size:11px;color:rgba(255,255,255,0.4);letter-spacing:2px;text-transform:uppercase;">Secure Investment Platform</p>
            </td>
          </tr>
          <!-- Body -->
          <tr>
            <td style="padding:40px;">
              <p style="margin:0 0 8px;font-size:22px;font-weight:600;color:#ffffff;">Verify Your Email</p>
              <p style="margin:0 0 28px;font-size:14px;color:rgba(255,255,255,0.5);line-height:1.6;">
                Hi ${name}, enter the 6-digit code below to verify your Quantum Investments account.
              </p>

              <!-- OTP Box -->
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center" style="padding:24px;background:#0a1628;border:1px solid rgba(30,167,255,0.25);border-radius:12px;">
                    <p style="margin:0 0 6px;font-size:11px;color:rgba(255,255,255,0.4);letter-spacing:2px;text-transform:uppercase;">Your verification code</p>
                    <p style="margin:0;font-size:42px;font-weight:700;color:#1ea7ff;letter-spacing:10px;">${otp}</p>
                    <p style="margin:10px 0 0;font-size:12px;color:rgba(255,255,255,0.3);">Expires in 10 minutes</p>
                  </td>
                </tr>
              </table>

              <p style="margin:28px 0 0;font-size:13px;color:rgba(255,255,255,0.4);line-height:1.6;">
                If you did not create an account, please ignore this email. This code is valid for one-time use only.
              </p>
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="padding:20px 40px;border-top:1px solid rgba(255,255,255,0.06);text-align:center;">
              <p style="margin:0;font-size:11px;color:rgba(255,255,255,0.25);">
                © ${new Date().getFullYear()} Quantum Investments · Secure &amp; Regulated · 256-bit Encryption
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

/**
 * Send an OTP email.
 *
 * Priority:
 *  1. Resend (RESEND_API_KEY env var)
 *  2. Dev fallback — logs OTP to console and returns { devOtp } for local testing
 *
 * To enable real email delivery, add a RESEND_API_KEY secret and set
 * EMAIL_FROM to a verified sender address (e.g. "noreply@yourdomain.com").
 */
export async function sendOtpEmail(
  to: string,
  name: string,
  otp: string,
): Promise<{ devOtp?: string }> {
  const apiKey = process.env.RESEND_API_KEY;

  if (apiKey) {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: FROM_ADDRESS,
        to: [to],
        subject: "Your Quantum Investments verification code",
        html: otpEmailHtml(name, otp),
      }),
    });

    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      logger.error({ status: res.status, body }, "Resend API error");
      throw new Error("Failed to send verification email. Please try again.");
    }

    logger.info({ to }, "OTP email sent via Resend");
    return {};
  }

  // ── Dev fallback ──────────────────────────────────────────────────────────
  logger.warn(
    { to, otp },
    "RESEND_API_KEY not set — OTP logged here for development. Set RESEND_API_KEY to send real emails.",
  );

  // Return devOtp only in non-production environments so testers can read it from the API response
  if (process.env.NODE_ENV !== "production") {
    return { devOtp: otp };
  }

  return {};
}
