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

    const { idCardUrl } = await req.json();

    if (!idCardUrl) {
      return NextResponse.json({ error: "Missing ID card URL" }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    if (user.status !== "PENDING") {
      return NextResponse.json({ error: "Only pending accounts can upload ID verification photos." }, { status: 400 });
    }

    // Update user record with ID photo URL
    await prisma.user.update({
      where: { id: session.user.id },
      data: { idCardUrl },
    });

    return NextResponse.json({
      success: true,
      message: "Student ID uploaded successfully. Pending administrator review."
    });

  } catch (err) {
    console.error("Upload ID verification API error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
