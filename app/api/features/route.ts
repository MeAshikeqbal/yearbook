import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export const dynamic = "force-dynamic"

export async function GET() {
  try {
    const flags = await prisma.featureFlag.findMany()
    const config = flags.reduce((acc, flag) => {
      acc[flag.key] = flag.value
      return acc
    }, {} as Record<string, boolean>)

    return NextResponse.json({ flags: config })
  } catch (error) {
    console.error("Public fetch features API error:", error)
    return NextResponse.json({ error: "Failed to fetch feature flags" }, { status: 500 })
  }
}
