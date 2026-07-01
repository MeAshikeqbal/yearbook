import React from "react"
import { notFound } from "next/navigation"
import Link from "next/link"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Github, Linkedin, Edit3, ArrowLeft, Terminal, Cpu, Bug, Coffee } from "lucide-react"

export const dynamic = "force-dynamic";

interface ProfilePageProps {
  params: Promise<{ username: string }>
}

export default async function ProfilePage({ params }: ProfilePageProps) {
  const { username } = await params;
  const session = await getServerSession(authOptions)

  // Fetch the student profile
  const student = await prisma.student.findUnique({
    where: { username: username.toLowerCase().trim() },
    include: {
      user: {
        select: {
          id: true,
          email: true,
          status: true,
        },
      },
    },
  })

  // 404 if profile doesn't exist or is not approved (and viewer is not admin/owner)
  if (!student) {
    notFound()
  }

  const isOwner = session?.user.id === student.userId
  const isAdmin = session?.user.role === "ADMIN"
  const isApproved = student.user.status === "APPROVED"

  if (!isApproved && !isOwner && !isAdmin) {
    notFound()
  }

  // Parse stats JSON
  const stats = (student.stats as Record<string, any>) || {}

  return (
    <div className="min-h-svh bg-background text-foreground py-8 md:py-16 relative student-profile-wrapper">
      
      {/* SCOPED CUSTOM STUDENT CSS */}
      {student.customCss && (
        <style
          dangerouslySetInnerHTML={{
            __html: `
              /* Scope custom CSS to this profile page container */
              .student-profile-wrapper {
                ${student.customCss}
              }
            `,
          }}
        />
      )}

      <div className="container mx-auto max-w-4xl px-4 md:px-6 space-y-8">
        
        {/* Navigation & Edit Controls */}
        <div className="flex justify-between items-center border-b border-border pb-4">
          <Button variant="ghost" asChild size="sm" className="font-mono text-xs gap-1">
            <Link href="/browse">
              <ArrowLeft className="h-4 w-4" /> ../directory
            </Link>
          </Button>

          {isOwner && isApproved && (
            <Button asChild size="sm" variant="outline" className="font-mono text-xs gap-1 border-primary/30 hover:border-primary">
              <Link href={`/profile/${student.username}/edit`}>
                <Edit3 className="h-4 w-4 text-primary" /> edit_profile
              </Link>
            </Button>
          )}
        </div>

        {/* Profile Card Layout */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
          
          {/* Left Column: Avatar & Socials */}
          <div className="flex flex-col items-center text-center p-6 border border-border bg-card rounded-lg space-y-4 profile-card">
            <div className="relative h-32 w-32 rounded-full overflow-hidden border border-border bg-muted flex items-center justify-center">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={student.avatarUrl || "https://placehold.co/150"}
                alt={student.name}
                className="h-full w-full object-cover"
              />
            </div>
            <div className="space-y-1">
              <h2 className="text-xl font-bold tracking-tight text-foreground">{student.name}</h2>
              <span className="text-xs font-mono text-muted-foreground block">@{student.username}</span>
            </div>
            <span className="inline-block bg-primary/10 border border-primary/20 text-primary font-mono text-3xs px-3 py-1 rounded-full">
              {student.role}
            </span>

            <div className="flex gap-3 pt-2">
              {student.github && (
                <Button size="icon" variant="outline" asChild className="h-8 w-8 bg-background border-border">
                  <a href={student.github} target="_blank" rel="noopener noreferrer">
                    <Github className="h-4 w-4" />
                  </a>
                </Button>
              )}
              {student.linkedin && (
                <Button size="icon" variant="outline" asChild className="h-8 w-8 bg-background border-border">
                  <a href={student.linkedin} target="_blank" rel="noopener noreferrer">
                    <Linkedin className="h-4 w-4" />
                  </a>
                </Button>
              )}
            </div>
          </div>

          {/* Right Column: Bio & Developer Stats */}
          <div className="md:col-span-2 space-y-6">
            
            {/* Bio Block */}
            <Card className="border-border bg-card">
              <CardHeader className="border-b border-border/50 py-4 px-6 flex flex-row items-center gap-2">
                <Terminal className="h-4 w-4 text-primary" />
                <CardTitle className="text-sm font-bold font-mono">system.bio</CardTitle>
              </CardHeader>
              <CardContent className="p-6 font-mono text-sm leading-relaxed whitespace-pre-wrap text-foreground/90">
                {student.bio}
              </CardContent>
            </Card>

            {/* Developer Diagnostics (Stats) */}
            <Card className="border-border bg-card">
              <CardHeader className="border-b border-border/50 py-4 px-6 flex flex-row items-center gap-2">
                <Cpu className="h-4 w-4 text-accent" />
                <CardTitle className="text-sm font-bold font-mono">compilation_metrics</CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                {Object.keys(stats).length === 0 ? (
                  <p className="text-xs font-mono text-muted-foreground">No custom execution metrics compiled.</p>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                    {Object.entries(stats).map(([key, val]) => {
                      // Custom iconography for standard developer metrics
                      let Icon = Cpu
                      let color = "text-primary"
                      if (key.toLowerCase().includes("bug")) {
                        Icon = Bug
                        color = "text-destructive"
                      } else if (key.toLowerCase().includes("coffee") || key.toLowerCase().includes("chai")) {
                        Icon = Coffee
                        color = "text-amber-500"
                      }

                      return (
                        <div key={key} className="p-4 rounded-lg border border-border bg-background flex flex-col justify-between h-24 font-mono shadow-2xs">
                          <span className="text-3xs text-muted-foreground uppercase tracking-wider truncate" title={key}>
                            {key.replace(/([A-Z])/g, ' $1').trim()}
                          </span>
                          <div className="flex items-end justify-between mt-1">
                            <span className="text-lg font-bold text-foreground truncate max-w-[80%]">
                              {val}
                            </span>
                            <Icon className={`h-4 w-4 ${color}`} />
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
