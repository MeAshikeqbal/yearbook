import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    // Verify session and ADMIN or MODERATOR role
    if (!session || (session.user.role !== "ADMIN" && session.user.role !== "MODERATOR")) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Fetch users with their student profiles
    const users = await prisma.user.findMany({
      include: {
        studentProfile: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json({ users });

  } catch (err) {
    console.error("Admin fetch users error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
