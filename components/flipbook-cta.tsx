"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import Link from "next/link"
import { Sparkles, Book, ArrowRight, Code2 } from "lucide-react"

export function FlipbookCTA() {
  return (
    <section className="container mx-auto max-w-7xl px-4 md:px-6 py-12 md:py-20 relative">
      
      {/* Background glow blobs */}
      <div className="absolute top-1/2 left-1/3 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-accent/5 rounded-full blur-3xl pointer-events-none" />

      <Card className="max-w-5xl mx-auto bg-card/65 backdrop-blur-md border border-border/80 overflow-hidden relative group shadow-2xl">
        <CardContent className="p-0 relative z-10">
          
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-0 items-center">
            
            {/* Left side: Information */}
            <div className="p-8 md:p-12 md:col-span-7 space-y-6 text-left font-mono">
              <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/20 text-primary px-3.5 py-1 rounded-full text-xs font-semibold uppercase tracking-wider animate-pulse">
                <Sparkles className="h-3.5 w-3.5" />
                Featured Module
              </div>

              <h3 className="text-3xl md:text-4xl font-bold tracking-tight text-foreground leading-tight">
                Inspect the Interactive Flipbook
              </h3>

              <p className="text-sm md:text-base text-muted-foreground leading-relaxed">
                Flip pages, read classmate bio overrides, and search student profiles in a physical-magazine inspired digital layout.
              </p>

              <div className="pt-2">
                <Button
                  size="lg"
                  className="h-12 px-6 text-xs font-mono bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all duration-300"
                  asChild
                >
                  <Link href="/flipbook">
                    ./run_flipbook_preview <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </div>

            {/* Right side: 3D Isometric Book Mockup */}
            <div className="p-8 md:p-12 md:col-span-5 flex justify-center bg-muted/30 border-t md:border-t-0 md:border-l border-border/80 relative overflow-hidden select-none">
              
              {/* Grid backdrop */}
              <div className="absolute inset-0 grid grid-cols-4 pointer-events-none opacity-5">
                <div className="border-r border-foreground h-full" />
                <div className="border-r border-foreground h-full" />
                <div className="border-r border-foreground h-full" />
                <div className="h-full" />
              </div>

              {/* 3D Perspective Box */}
              <div className="perspective-[1000px] py-6 relative cursor-pointer group/book">
                <div className="w-[140px] h-[200px] relative rounded-r-md transform-3d rotate-y-[-16deg] rotate-x-[8deg] group-hover/book:rotate-y-[-30deg] group-hover/book:rotate-x-[12deg] group-hover/book:scale-105 transition-all duration-700 ease-out shadow-[10px_10px_25px_rgba(0,0,0,0.25)]">
                  
                  {/* Book Spine */}
                  <div className="absolute left-0 top-0 w-3 h-full bg-primary-foreground/90 border-r border-black/10 z-20 rounded-l-xs shadow-inner" />
                  
                  {/* Book Page Edges (Visible on right) */}
                  <div className="absolute top-[4px] bottom-[4px] right-[-4px] w-[8px] bg-slate-100 dark:bg-slate-800 border-y border-r border-border/60 z-10 rounded-r-sm shadow-sm" />
                  
                  {/* Book Cover */}
                  <div className="absolute inset-0 bg-primary rounded-r-sm z-10 flex flex-col justify-between p-4 border border-primary-foreground/10 overflow-hidden">
                    {/* Cover graphic */}
                    <div className="absolute inset-0 bg-linear-to-br from-white/10 via-transparent to-black/30 pointer-events-none" />
                    
                    <div className="flex items-center justify-between text-primary-foreground/80 font-mono text-3xs border-b border-primary-foreground/20 pb-1.5">
                      <span>SKF_BATCH</span>
                      <Code2 className="h-3.5 w-3.5 animate-pulse" />
                    </div>

                    <div className="space-y-1 py-4">
                      <div className="text-xl font-bold font-mono tracking-tighter text-primary-foreground leading-none">
                        CLASS
                      </div>
                      <div className="text-xl font-bold font-mono tracking-tighter text-primary-foreground leading-none">
                        OF
                      </div>
                      <div className="text-2xl font-black font-mono tracking-tighter text-accent leading-none filter drop-shadow-md">
                        2026
                      </div>
                    </div>

                    <div className="text-primary-foreground/75 font-mono text-[9px] border-t border-primary-foreground/20 pt-1.5">
                      // digital_edition
                    </div>
                  </div>

                  {/* Inside Mock Page (revealed slightly on hover) */}
                  <div className="absolute inset-0 bg-card rounded-r-xs z-5 origin-left transform group-hover/book:rotate-y-[-20deg] transition-transform duration-700 ease-out flex flex-col justify-between p-4 border border-border shadow-md">
                    <div className="w-full h-2 bg-muted rounded-full" />
                    <div className="space-y-1">
                      <div className="w-[85%] h-1 bg-muted rounded-full" />
                      <div className="w-[90%] h-1 bg-muted rounded-full" />
                      <div className="w-[70%] h-1 bg-muted rounded-full" />
                    </div>
                    <div className="w-1/2 h-2.5 bg-primary/20 rounded-full" />
                  </div>

                </div>
              </div>

            </div>

          </div>

        </CardContent>
      </Card>
    </section>
  )
}