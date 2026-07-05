import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { verifyCsrf } from "@/lib/csrf";
import { isFeatureEnabled } from "@/lib/features";
import { syncIssuesWithDatabase } from "@/lib/github";

export async function POST(req: Request) {
  try {
    const bugsEnabled = await isFeatureEnabled("BUGS", true);
    if (!bugsEnabled) {
      return NextResponse.json(
        { error: "Bug tracker module is temporarily disabled by administrators." },
        { status: 403 }
      );
    }

    // CSRF Protection
    const isCsrfValid = await verifyCsrf(req);
    if (!isCsrfValid) {
      return NextResponse.json({ error: "Invalid CSRF headers" }, { status: 403 });
    }

    // Authentication check
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json(
        { error: "Unauthorized. Please sign in to sync issues." },
        { status: 401 }
      );
    }

    // Synchronize GitHub issues with database
    const syncCount = await syncIssuesWithDatabase(session.accessToken);

    return NextResponse.json({ success: true, count: syncCount });
  } catch (err: any) {
    console.error("Sync bugs error:", err);
    return NextResponse.json(
      { error: err.message || "Failed to sync issues board with GitHub" },
      { status: 500 }
    );
  }
}
