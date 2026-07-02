import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyCsrf } from "@/lib/csrf";

export async function POST(req: Request) {
  try {
    // 1. Verify CSRF
    const isCsrfValid = await verifyCsrf(req);
    if (!isCsrfValid) {
      return NextResponse.json({ error: "Invalid CSRF headers" }, { status: 403 });
    }

    const { email, otp } = await req.json();

    if (!email || !otp) {
      return NextResponse.json({ error: "Email and verification code are required" }, { status: 400 });
    }

    // 2. Find verification record
    const record = await prisma.emailVerification.findUnique({
      where: { email },
    });

    if (!record) {
      return NextResponse.json({ error: "Verification record not found. Please request a new code." }, { status: 400 });
    }

    // 3. Check expiration
    if (record.expiresAt < new Date()) {
      return NextResponse.json({ error: "Verification code has expired. Please request a new code." }, { status: 400 });
    }

    // 4. Validate OTP
    if (record.otp !== otp) {
      return NextResponse.json({ error: "Invalid verification code. Please try again." }, { status: 400 });
    }

    // 5. Mark as verified
    await prisma.emailVerification.update({
      where: { email },
      data: { verified: true },
    });

    return NextResponse.json({ success: true, message: "Email verified successfully." });

  } catch (err) {
    console.error("Verify OTP error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
