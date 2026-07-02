import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function POST(req: Request) {
  try {
    const { name, email, password, username, role, idCardUrl } = await req.json();

    if (!name || !email || !password || !username || !idCardUrl) {
      return NextResponse.json({ error: "Missing required fields (including Student ID card photo)" }, { status: 400 });
    }

    // Basic email format check
    if (!email.includes("@")) {
      return NextResponse.json({ error: "Invalid email address" }, { status: 400 });
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

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

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
