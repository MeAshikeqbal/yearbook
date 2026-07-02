import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendVerificationOtp } from "@/lib/email";
import { rateLimit } from "@/lib/rate-limiter";
import { verifyCsrf } from "@/lib/csrf";

export async function POST(req: Request) {
  try {
    // 1. Verify CSRF
    const isCsrfValid = await verifyCsrf(req);
    if (!isCsrfValid) {
      return NextResponse.json({ error: "Invalid CSRF headers" }, { status: 403 });
    }

    const { email } = await req.json();

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    if (!email.includes("@")) {
      return NextResponse.json({ error: "Invalid email format" }, { status: 400 });
    }

    // 2. Rate limiting: 3 requests per 10 minutes per IP
    const ip = req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip") || "127.0.0.1";
    const limiterKey = `rate:otp:${ip}`;
    const limitResult = await rateLimit(limiterKey, 3, 10 * 60 * 1000);
    if (!limitResult.success) {
      return NextResponse.json({ error: "Too many verification requests. Please try again in 10 minutes." }, { status: 429 });
    }

    // 3. Ensure email is not already registered
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json({ error: "Email already registered" }, { status: 400 });
    }

    // 4. Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // 5. Save to database (upsert by email)
    await prisma.emailVerification.upsert({
      where: { email },
      create: {
        email,
        otp,
        expiresAt,
        verified: false,
      },
      update: {
        otp,
        expiresAt,
        verified: false,
      },
    });

    // 6. Send OTP
    await sendVerificationOtp(email, otp);

    return NextResponse.json({ success: true, message: "Verification code sent successfully." });

  } catch (err) {
    console.error("Send OTP error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
