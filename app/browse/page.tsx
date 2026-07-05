import React from "react"
import { prisma } from "@/lib/prisma"
import BrowseClient from "@/components/browse/browse-client"
import { isFeatureEnabled } from "@/lib/features"
import FeatureDisabled from "@/components/ui/feature-disabled"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"

// Server component to fetch approved students directly from PostgreSQL
export const dynamic = "force-dynamic";

export default async function BrowsePage() {
  const enabled = await isFeatureEnabled("BROWSE", true)
  if (!enabled) {
    return (
      <>
        <Header />
        <FeatureDisabled feature="Classmates Directory" />
        <Footer />
      </>
    )
  }

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
      customCss: true,
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
    customCss: s.customCss,
  }))

  return <BrowseClient initialStudents={formattedStudents} />
}
