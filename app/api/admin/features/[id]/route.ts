import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { verifyCsrf } from "@/lib/csrf"

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const isCsrfValid = await verifyCsrf(req)
    if (!isCsrfValid) {
      return NextResponse.json({ error: "Invalid CSRF headers" }, { status: 403 })
    }

    const session = await getServerSession(authOptions)

    // Verify session and ADMIN or MODERATOR role
    if (!session || (session.user.role !== "ADMIN" && session.user.role !== "MODERATOR")) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const { id } = await params
    const { value, description } = await req.json()

    // Find the feature flag first
    const flag = await prisma.featureFlag.findUnique({
      where: { id },
    })

    if (!flag) {
      return NextResponse.json({ error: "Feature flag not found" }, { status: 404 })
    }

    const updatedFlag = await prisma.featureFlag.update({
      where: { id },
      data: {
        value: typeof value === "boolean" ? value : flag.value,
        description: description !== undefined ? description : flag.description,
      },
    })

    // Log the moderation action
    await prisma.moderationLog.create({
      data: {
        adminId: session.user.id,
        adminName: session.user.name || session.user.username,
        targetId: updatedFlag.id,
        targetName: updatedFlag.key,
        action: "TOGGLE_FLAG",
        reason: `Toggled feature flag '${updatedFlag.key}' to ${updatedFlag.value}`,
      },
    })

    return NextResponse.json({ success: true, flag: updatedFlag })
  } catch (error) {
    console.error("Admin toggle feature error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const isCsrfValid = await verifyCsrf(req)
    if (!isCsrfValid) {
      return NextResponse.json({ error: "Invalid CSRF headers" }, { status: 403 })
    }

    const session = await getServerSession(authOptions)

    // Only ADMIN can delete flags
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden: Only Administrators can delete flags." }, { status: 403 })
    }

    const { id } = await params

    const flag = await prisma.featureFlag.findUnique({
      where: { id },
    })

    if (!flag) {
      return NextResponse.json({ error: "Feature flag not found" }, { status: 404 })
    }

    await prisma.featureFlag.delete({
      where: { id },
    })

    // Log the moderation action
    await prisma.moderationLog.create({
      data: {
        adminId: session.user.id,
        adminName: session.user.name || session.user.username,
        targetId: id,
        targetName: flag.key,
        action: "DELETE_FLAG",
        reason: `Deleted feature flag '${flag.key}'`,
      },
    })

    return NextResponse.json({ success: true, message: "Feature flag deleted" })
  } catch (error) {
    console.error("Admin delete feature error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
