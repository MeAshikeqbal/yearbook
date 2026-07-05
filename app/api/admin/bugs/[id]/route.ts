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
    const { status } = await req.json()

    if (!status || !["OPEN", "IN_PROGRESS", "RESOLVED"].includes(status)) {
      return NextResponse.json({ error: "Invalid status value" }, { status: 400 })
    }

    const bug = await prisma.bug.findUnique({
      where: { id },
    })

    if (!bug) {
      return NextResponse.json({ error: "Bug report not found" }, { status: 404 })
    }

    const updatedBug = await prisma.bug.update({
      where: { id },
      data: { status },
    })

    // Log the moderation action
    await prisma.moderationLog.create({
      data: {
        adminId: session.user.id,
        adminName: session.user.name || session.user.username,
        targetId: id,
        targetName: bug.title,
        action: "UPDATE_BUG_STATUS",
        reason: `Changed status from ${bug.status} to ${status}`,
      },
    })

    return NextResponse.json({ success: true, bug: updatedBug })
  } catch (error) {
    console.error("Admin update bug error:", error)
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

    // Verify session and ADMIN or MODERATOR role
    if (!session || (session.user.role !== "ADMIN" && session.user.role !== "MODERATOR")) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const { id } = await params

    const bug = await prisma.bug.findUnique({
      where: { id },
    })

    if (!bug) {
      return NextResponse.json({ error: "Bug report not found" }, { status: 404 })
    }

    await prisma.bug.delete({
      where: { id },
    })

    // Log the moderation action
    await prisma.moderationLog.create({
      data: {
        adminId: session.user.id,
        adminName: session.user.name || session.user.username,
        targetId: id,
        targetName: bug.title,
        action: "DELETE_BUG",
        reason: `Dismissed bug report by ${bug.reporter}`,
      },
    })

    return NextResponse.json({ success: true, message: "Bug report dismissed" })
  } catch (error) {
    console.error("Admin delete bug error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
