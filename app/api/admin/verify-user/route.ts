import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    // Verify session and ADMIN or MODERATOR role
    if (!session || (session.user.role !== "ADMIN" && session.user.role !== "MODERATOR")) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { userId, action } = await req.json();

    if (!userId || !action) {
      return NextResponse.json({ error: "Missing required parameters" }, { status: 400 });
    }

    // Fetch target user to check their role
    const targetUser = await prisma.user.findUnique({
      where: { id: userId },
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
