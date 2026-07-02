import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { verifyCsrf } from "@/lib/csrf";

export async function POST(req: Request) {
  try {
    // 1. Verify CSRF
    const isCsrfValid = await verifyCsrf(req);
    if (!isCsrfValid) {
      return NextResponse.json({ error: "Invalid CSRF headers" }, { status: 403 });
    }

    const session = await getServerSession(authOptions);

    // Verify session and ADMIN or MODERATOR role
    if (!session || (session.user.role !== "ADMIN" && session.user.role !== "MODERATOR")) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { userId, action, reason } = await req.json();

    if (!userId || !action) {
      return NextResponse.json({ error: "Missing required parameters" }, { status: 400 });
    }

    // Fetch target user with student profile to check their role and get their name
    const targetUser = await prisma.user.findUnique({
      where: { id: userId },
      include: { studentProfile: true }
    });

    if (!targetUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Guardrail: MODERATOR cannot modify ADMIN or other MODERATOR accounts
    if (session.user.role === "MODERATOR" && targetUser.role !== "STUDENT") {
      return NextResponse.json({ error: "Forbidden: Moderators can only verify student accounts." }, { status: 403 });
    }

    // Guardrail: MODERATOR cannot DELETE accounts (only ADMINs can delete accounts)
    if (action === "DELETE" && session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden: Only Administrators can delete accounts." }, { status: 403 });
    }

    const logReason = reason || (
      action === "APPROVE" ? "Valid Student ID card" :
      action === "REJECT" ? "Registration rejected/account suspended" :
      "Account deleted"
    );

    // Create moderation log entry
    await prisma.moderationLog.create({
      data: {
        adminId: session.user.id,
        adminName: session.user.name || session.user.username,
        targetId: userId,
        targetName: targetUser.studentProfile?.name || targetUser.email,
        action,
        reason: logReason,
      }
    });

    if (action === "APPROVE") {
      await prisma.user.update({
        where: { id: userId },
        data: { status: "APPROVED" },
      });
      return NextResponse.json({ success: true, message: "User approved successfully" });
    } else if (action === "REJECT") {
      await prisma.user.update({
        where: { id: userId },
        data: { status: "REJECTED" },
      });
      return NextResponse.json({ success: true, message: "User registration rejected" });
    } else if (action === "DELETE") {
      await prisma.user.delete({
        where: { id: userId },
      });
      return NextResponse.json({ success: true, message: "User deleted successfully" });
    } else {
      return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }

  } catch (err) {
    console.error("Admin action error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

