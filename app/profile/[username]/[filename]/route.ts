import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(
  req: Request,
  { params }: { params: Promise<{ username: string; filename: string }> }
) {
  const { username, filename } = await params
  const lowerFilename = filename.toLowerCase()

  // Only handle files starting with "me." and containing standard image extensions
  if (!lowerFilename.startsWith("me.") || !/\.(png|jpg|jpeg|webp|gif)$/.test(lowerFilename)) {
    return new NextResponse("Not Found", { status: 404 })
  }

  // Lookup the student profile's avatarUrl
  const student = await prisma.student.findUnique({
    where: { username: username.toLowerCase().trim() },
    select: { avatarUrl: true },
  })

  if (!student || !student.avatarUrl) {
    return new NextResponse("Profile or Avatar Not Found", { status: 404 })
  }

  try {
    const res = await fetch(student.avatarUrl)
    if (!res.ok) {
      throw new Error(`Failed to fetch avatar from: ${student.avatarUrl}`)
    }

    const contentType = res.headers.get("content-type") || "image/png"
    const buffer = await res.arrayBuffer()

    return new NextResponse(Buffer.from(buffer), {
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=3600, s-maxage=3600",
      },
    })
  } catch (err) {
    console.error(`[SERVING_AVATAR_ERROR] Error fetching me.xxx for user ${username}:`, err)
    return new NextResponse("Internal Server Error", { status: 500 })
  }
}
