import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ username: string }> }
) {
  try {
    const { username } = await params;
    const student = await prisma.student.findUnique({
      where: { username: username.toLowerCase().trim() },
      include: {
        user: {
          select: {
            status: true,
          },
        },
      },
    });

    if (!student || student.user.status !== "APPROVED") {
      return new Response("Error: Profile not found or not approved.\n", {
        status: 404,
        headers: { "Content-Type": "text/plain" },
      });
    }

    // Check request format (Accept header or ?cli=true)
    const acceptHeader = req.headers.get("accept") || "";
    const { searchParams } = new URL(req.url);
    const wantsText = acceptHeader.includes("text/plain") || searchParams.get("format") === "text" || searchParams.get("cli") === "true";

    if (wantsText) {
      // Build ASCII Art card
      const stats = (student.stats as Record<string, any>) || {};
      const statLines = Object.entries(stats)
        .map(([k, v]) => `|   - ${k}: ${v}`)
        .join("\n");

      const asciiCard = `
+------------------------------------------------------------+
|  🎓 CSE CLASS OF 2026 REGISTRY PORTAL                       |
+------------------------------------------------------------+
|  USERNAME: @${student.username.padEnd(46)} |
|  NAME:     ${student.name.padEnd(47)} |
|  ROLE:     ${student.role.padEnd(47)} |
+------------------------------------------------------------+
|  system.bio:                                               |
|  ${student.bio.replace(/\n/g, "\n|  ").padEnd(58)} |
+------------------------------------------------------------+
|  socials.link:                                             |
|  - GitHub:   ${(student.github || "N/A").padEnd(46)} |
|  - LinkedIn: ${(student.linkedin || "N/A").padEnd(44)} |
+------------------------------------------------------------+
|  compilation.metrics:                                      |
${statLines || "|   (No metrics logged)"}
+------------------------------------------------------------+
|  STATUS: APPROVED_GRADUATE                                 |
+------------------------------------------------------------+
`;
      return new Response(asciiCard, {
        status: 200,
        headers: { "Content-Type": "text/plain" },
      });
    }

    // Default to JSON response
    return NextResponse.json({
      username: student.username,
      name: student.name,
      role: student.role,
      bio: student.bio,
      avatarUrl: student.avatarUrl,
      socials: {
        github: student.github,
        linkedin: student.linkedin,
      },
      stats: student.stats,
    });

  } catch (err) {
    console.error("CLI API error:", err);
    return new Response("Error: Internal server error\n", {
      status: 500,
      headers: { "Content-Type": "text/plain" },
    });
  }
}
