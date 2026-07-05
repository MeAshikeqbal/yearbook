import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { verifyCsrf } from "@/lib/csrf";
import { rateLimit } from "@/lib/rate-limiter";
import { isFeatureEnabled } from "@/lib/features";

export async function POST(req: Request) {
  try {
    // 0. Check feature flag
    const registrationEnabled = await isFeatureEnabled("REGISTRATION", true);
    if (!registrationEnabled) {
      return NextResponse.json({ error: "Registration is temporarily disabled by administrators." }, { status: 403 });
    }

    // 1. Verify CSRF
    const isCsrfValid = await verifyCsrf(req);
    if (!isCsrfValid) {
      return NextResponse.json({ error: "Invalid CSRF headers" }, { status: 403 });
    }

    const { name, email, password, username, role, idCardUrl } = await req.json();

    if (!name || !email || !password || !username || !idCardUrl) {
      return NextResponse.json({ error: "Missing required fields (including Student ID card photo)" }, { status: 400 });
    }

    // Basic email format check
    if (!email.includes("@")) {
      return NextResponse.json({ error: "Invalid email address" }, { status: 400 });
    }

    // 2. IP Rate Limiting (5 registrations per hour)
    const ip = req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip") || "127.0.0.1";
    const limiterResult = await rateLimit(`rate:register:${ip}`, 5, 60 * 60 * 1000);
    if (!limiterResult.success) {
      return NextResponse.json({ error: "Too many registration attempts. Please try again in an hour." }, { status: 429 });
    }

    // 3. Verify Email was pre-verified via OTP
    const verification = await prisma.emailVerification.findUnique({
      where: { email },
    });

    if (!verification || !verification.verified) {
      return NextResponse.json({ error: "Email address not verified. Please verify your email first." }, { status: 400 });
    }

    // Check if email already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json({ error: "Email already registered" }, { status: 400 });
    }

    // Check if username is already taken
    const existingStudent = await prisma.student.findUnique({
      where: { username: username.toLowerCase().trim() },
    });

    if (existingStudent) {
      return NextResponse.json({ error: "Username is already taken" }, { status: 400 });
    }

    // Hash password with 12 rounds of bcrypt
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create user and associated student profile (status PENDING by default)
    const newUser = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        role: "STUDENT",
        status: "PENDING",
        idCardUrl,
        studentProfile: {
          create: {
            username: username.toLowerCase().trim(),
            name,
            role: role || "CSE Student",
            bio: `Hi! I am ${name} graduating ${role} in 2026.`,
            avatarUrl: `https://api.dicebear.com/7.x/bottts/svg?seed=${username}`, // Default dynamic robotic avatar
            stats: {
              bugsFixed: 0,
              coffeeConsumed: 0
            }
          }
        }
      },
    });

    // Delete email verification record since it is now consumed
    try {
      await prisma.emailVerification.delete({
        where: { email },
      });
    } catch (cleanupErr) {
      console.error("Failed to delete email verification record:", cleanupErr);
    }

    return NextResponse.json({
      success: true,
      userId: newUser.id,
      message: "Registration successful. Pending admin verification."
    }, { status: 201 });

  } catch (err) {
    console.error("Registration error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

