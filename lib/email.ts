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

export async function sendWelcomeEmail({
  email,
  name,
  username,
  role,
}: {
  email: string;
  name: string;
  username: string;
  role: string;
}) {
  const resendApiKey = process.env.RESEND_API_KEY;
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.NEXTAUTH_URL || "http://localhost:3000";
  const profileUrl = `${baseUrl}/profile/${username}`;

  if (resendApiKey) {
    try {
      const resend = new Resend(resendApiKey);
      const data = await resend.emails.send({
        from: process.env.SMTP_FROM || "Yearbook <onboarding@resend.dev>",
        to: email,
        subject: "[Yearbook] Account Approved!",
        html: `
          <div style="font-family: monospace, Courier, sans-serif; max-width: 600px; margin: 0 auto; padding: 25px; border: 1px solid #333; background-color: #0c0a09; color: #e7e5e4;">
            <h2 style="color: #ea580c; border-bottom: 1px solid #333; padding-bottom: 10px; margin-top: 0;">./welcome_to_yearbook</h2>
            
            <p style="font-size: 14px; line-height: 1.5; margin: 15px 0;">
              Hello <span style="color: #ea580c;">${name}</span>,
            </p>
            
            <p style="font-size: 14px; line-height: 1.5; margin: 15px 0;">
              Your registration and student ID verification request has been <strong>APPROVED</strong> by the administration.
              You are now a verified classmate of the CSE Class of 2026 Digital Yearbook.
            </p>
            
            <div style="background-color: #1c1917; border: 1px solid #444; padding: 15px; margin: 20px 0; border-radius: 6px;">
              <div style="color: #ea580c; border-bottom: 1px dashed #444; padding-bottom: 8px; margin-bottom: 12px; font-weight: bold;">
                [SYSTEM_CLEARANCE_DETAILS]
              </div>
              <table style="width: 100%; border-collapse: collapse; font-family: monospace; font-size: 13px; color: #e7e5e4;">
                <tr>
                  <td style="padding: 4px 0; color: #78716c; width: 120px;">Name:</td>
                  <td style="padding: 4px 0;">${name}</td>
                </tr>
                <tr>
                  <td style="padding: 4px 0; color: #78716c;">Username:</td>
                  <td style="padding: 4px 0; color: #ea580c;">@${username}</td>
                </tr>
                <tr>
                  <td style="padding: 4px 0; color: #78716c;">Clearance Role:</td>
                  <td style="padding: 4px 0;">${role}</td>
                </tr>
                <tr>
                  <td style="padding: 4px 0; color: #78716c;">Profile URL:</td>
                  <td style="padding: 4px 0;"><a href="${profileUrl}" style="color: #ea580c; text-decoration: underline;">${profileUrl}</a></td>
                </tr>
              </table>
            </div>

            <p style="font-size: 14px; line-height: 1.5; margin: 15px 0;">
              You can now perform the following actions in the interface:
            </p>
            <ul style="font-size: 13px; line-height: 1.6; color: #d6d3d1; padding-left: 20px; margin: 15px 0;">
              <li>Access the interactive Class of 2026 digital yearbook flipbook.</li>
              <li>Customize your profile page template using custom CSS injection.</li>
              <li>Upload memory snapshots to the shared photo mosaic collage.</li>
              <li>Write digital signs and notes on other classmates' profile sheets.</li>
            </ul>

            <div style="text-align: center; margin: 25px 0 15px 0;">
              <a href="${profileUrl}" style="background-color: #ea580c; color: #0c0a09; text-decoration: none; padding: 10px 20px; font-weight: bold; border-radius: 4px; display: inline-block; font-size: 13px; text-transform: uppercase;">
                ./access_dashboard
              </a>
            </div>

            <p style="font-size: 11px; color: #78716c; border-top: 1px solid #333; padding-top: 15px; margin-top: 25px;">
              System notification. Please do not reply directly to this message.
            </p>
          </div>
        `,
      });

      console.log(`[EMAIL] Welcome email sent to ${email} via Resend. ID:`, data.data?.id);
      return true;
    } catch (err) {
      console.error("[EMAIL] Failed to send welcome email via Resend:", err);
    }
  }

  // Fallback: Console Logging (Visually highlighted for local development)
  console.log(`
┌────────────────────────────────────────────────────────┐
│             [DEV RESEND WELCOME EMAIL APPROVED]        │
├────────────────────────────────────────────────────────┤
│  Recipient: ${email.padEnd(42)} │
│  Name:      ${name.padEnd(42)} │
│  Username:  @${username.padEnd(41)} │
│  Role:      ${role.padEnd(42)} │
│  Link:      ${profileUrl.padEnd(42)} │
├────────────────────────────────────────────────────────┤
│  Add RESEND_API_KEY env variable to send actual mail.  │
└────────────────────────────────────────────────────────┘
  `);

  return true;
}

