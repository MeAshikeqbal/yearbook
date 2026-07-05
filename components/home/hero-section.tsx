"use client"

import { Button } from "@/components/ui/button"
import Link from "next/link"
import { useSession } from "next-auth/react"
import { Terminal, ArrowRight, Sparkles, BookOpen, ChevronRight, Code2, GitBranch } from "lucide-react"
import { useState, useEffect } from "react"

interface HeroSectionProps {
  stats: {
    classmatesCount: number
    memoriesCount: number
    bugsCount: number
  }
  recentClassmates: Array<{
    name: string
    username: string
    avatarUrl: string
    role: string
    stats: Record<string, number | string>
  }>
}

export function HeroSection({ stats, recentClassmates }: HeroSectionProps) {
  const { data: session } = useSession()
  const [terminalLineIndex, setTerminalLineIndex] = useState(0)
  const [typedText, setTypedText] = useState("")
  const commandToType = "cat ./registry-status.json"

  useEffect(() => {
    let timer: NodeJS.Timeout
    
    // Typing simulator for command line
    let charIndex = 0
    const typeCommand = () => {
      if (charIndex < commandToType.length) {
        setTypedText(commandToType.slice(0, charIndex + 1))
        charIndex++
        timer = setTimeout(typeCommand, 60)
      } else {
        // Wait a bit, then show output
        timer = setTimeout(() => {
          setTerminalLineIndex(1)
        }, 500)
      }
    }

    timer = setTimeout(typeCommand, 800)
    return () => clearTimeout(timer)
  }, [])

  return (
    <section className="relative overflow-hidden bg-background min-h-[92vh] flex items-center justify-center border-b border-border py-12 md:py-20 lg:py-24">
      {/* Subtle blueprint grid lines */}
      <div className="absolute inset-0 grid grid-cols-6 pointer-events-none opacity-5">
        <div className="border-r border-foreground h-full" />
        <div className="border-r border-foreground h-full" />
        <div className="border-r border-foreground h-full" />
        <div className="border-r border-foreground h-full" />
        <div className="border-r border-foreground h-full" />
        <div className="h-full" />
      </div>

      {/* Grid Scanline effect */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-5">
        <div className="w-full h-[2px] bg-primary animate-scanline" />
      </div>

      <div className="container mx-auto max-w-7xl px-4 md:px-6 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          
          {/* Left Column: Headline and actions */}
          <div className="lg:col-span-6 space-y-6 md:space-y-8 text-left animate-fade-in-up">
            
            {/* Badge */}
            <div className="inline-block animate-float">
              <span className="inline-flex items-center gap-1.5 bg-primary/10 border border-primary/20 text-primary px-4 py-1.5 rounded-full text-xs font-mono font-medium tracking-tight">
                <Terminal className="h-3.5 w-3.5" /> classOf2026.init()
              </span>
            </div>

            {/* Headline */}
            <div className="space-y-4">
              <h1 className="text-3xl sm:text-5xl md:text-6xl font-bold tracking-tight text-foreground font-mono leading-none">
                const graduation = <br />
                <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent block mt-2 filter drop-shadow-[0_2px_10px_rgba(var(--primary),0.15)]">
                  Promise.resolve();
                </span>
              </h1>
              <p className="text-sm sm:text-base text-muted-foreground font-mono max-w-lg leading-relaxed pt-2">
                A digital registry and code override console for the graduating batch of 2026. Archive snapshots, overwrite css, and inspect class profiles.
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 max-w-md">
              {session ? (
                <Button size="lg" className="h-12 px-6 font-mono text-xs w-full sm:w-auto shadow-md shadow-primary/20 hover:shadow-lg hover:shadow-primary/30 transition-all duration-300" asChild>
                  <Link href={`/profile/${session.user.username}`}>
                    ./view_my_profile <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              ) : (
                <Button size="lg" className="h-12 px-6 font-mono text-xs w-full sm:w-auto shadow-md shadow-primary/20 hover:shadow-lg hover:shadow-primary/30 transition-all duration-300" asChild>
                  <Link href="/register">
                    ./register_profile <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              )}
              
              <Button
                size="lg"
                variant="outline"
                className="h-12 px-6 font-mono text-xs w-full sm:w-auto bg-card border-border hover:bg-muted hover:border-primary/40 text-foreground transition-all duration-300"
                asChild
              >
                <Link href="/browse">./browse_directory</Link>
              </Button>
            </div>

            {/* Dynamic mini database stats row */}
            <div className="grid grid-cols-3 gap-2 sm:gap-4 border-t border-border/80 pt-6 max-w-lg font-mono">
              <div>
                <div className="text-2xl font-bold text-foreground">{stats.classmatesCount}</div>
                <div className="text-2xs text-muted-foreground uppercase tracking-wider">classmates</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-foreground">{stats.memoriesCount}</div>
                <div className="text-2xs text-muted-foreground uppercase tracking-wider">snaps</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-foreground">{stats.bugsCount}</div>
                <div className="text-2xs text-muted-foreground uppercase tracking-wider">debugs</div>
              </div>
            </div>

          </div>

          {/* Right Column: Code Terminal Dashboard */}
          <div className="lg:col-span-6 animate-fade-in-up delay-200">
            <div className="relative w-full rounded-lg border border-border bg-card/85 backdrop-blur-md shadow-2xl overflow-hidden font-mono text-sm group/terminal max-w-xl mx-auto">
              
              {/* Terminal Window Header */}
              <div className="flex items-center justify-between px-4 py-3 bg-muted/60 border-b border-border select-none">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-500/80" />
                  <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
                  <div className="w-3 h-3 rounded-full bg-green-500/80" />
                </div>
                <span className="text-xs text-muted-foreground font-mono">skf-2026-console</span>
                <div className="flex items-center gap-1.5 text-muted-foreground">
                  <GitBranch className="h-3 w-3 text-primary animate-pulse" />
                  <span className="text-3xs uppercase tracking-wide">main</span>
                </div>
              </div>

              {/* Terminal Output */}
              <div className="p-5 space-y-4 min-h-[340px] text-xs leading-relaxed select-text">
                
                {/* Typing Line */}
                <div className="flex flex-wrap items-center gap-x-1 gap-y-0.5 text-foreground break-all">
                  <span className="text-accent font-semibold">visitor@skf2026:~$</span>
                  <span className="break-all">{typedText}</span>
                  <span className="w-1.5 h-4 bg-primary animate-typing-cursor inline-block align-middle" />
                </div>

                {/* Simulated Program Output */}
                {terminalLineIndex >= 1 && (
                  <div className="space-y-4 animate-fade-in duration-300">
                    <div className="text-muted-foreground">
                      {`{`}
                      <div className="pl-4">
                        <span className="text-primary">"status"</span>: <span className="text-accent">"ONLINE"</span>,
                      </div>
                      <div className="pl-4">
                        <span className="text-primary">"class_registry"</span>: <span className="text-yellow-500">"active_compilation"</span>,
                      </div>
                      <div className="pl-4">
                        <span className="text-primary">"classmates_built"</span>: <span className="text-green-500">{stats.classmatesCount}</span>,
                      </div>
                      <div className="pl-4">
                        <span className="text-primary">"snaps_compiled"</span>: <span className="text-green-500">{stats.memoriesCount}</span>,
                      </div>
                      <div className="pl-4">
                        <span className="text-primary">"patches_deployed"</span>: <span className="text-green-500">{stats.bugsCount}</span>
                      </div>
                      {`}`}
                    </div>

                    <div className="pt-2 border-t border-border/40">
                      <div className="text-accent font-semibold mb-2">$ query-recent --limit=3</div>
                      
                      <div className="grid grid-cols-1 gap-2.5">
                        {recentClassmates.slice(0, 3).map((student) => (
                          <Link 
                            href={`/profile/${student.username}`} 
                            key={student.username}
                            className="flex items-center justify-between p-2 rounded-md border border-border/40 bg-muted/20 hover:bg-primary/5 hover:border-primary/30 transition-all duration-200 group/item cursor-pointer"
                          >
                            <div className="flex items-center gap-2">
                              <img 
                                src={student.avatarUrl || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=400&h=400&fit=crop"} 
                                alt={student.name} 
                                className="w-6 h-6 rounded-full border border-border/80 object-cover"
                              />
                              <div>
                                <div className="font-semibold text-foreground flex flex-wrap items-baseline gap-x-1">
                                  <span>{student.name}</span>
                                  <span className="text-3xs text-muted-foreground font-normal">@{student.username}</span>
                                </div>
                                <div className="text-3xs text-muted-foreground">{student.role}</div>
                              </div>
                            </div>
                            <ChevronRight className="w-3.5 h-3.5 text-muted-foreground group-hover/item:text-primary transition-colors" />
                          </Link>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
          
        </div>
      </div>

      {/* Floating radial glow backgrounds */}
      <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-72 h-72 bg-primary/10 rounded-full blur-3xl pointer-events-none animate-pulse-glow" />
      <div className="absolute bottom-1/4 right-1/4 translate-x-1/2 translate-y-1/2 w-96 h-96 bg-accent/8 rounded-full blur-3xl pointer-events-none animate-pulse-glow" />
    </section>
  )
}