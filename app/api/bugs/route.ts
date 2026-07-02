import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { verifyCsrf } from "@/lib/csrf";

// GET /api/bugs - Fetch all bugs
export async function GET() {
  try {
    const bugs = await prisma.bug.findMany({
      orderBy: {
        createdAt: "desc",
      },
    });
    return NextResponse.json({ bugs });
  } catch (err) {
    console.error("Fetch bugs error:", err);
    return NextResponse.json({ error: "Failed to fetch issues board" }, { status: 500 });
  }
}

// POST /api/bugs - Log a new bug
export async function POST(req: Request) {
  try {
    // CSRF Protection
    const isCsrfValid = await verifyCsrf(req);
    if (!isCsrfValid) {
      return NextResponse.json({ error: "Invalid CSRF headers" }, { status: 403 });
    }

    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized. Please sign in to submit issues." }, { status: 401 });
    }

    const { title, description, status, reporter } = await req.json();

    if (!title || !description || !reporter) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const bug = await prisma.bug.create({
      data: {
        title,
        description,
        status: status || "OPEN",
        reporter,
      },
    });

    return NextResponse.json({ success: true, bug }, { status: 201 });

  } catch (err) {
    console.error("Create bug error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
