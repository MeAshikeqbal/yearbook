import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { verifyCsrf } from "@/lib/csrf";
import { revalidatePath } from "next/cache";

export async function POST(req: Request) {
  try {
    // CSRF Protection
    const isCsrfValid = await verifyCsrf(req);
    if (!isCsrfValid) {
      return NextResponse.json({ error: "Invalid CSRF headers" }, { status: 403 });
    }

    const session = await getServerSession(authOptions);

    if (!session) {
      console.error("[SAVE_PROFILE_API] Error: Unauthorized (no session found)");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const payload = await req.json();
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

    // Check ownership, approval status, or staff (admin/moderator) role
    const isOwner = session.user.id === student.userId;
    const isStaff = session.user.role === "ADMIN" || session.user.role === "MODERATOR";
    const isApproved = session.user.status === "APPROVED";

    if (!isStaff && (!isOwner || !isApproved)) {
      console.error("[SAVE_PROFILE_API] Error: Forbidden (user is neither staff nor approved owner)");
      return NextResponse.json({ error: "Forbidden. Account must be approved to edit details." }, { status: 403 });
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
    revalidatePath(`/profile/${username.toLowerCase().trim()}`);
    revalidatePath(`/browse`);

    return NextResponse.json({ success: true, message: "Profile updated successfully" });

  } catch (err) {
    console.error("[SAVE_PROFILE_API] Caught unexpected error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
