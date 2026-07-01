import React from "react"
import { prisma } from "@/lib/prisma"
import FlipbookClient from "./flipbook-client"

export const revalidate = 0;

export default async function FlipbookPage() {
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
      avatarUrl: true,
    },
    orderBy: {
      name: "asc",
    },
  })

  // Fetch some highlighted memories to show in the flipbook memory spread page
  const memories = await prisma.memory.findMany({
    take: 6,
    orderBy: {
      date: "desc",
    },
  })

  return <FlipbookClient students={students} memories={memories} />
}
