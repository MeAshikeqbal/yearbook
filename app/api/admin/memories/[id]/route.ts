import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { verifyCsrf } from "@/lib/csrf"

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

    const memory = await prisma.memory.findUnique({
      where: { id },
    })

    if (!memory) {
      return NextResponse.json({ error: "Memory not found" }, { status: 404 })
    }

    await prisma.memory.delete({
      where: { id },
    })

    // Log the moderation action
    await prisma.moderationLog.create({
      data: {
        adminId: session.user.id,
        adminName: session.user.name || session.user.username,
        targetId: id,
        targetName: memory.description.substring(0, 30) + "...",
        action: "DELETE_MEMORY",
        reason: `Deleted memory uploaded by ${memory.uploaderName}`,
      },
    })

    return NextResponse.json({ success: true, message: "Memory deleted successfully" })
  } catch (error) {
    console.error("Admin delete memory error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
