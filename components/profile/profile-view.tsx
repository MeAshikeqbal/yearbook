"use client"

import React from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Github, Linkedin, Edit3, ArrowLeft, Terminal, Cpu, Bug, Coffee } from "lucide-react"
import ProfileCard from "@/components/ui/ProfileCard"

interface Student {
  username: string
  name: string
  role: string
  bio: string | null
  avatarUrl: string | null
  github: string | null
  linkedin: string | null
  customCss: string | null
  stats: any
}

interface ProfileViewProps {
  student: Student
  isOwner: boolean
  isApproved: boolean
}

export function ProfileView({ student, isOwner, isApproved }: ProfileViewProps) {
  const stats = student.stats || {}

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
          
          {/* Left Column: Avatar & Socials with 3D Tilt */}
          <div className="space-y-4">
            <ProfileCard
              name={student.name}
              title={student.role}
              handle={student.username}
              status={`🐛 ${stats.bugsFixed ?? 0} / ☕ ${stats.coffeeConsumed ?? 0}`}
              contactText="GitHub"
              avatarUrl={student.avatarUrl || "https://placehold.co/150"}
              showUserInfo={true}
              enableTilt={true}
              enableMobileTilt={false}
              behindGlowEnabled={true}
              behindGlowColor="rgba(var(--primary-rgb, 125, 190, 255), 0.35)"
              behindGlowSize="45%"
              innerGradient="linear-gradient(145deg, rgba(30,30,46,0.85) 0%, rgba(20,20,30,0.95) 100%)"
              onContactClick={() => {
                if (student.github) window.open(student.github, "_blank");
              }}
            />
            
            {/* Social Links under Card */}
            {(student.github || student.linkedin) && (
              <div className="flex justify-center gap-2 p-2 bg-card border border-border rounded-xl">
                {student.github && (
                  <Button size="sm" variant="ghost" asChild className="gap-2 text-[10px] font-mono h-8">
                    <a href={student.github} target="_blank" rel="noopener noreferrer">
                      <Github className="h-3.5 w-3.5 text-primary" /> github_profile
                    </a>
                  </Button>
                )}
                {student.linkedin && (
                  <Button size="sm" variant="ghost" asChild className="gap-2 text-[10px] font-mono h-8">
                    <a href={student.linkedin} target="_blank" rel="noopener noreferrer">
                      <Linkedin className="h-3.5 w-3.5 text-primary" /> linkedin_connect
                    </a>
                  </Button>
                )}
              </div>
            )}
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
                              {val as React.ReactNode}
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
