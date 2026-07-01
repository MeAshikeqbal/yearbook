import React from "react"
import { notFound } from "next/navigation"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { ProfileView } from "@/components/profile/profile-view"

export const dynamic = "force-dynamic";

interface ProfilePageProps {
  params: Promise<{ username: string }>
}

export default async function ProfilePage({ params }: ProfilePageProps) {
  const { username } = await params
  const session = await getServerSession(authOptions)

  const student = await prisma.student.findUnique({
    where: { username: username.toLowerCase().trim() },
    include: {
      user: {
        select: {
          status: true,
        },
      },
    },
  })

  if (!student) {
    notFound()
  }

  const isOwner = session?.user.id === student.userId
  const isAdmin = session?.user.role === "ADMIN"
  const isApproved = student.user.status === "APPROVED"

  if (!isApproved && !isOwner && !isAdmin) {
    notFound()
  }

  return (
    <ProfileView
      student={student}
      isOwner={isOwner}
      isApproved={isApproved}
    />
  )
}
