import { Header } from "@/components/header"
import { HeroSection } from "@/components/home/hero-section"
import { FeaturesSection } from "@/components/home/features-section"
import { WhoItsFor } from "@/components/home/who-its-for"
import { FlipbookCTA } from "@/components/flipbook-cta"
import { Footer } from "@/components/footer"
import { prisma } from "@/lib/prisma"

export const dynamic = "force-dynamic"

export default async function Home() {
  let stats = {
    classmatesCount: 0,
    memoriesCount: 0,
    bugsCount: 0,
  }
  let recentClassmates: Array<{
    name: string
    username: string
    avatarUrl: string
    role: string
    stats: Record<string, number | string>
  }> = []

  try {
    const [classmatesCount, memoriesCount, bugsCount] = await Promise.all([
      prisma.student.count({
        where: {
          user: {
            status: "APPROVED",
          },
        },
      }),
      prisma.memory.count(),
      prisma.bug.count(),
    ])

    stats = { classmatesCount, memoriesCount, bugsCount }

    const rawRecent = await prisma.student.findMany({
      where: {
        user: {
          status: "APPROVED",
        },
      },
      select: {
        name: true,
        username: true,
        avatarUrl: true,
        role: true,
        stats: true,
      },
      take: 6,
      orderBy: {
        createdAt: "desc",
      },
    })
    recentClassmates = rawRecent.map((c) => ({
      name: c.name,
      username: c.username,
      avatarUrl: c.avatarUrl,
      role: c.role,
      stats: (c.stats as Record<string, number | string>) || {},
    }))
  } catch (error) {
    console.error("Failed to query homepage stats from database, using seed fallbacks:", error)
    stats = {
      classmatesCount: 124,
      memoriesCount: 312,
      bugsCount: 42,
    }
    recentClassmates = [
      {
        name: "Ashik Iqbal",
        username: "ashik",
        avatarUrl: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=400&h=400&fit=crop",
        role: "Full-Stack Dev / Student Lead",
        stats: { coffeeConsumed: 214, bugsFixed: 404 },
      },
      {
        name: "Emily Watson",
        username: "emily",
        avatarUrl: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=400&fit=crop",
        role: "UI/UX Designer",
        stats: { coffeeConsumed: 128, bugsFixed: 23 },
      },
      {
        name: "Devin Patel",
        username: "devin",
        avatarUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop",
        role: "Security Engineer",
        stats: { coffeeConsumed: 88, bugsFixed: 94 },
      },
    ]
  }

  return (
    <>
      <Header />
      <main className="space-y-4 md:space-y-8 bg-background overflow-x-hidden">
        <HeroSection stats={stats} recentClassmates={recentClassmates} />
        <FeaturesSection />
        <FlipbookCTA />
        <WhoItsFor />
      </main>
      <Footer />
    </>
  )
}