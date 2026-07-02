"use client"

import React, { useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Github, Linkedin, Edit3, ArrowLeft, Terminal, Cpu, Bug, Coffee, Calendar, Layers, Code2 } from "lucide-react"
import ProfileCard from "@/components/ui/ProfileCard"
import { ShortcodeParser } from "@/components/profile/shortcode-parser"

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
  const statsObj = (student.stats as Record<string, any>) || {}

  // Script evaluator side effect for Advanced JS Code execution
  useEffect(() => {
    if (!statsObj.advanceMode || !statsObj.customJs) return

    const scriptId = "student-custom-script"
    // Remove previous script execution to clean workspace env
    const existing = document.getElementById(scriptId)
    if (existing) existing.remove()

    const script = document.createElement("script")
    script.id = scriptId
    script.type = "text/javascript"
    script.textContent = `
      (function() {
        try {
          ${statsObj.customJs}
        } catch (err) {
          console.error("[ADVANCED_JS_ERROR]:", err);
        }
      })();
    `
    document.body.appendChild(script)

    return () => {
      const scriptToRemove = document.getElementById(scriptId)
      if (scriptToRemove) scriptToRemove.remove()
    }
  }, [statsObj.advanceMode, statsObj.customJs])
  let blocks = statsObj.blocks
  if (!blocks || !Array.isArray(blocks) || blocks.length === 0) {
    blocks = [
      {
        id: "default-bio",
        type: "markdown",
        title: "system.bio",
        content: student.bio || "No biography provided yet.",
        colSpan: 2,
      },
      {
        id: "default-stats",
        type: "metrics",
        title: "compilation_metrics",
        colSpan: 1,
      }
    ]
  }

  // If Advanced Mode is active, bypass standard layout grid completely
  if (statsObj.advanceMode) {
    return (
      <div className="min-h-svh relative student-profile-wrapper bg-background text-foreground">
        
        {/* Custom stylesheet override */}
        {(student.customCss || statsObj.customCss) && (
          <style
            dangerouslySetInnerHTML={{
              __html: statsObj.customCss || student.customCss || "",
            }}
          />
        )}

        {/* Render student custom HTML layout structure directly in the flow */}
        <div
          dangerouslySetInnerHTML={{
            __html: statsObj.customHtml || "<div className='p-8 font-mono text-xs'>No HTML layout compiled.</div>"
          }}
        />

        {/* Floating toolbar to navigate and configure profile page */}
        <div className="fixed bottom-6 right-6 z-[9999] flex gap-2 p-1.5 bg-black/80 backdrop-blur-md border border-white/10 rounded-full shadow-lg">
          <Button variant="ghost" asChild size="sm" className="font-mono text-3xs rounded-full h-8 text-white hover:bg-white/10">
            <Link href="/browse">
              <ArrowLeft className="h-3 w-3 mr-1" /> Directory
            </Link>
          </Button>
          {isOwner && isApproved && (
            <Button asChild size="sm" className="font-mono text-3xs rounded-full h-8 bg-primary text-primary-foreground hover:bg-primary/95">
              <Link href={`/profile/${student.username}/edit`}>
                <Edit3 className="h-3 w-3 mr-1" /> Edit Profile
              </Link>
            </Button>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-svh bg-background text-foreground py-8 md:py-16 relative student-profile-wrapper">
      
      {/* CUSTOM STUDENT CSS */}
      {student.customCss && (
        <style
          dangerouslySetInnerHTML={{
            __html: student.customCss,
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
          <div className="space-y-4 flex flex-col items-center">
            <div className="profile-card w-full max-w-[280px]">
              <ProfileCard
                name={student.name}
                title={student.role}
                handle={student.username}
                status={`🐛 ${statsObj.bugsFixed ?? 0} / ☕ ${statsObj.coffeeConsumed ?? 0}`}
                contactText="GitHub Profile"
                avatarUrl={student.avatarUrl || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=400&h=400&fit=crop"}
                showUserInfo={!!student.github}
                enableTilt={true}
                behindGlowEnabled={true}
                behindGlowColor="rgba(124, 58, 237, 0.25)"
                behindGlowSize="50%"
                onContactClick={() => {
                  if (student.github) window.open(student.github, "_blank");
                }}
              />
            </div>
            
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

          {/* Right Column: Bento blocks Grid */}
          <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-3 gap-6">
            {blocks.map((block: any) => {
              const spanClass =
                block.colSpan === 2
                  ? "md:col-span-2"
                  : block.colSpan === 3
                  ? "md:col-span-3"
                  : "md:col-span-1"

              let HeaderIcon = Terminal
              if (block.type === "skills") HeaderIcon = Cpu
              else if (block.type === "projects") HeaderIcon = Layers
              else if (block.type === "timeline") HeaderIcon = Calendar
              else if (block.type === "metrics") HeaderIcon = Cpu
              else if (block.type === "code") HeaderIcon = Code2

              return (
                <Card key={block.id} className={`${spanClass} border-border bg-card shadow-xs`}>
                  <CardHeader className="border-b border-border/50 py-3.5 px-5 flex flex-row items-center gap-2">
                    <HeaderIcon className="h-4 w-4 text-primary" />
                    <CardTitle className="text-xs font-bold font-mono uppercase tracking-wider">
                      {block.title || "block_section"}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-5 font-mono text-xs">
                    {block.type === "markdown" && (
                      <ShortcodeParser text={block.content || ""} />
                    )}

                    {block.type === "code" && (
                      <div className="w-full h-full min-h-[220px] rounded-lg overflow-hidden border border-border bg-black/40 relative">
                        <iframe
                          srcDoc={`
                            <!DOCTYPE html>
                            <html>
                              <head>
                                <meta charset="utf-8">
                                <style>
                                  body {
                                    margin: 0;
                                    padding: 16px;
                                    color: #f3f4f6;
                                    font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace;
                                    font-size: 13px;
                                    background: transparent;
                                    line-height: 1.5;
                                    overflow-wrap: break-word;
                                  }
                                  ${block.css || ""}
                                </style>
                              </head>
                              <body>
                                ${block.html || ""}
                              </body>
                            </html>
                          `}
                          sandbox="allow-scripts"
                          className="w-full h-full min-h-[220px] border-0"
                          loading="lazy"
                        />
                      </div>
                    )}

                    {block.type === "skills" && block.skills && (
                      <div className="flex flex-wrap gap-2 pt-1">
                        {block.skills.map((skill: string, sIdx: number) => (
                          <span
                            key={sIdx}
                            className="px-2.5 py-1 bg-primary/10 border border-primary/20 text-primary rounded-md text-[10px] font-mono"
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                    )}

                    {block.type === "projects" && block.projects && (
                      <div className="grid grid-cols-1 gap-3 pt-1">
                        {block.projects.map((proj: any, pIdx: number) => (
                          <div
                            key={pIdx}
                            className="p-3 border border-border bg-background/50 rounded-lg flex flex-col justify-between"
                          >
                            <div className="flex justify-between items-center">
                              <span className="font-bold text-xs text-foreground font-sans">
                                {proj.title}
                              </span>
                              {proj.link && (
                                <a
                                  href={proj.link}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-primary hover:underline text-[9px] font-mono"
                                >
                                  [code_src]
                                </a>
                              )}
                            </div>
                            <p className="text-[10px] text-muted-foreground mt-1 leading-normal">
                              {proj.description}
                            </p>
                          </div>
                        ))}
                      </div>
                    )}

                    {block.type === "timeline" && block.items && (
                      <div className="space-y-3.5 pt-1 pl-1">
                        {block.items.map((item: any, tIdx: number) => (
                          <div
                            key={tIdx}
                            className="flex gap-3 text-xs border-l border-border pl-3 ml-1 relative last:pb-0 pb-1"
                          >
                            <div className="absolute -left-[5px] top-1.5 h-2 w-2 rounded-full bg-primary" />
                            <div>
                              <span className="text-[9px] text-muted-foreground block font-mono">
                                {item.date}
                              </span>
                              <span className="font-semibold text-foreground text-xs font-sans">
                                {item.title}
                              </span>
                              <span className="text-muted-foreground text-[10px] block mt-0.5 leading-normal">
                                {item.description}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {block.type === "metrics" && (
                      <div className="pt-1">
                        {Object.keys(statsObj).filter((k) => k !== "blocks").length === 0 ? (
                          <p className="text-3xs text-muted-foreground">No diagnostics compiled.</p>
                        ) : (
                          <div className="grid grid-cols-2 gap-3">
                            {Object.entries(statsObj)
                              .filter(([key]) => key !== "blocks")
                              .map(([key, val]) => {
                                let Icon = Cpu
                                let color = "text-primary"
                                if (key.toLowerCase().includes("bug")) {
                                  Icon = Bug
                                  color = "text-destructive"
                                } else if (
                                  key.toLowerCase().includes("coffee") ||
                                  key.toLowerCase().includes("chai")
                                ) {
                                  Icon = Coffee
                                  color = "text-amber-500"
                                }

                                return (
                                  <div
                                    key={key}
                                    className="p-3 rounded-lg border border-border bg-background/50 flex flex-col justify-between h-20 shadow-2xs"
                                  >
                                    <span
                                      className="text-[9px] text-muted-foreground uppercase tracking-wider truncate"
                                      title={key}
                                    >
                                      {key.replace(/([A-Z])/g, " $1").trim()}
                                    </span>
                                    <div className="flex items-end justify-between mt-1">
                                      <span className="text-sm font-bold text-foreground truncate max-w-[80%]">
                                        {val as React.ReactNode}
                                      </span>
                                      <Icon className={`h-3.5 w-3.5 ${color}`} />
                                    </div>
                                  </div>
                                )
                              })}
                          </div>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
