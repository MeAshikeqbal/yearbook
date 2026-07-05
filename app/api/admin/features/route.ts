import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { verifyCsrf } from "@/lib/csrf"

export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    // Verify session and ADMIN or MODERATOR role
    if (!session || (session.user.role !== "ADMIN" && session.user.role !== "MODERATOR")) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const flags = await prisma.featureFlag.findMany({
      orderBy: { key: "asc" },
    })

    return NextResponse.json({ flags })
  } catch (error) {
    console.error("Admin fetch features error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const isCsrfValid = await verifyCsrf(req)
    if (!isCsrfValid) {
      return NextResponse.json({ error: "Invalid CSRF headers" }, { status: 403 })
    }

    const session = await getServerSession(authOptions)

    // Only ADMIN can create new flags
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden: Only Administrators can create flags." }, { status: 403 })
    }

    const { key, value, description } = await req.json()

    if (!key) {
      return NextResponse.json({ error: "Missing key parameter" }, { status: 400 })
    }

    // Clean key (uppercase, alphanumeric + underscore only)
    const cleanKey = key.toUpperCase().trim().replace(/[^A-Z0-9_]/g, "")

    if (!cleanKey) {
      return NextResponse.json({ error: "Invalid key format" }, { status: 400 })
    }

    // Check if it already exists
    const existing = await prisma.featureFlag.findUnique({
      where: { key: cleanKey },
    })

    if (existing) {
      return NextResponse.json({ error: "Feature flag already exists" }, { status: 400 })
    }

    const flag = await prisma.featureFlag.create({
      data: {
        key: cleanKey,
        value: typeof value === "boolean" ? value : true,
        description: description || null,
      },
    })

    // Log the moderation action
    await prisma.moderationLog.create({
      data: {
        adminId: session.user.id,
        adminName: session.user.name || session.user.username,
        targetId: flag.id,
        targetName: flag.key,
        action: "CREATE_FLAG",
        reason: `Created feature flag '${flag.key}' set to ${flag.value}`,
      },
    })

    return NextResponse.json({ success: true, flag })
  } catch (error) {
    console.error("Admin create feature error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
