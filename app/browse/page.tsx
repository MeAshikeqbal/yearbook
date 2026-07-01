import React from "react"
import { prisma } from "@/lib/prisma"
import BrowseClient from "./browse-client"

// Server component to fetch approved students directly from PostgreSQL
export const dynamic = "force-dynamic";

export default async function BrowsePage() {
  const students = await prisma.student.findMany({
    where: {
      user: {
        status: "APPROVED",
      },
    },
    select: {
      username: true,
      name: true,
      role: true,
      bio: true,
      avatarUrl: true,
      stats: true,
    },
    orderBy: {
      name: "asc",
    },
  })

  // Format stats JSON for typescript rendering safety
  const formattedStudents = students.map((s) => ({
    username: s.username,
    name: s.name,
    role: s.role,
    bio: s.bio,
    avatarUrl: s.avatarUrl,
    stats: s.stats as Record<string, number | string>,
  }))

  return <BrowseClient initialStudents={formattedStudents} />
}
