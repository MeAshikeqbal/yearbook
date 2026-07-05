import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { verifyCsrf } from "@/lib/csrf"
import { sendWelcomeEmail } from "@/lib/email"

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
    const body = await req.json()
    const { role, status, name, username, bio, stats, customCss } = body

    // Fetch target user with student profile
    const targetUser = await prisma.user.findUnique({
      where: { id },
      include: { studentProfile: true }
    })

    if (!targetUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    const shouldSendWelcome = status === "APPROVED" && targetUser.status !== "APPROVED";

    // Guardrail: MODERATOR cannot modify ADMIN or other MODERATOR accounts
    if (session.user.role === "MODERATOR" && targetUser.role !== "STUDENT") {
      return NextResponse.json({ error: "Forbidden: Moderators can only modify student accounts." }, { status: 403 })
    }

    // Guardrail: MODERATOR cannot modify role to ADMIN or MODERATOR
    if (session.user.role === "MODERATOR" && role && role !== "STUDENT") {
      return NextResponse.json({ error: "Forbidden: Moderators cannot escalate account roles." }, { status: 403 })
    }

    // Update User Role and Status
    const userUpdateData: any = {}
    if (role !== undefined) userUpdateData.role = role
    if (status !== undefined) userUpdateData.status = status

    if (Object.keys(userUpdateData).length > 0) {
      await prisma.user.update({
        where: { id },
        data: userUpdateData,
      })
    }

    // Update Student Profile if provided
    if (name !== undefined || username !== undefined || bio !== undefined || stats !== undefined || customCss !== undefined) {
      const cleanUsername = username ? username.toLowerCase().trim() : undefined
      
      // Check username unique constraint if username is changing
      if (cleanUsername && cleanUsername !== targetUser.studentProfile?.username) {
        const usernameExists = await prisma.student.findUnique({
          where: { username: cleanUsername }
        })
        if (usernameExists) {
          return NextResponse.json({ error: "Username is already taken" }, { status: 400 })
        }
      }

      const studentData: any = {}
      if (name !== undefined) studentData.name = name
      if (cleanUsername !== undefined) studentData.username = cleanUsername
      if (bio !== undefined) studentData.bio = bio
      if (stats !== undefined) studentData.stats = stats
      if (customCss !== undefined) studentData.customCss = customCss

      if (targetUser.studentProfile) {
        await prisma.student.update({
          where: { userId: id },
          data: studentData,
        })
      } else {
        // If student profile somehow doesn't exist, create it
        await prisma.student.create({
          data: {
            userId: id,
            name: name || "Unknown",
            username: cleanUsername || `user_${id.substring(0, 8)}`,
            bio: bio || "",
            role: "CSE Student",
            avatarUrl: `https://api.dicebear.com/7.x/bottts/svg?seed=${cleanUsername || id}`,
            stats: stats || {},
            customCss: customCss || null,
          }
        })
      }
    }

    // Log the moderation action
    await prisma.moderationLog.create({
      data: {
        adminId: session.user.id,
        adminName: session.user.name || session.user.username,
        targetId: id,
        targetName: name || targetUser.studentProfile?.name || targetUser.email,
        action: "UPDATE_PROFILE",
        reason: `Updated user profile/settings. Details: ${JSON.stringify(userUpdateData)} / ${role ? `Role to ${role}` : ""} ${status ? `Status to ${status}` : ""}`,
      },
    })

    if (shouldSendWelcome) {
      const updatedUser = await prisma.user.findUnique({
        where: { id },
        include: { studentProfile: true }
      });
      if (updatedUser) {
        await sendWelcomeEmail({
          email: updatedUser.email,
          name: updatedUser.studentProfile?.name || "Student",
          username: updatedUser.studentProfile?.username || "student",
          role: updatedUser.studentProfile?.role || "CSE Student",
        });
      }
    }

    return NextResponse.json({ success: true, message: "User updated successfully" })
  } catch (error) {
    console.error("Admin update user error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
