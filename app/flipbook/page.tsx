import React from "react"
import { prisma } from "@/lib/prisma"
import FlipbookClient from "./flipbook-client"
import { isFeatureEnabled } from "@/lib/features"
import FeatureDisabled from "@/components/ui/feature-disabled"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"

export const revalidate = 0;

export default async function FlipbookPage() {
  const enabled = await isFeatureEnabled("FLIPBOOK", true)
  if (!enabled) {
    return (
      <>
        <Header />
        <FeatureDisabled feature="Physical Flipbook" />
        <Footer />
      </>
    )
  }
  // Fetch approved students to display in the flipbook profile spread pages
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
      github: true,
      linkedin: true,
    },
    orderBy: {
      name: "asc",
    },
  })

  // Fetch highlighted memories to show in the flipbook memory spread pages
  const memories = await prisma.memory.findMany({
    take: 10,
    orderBy: {
      date: "desc",
    },
    select: {
      id: true,
      imageUrl: true,
      description: true,
      date: true,
      uploaderName: true,
      location: true,
    },
  })

  return <FlipbookClient students={students} memories={memories} />
}
