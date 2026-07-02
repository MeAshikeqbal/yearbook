import React from "react"
import { notFound, redirect } from "next/navigation"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import ProfileEditorClient from "@/components/profile/edit/editor-client"

export const dynamic = "force-dynamic";

interface EditProfilePageProps {
  params: Promise<{ username: string }>
}

export default async function EditProfilePage({ params }: EditProfilePageProps) {
  const { username } = await params;
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect("/login")
  }

  // Fetch the student profile
  const student = await prisma.student.findUnique({
    where: { username: username.toLowerCase().trim() },
    include: {
      user: {
        select: {
          id: true,
          status: true,
        },
      },
    },
  })

  if (!student) {
    notFound()
  }

  // Check profile ownership or ADMIN status
  const isOwner = session.user.id === student.userId
  const isAdmin = session.user.role === "ADMIN"

  if (!isOwner && !isAdmin) {
    redirect("/")
  }

  // Restrict editing if pending approval
  if (student.user.status !== "APPROVED" && !isAdmin) {
    redirect(`/profile/${student.username}`)
  }

  // Format student data for client editor
  const studentData = {
    username: student.username,
    name: student.name,
    role: student.role,
    bio: student.bio,
    avatarUrl: student.avatarUrl,
    github: student.github || "",
    linkedin: student.linkedin || "",
    customCss: student.customCss || "",
    stats: (student.stats as Record<string, any>) || {},
  }

  return <ProfileEditorClient initialData={studentData} />
}
