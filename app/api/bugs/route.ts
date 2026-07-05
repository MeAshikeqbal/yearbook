import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { verifyCsrf } from "@/lib/csrf";
import { isFeatureEnabled } from "@/lib/features";
import { createGithubIssue } from "@/lib/github";

// GET /api/bugs - Fetch all bugs
export async function GET() {
  try {
    const bugsEnabled = await isFeatureEnabled("BUGS", true);
    if (!bugsEnabled) {
      return NextResponse.json({ error: "Bug tracker module is temporarily disabled by administrators." }, { status: 403 });
    }

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
    const bugsEnabled = await isFeatureEnabled("BUGS", true);
    if (!bugsEnabled) {
      return NextResponse.json({ error: "Bug tracker module is temporarily disabled by administrators." }, { status: 403 });
    }

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

    let githubNumber: number | null = null;
    let githubUrl: string | null = null;
    let githubSynced = false;

    const token = session.accessToken || process.env.GITHUB_PAT || process.env.GITHUB_TOKEN;
    if (token) {
      try {
        const ghIssue = await createGithubIssue(title, description, token);
        githubNumber = ghIssue.number;
        githubUrl = ghIssue.htmlUrl;
        githubSynced = true;
      } catch (err) {
        console.error("Failed to create issue on GitHub, falling back to local database:", err);
      }
    }

    const bug = await prisma.bug.create({
      data: {
        title,
        description,
        status: status || "OPEN",
        reporter,
        githubNumber,
        githubUrl,
      },
    });

    return NextResponse.json({ success: true, bug, githubSynced }, { status: 201 });

  } catch (err) {
    console.error("Create bug error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
