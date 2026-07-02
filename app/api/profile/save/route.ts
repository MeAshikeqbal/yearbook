import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    console.log("[SAVE_PROFILE_API] Incoming save request...");
    const session = await getServerSession(authOptions);

    console.log("[SAVE_PROFILE_API] Active Session User:", session?.user);

    if (!session) {
      console.error("[SAVE_PROFILE_API] Error: Unauthorized (no session found)");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const payload = await req.json();
    console.log("[SAVE_PROFILE_API] Request Payload:", {
      ...payload,
      bio: payload.bio ? `${payload.bio.substring(0, 30)}...` : undefined,
      customCss: payload.customCss ? `${payload.customCss.substring(0, 30)}...` : undefined,
    });

    const { username, name, role, bio, avatarUrl, github, linkedin, customCss, stats } = payload;

    if (!username || !name || !role || !bio) {
      console.error("[SAVE_PROFILE_API] Error: Missing required fields", { username, name, role, bio });
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Lookup profile
    const student = await prisma.student.findUnique({
      where: { username: username.toLowerCase().trim() },
    });

    if (!student) {
      console.error("[SAVE_PROFILE_API] Error: Profile not found for username:", username);
      return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }

    // Check ownership or admin role
    const isOwner = session.user.id === student.userId;
    const isAdmin = session.user.role === "ADMIN";

    console.log("[SAVE_PROFILE_API] Permission Check:", { isOwner, isAdmin, studentUserId: student.userId, sessionUserId: session.user.id });

    if (!isOwner && !isAdmin) {
      console.error("[SAVE_PROFILE_API] Error: Forbidden (user is neither owner nor admin)");
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Update profile in database
    console.log("[SAVE_PROFILE_API] Updating Student record with avatarUrl:", avatarUrl);
    const updatedStudent = await prisma.student.update({
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
    console.log("[SAVE_PROFILE_API] Update successful! Current avatarUrl in DB:", updatedStudent.avatarUrl);

    // Force Next.js to purge caches for the profile page and directory
    const { revalidatePath } = require("next/cache");
    revalidatePath(`/profile/${username.toLowerCase().trim()}`);
    revalidatePath(`/browse`);
    console.log("[SAVE_PROFILE_API] Cache revalidation successfully triggered.");

    return NextResponse.json({ success: true, message: "Profile updated successfully" });

  } catch (err) {
    console.error("[SAVE_PROFILE_API] Caught unexpected error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
