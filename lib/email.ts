import { Resend } from "resend";

export async function sendVerificationOtp(email: string, otp: string) {
  const resendApiKey = process.env.RESEND_API_KEY;

  if (resendApiKey) {
    try {
      const resend = new Resend(resendApiKey);
      const data = await resend.emails.send({
        from: process.env.SMTP_FROM || "Yearbook <onboarding@resend.dev>",
        to: email,
        subject: "[Yearbook] Verify Your Email Address",
        html: `
          <div style="font-family: monospace; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #333; background-color: #0c0a09; color: #e7e5e4;">
            <h2 style="color: #ea580c; border-bottom: 1px solid #333; padding-bottom: 10px;">./verify_email</h2>
            <p style="font-size: 14px; line-height: 1.5;">You are registering for the CSE Class of 2026 digital yearbook. Please use the following one-time passcode (OTP) to verify your email address:</p>
            <div style="background-color: #1c1917; border: 1px solid #444; padding: 15px; text-align: center; margin: 20px 0; border-radius: 6px;">
              <span style="font-size: 32px; font-weight: bold; letter-spacing: 5px; color: #ea580c;">${otp}</span>
            </div>
            <p style="font-size: 12px; color: #78716c;">This passcode is valid for 10 minutes. If you did not request this, please ignore this email.</p>
          </div>
        `,
      });

      console.log(`[EMAIL] OTP sent to ${email} via Resend. ID:`, data.data?.id);
      return true;
    } catch (err) {
      console.error("[EMAIL] Failed to send email via Resend:", err);
    }
  }

  // Fallback: Console Logging (Visually highlighted for local development)
  console.log(`
┌────────────────────────────────────────────────────────┐
│             [DEV RESEND EMAIL OTP VERIFICATION]        │
├────────────────────────────────────────────────────────┤
│  Recipient: ${email.padEnd(42)} │
│  OTP Code:  \x1b[31;1m${otp}\x1b[0m                                     │
│  Expires:   10 minutes                                 │
├────────────────────────────────────────────────────────┤
│  Add RESEND_API_KEY env variable to send actual mail.  │
└────────────────────────────────────────────────────────┘
  `);

  return true;
}
