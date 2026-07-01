import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { username, name, role, bio, avatarUrl, github, linkedin, customCss, stats } = await req.json();

    if (!username || !name || !role || !bio) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Lookup profile
    const student = await prisma.student.findUnique({
      where: { username: username.toLowerCase().trim() },
    });

    if (!student) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }

    // Check ownership or admin role
    const isOwner = session.user.id === student.userId;
    const isAdmin = session.user.role === "ADMIN";

    if (!isOwner && !isAdmin) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Update profile in database
    await prisma.student.update({
      where: { username: username.toLowerCase().trim() },
      data: {
        name,
        role,
        bio,
        avatarUrl,
        github: github || null,
        linkedin: linkedin || null,
        customCss: customCss || null,
        stats: stats || {},
      },
    });

    // Force Next.js to purge caches for the profile page and directory
    const { revalidatePath } = require("next/cache");
    revalidatePath(`/profile/${username.toLowerCase().trim()}`);
    revalidatePath(`/browse`);

    return NextResponse.json({ success: true, message: "Profile updated successfully" });

  } catch (err) {
    console.error("Save profile error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
