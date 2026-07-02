import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    // Verify session and ADMIN or MODERATOR role
    if (!session || (session.user.role !== "ADMIN" && session.user.role !== "MODERATOR")) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Fetch the latest 50 moderation logs
    const logs = await prisma.moderationLog.findMany({
      orderBy: {
        createdAt: "desc",
      },
      take: 50,
    });

    return NextResponse.json({ logs });

  } catch (err) {
    console.error("Fetch moderation logs error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
