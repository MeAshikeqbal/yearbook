import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { verifyCsrf } from "@/lib/csrf";

// GET /api/memories - Fetch all memories
export async function GET() {
  try {
    const memories = await prisma.memory.findMany({
      orderBy: {
        date: "desc",
      },
    });
    return NextResponse.json({ memories });
  } catch (err) {
    console.error("Fetch memories error:", err);
    return NextResponse.json({ error: "Failed to fetch memories" }, { status: 500 });
  }
}

// POST /api/memories - Create a new memory after successful R2 upload
export async function POST(req: Request) {
  try {
    // CSRF Protection
    const isCsrfValid = await verifyCsrf(req);
    if (!isCsrfValid) {
      return NextResponse.json({ error: "Invalid CSRF headers" }, { status: 403 });
    }

    const session = await getServerSession(authOptions);

    // Verify authorized user
    if (!session || (session.user.status !== "APPROVED" && session.user.role !== "ADMIN")) {
      return NextResponse.json({ error: "Unauthorized. Account pending verification." }, { status: 403 });
    }

    const { imageUrl, description, date, location } = await req.json();

    if (!imageUrl || !description || !date) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const memory = await prisma.memory.create({
      data: {
        imageUrl,
        description,
        date: new Date(date),
        location: location || null,
        uploadedBy: session.user.id,
        uploaderName: session.user.name || session.user.username,
      },
    });

    return NextResponse.json({ success: true, memory }, { status: 201 });

  } catch (err) {
    console.error("Create memory error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
