"use client"

import { Button } from "@/components/ui/button"
import Link from "next/link"
import { useSession } from "next-auth/react"
import { Terminal, ArrowRight, Sparkles, BookOpen } from "lucide-react"

export function HeroSection() {
  const { data: session } = useSession()

  return (
    <section className="relative overflow-hidden bg-background min-h-[90vh] flex items-center justify-center border-b border-border">
      
      {/* Subtle thin layout grid lines - minimalist blueprint feel */}
      <div className="absolute inset-0 grid grid-cols-4 pointer-events-none opacity-5">
        <div className="border-r border-foreground h-full" />
        <div className="border-r border-foreground h-full" />
        <div className="border-r border-foreground h-full" />
        <div className="h-full" />
      </div>

      <div className="container mx-auto max-w-7xl px-4 md:px-6 py-16 md:py-24 relative z-10">
        <div className="mx-auto max-w-3xl text-center space-y-8">
          
          {/* Badge */}
          <div className="inline-block animate-fade-in">
            <span className="inline-flex items-center gap-1.5 bg-primary/10 border border-primary/20 text-primary px-3.5 py-1 rounded-full text-xs font-mono font-medium">
              <Terminal className="h-3.5 w-3.5" /> classOf2026.init()
            </span>
          </div>

          {/* Typing Code Hero */}
          <div className="space-y-4">
            <h1 className="text-3xl sm:text-5xl md:text-6xl font-bold tracking-tight text-foreground font-mono leading-tight max-w-2xl mx-auto text-balance">
              const graduation = new Promise(resolve =&gt; 
              <span className="text-primary block mt-2">cseBatch.celebrate();</span>
            </h1>
            <p className="text-sm md:text-base text-muted-foreground font-mono max-w-xl mx-auto leading-relaxed pt-2">
              A minimalist digital portfolio registry to archive class profiles, code overrides, snapshots, and bug reports.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center pt-4 px-4 max-w-md mx-auto">
            {session ? (
              <Button size="lg" className="h-11 px-6 font-mono text-xs w-full sm:w-auto" asChild>
                <Link href={`/profile/${session.user.username}`}>
                  view_my_profile <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            ) : (
              <Button size="lg" className="h-11 px-6 font-mono text-xs w-full sm:w-auto" asChild>
                <Link href="/register">
                  register_profile <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            )}
            
            <Button
              size="lg"
              variant="outline"
              className="h-11 px-6 font-mono text-xs w-full sm:w-auto bg-card border-border hover:bg-muted text-foreground"
              asChild
            >
              <Link href="/browse">browse_directory</Link>
            </Button>
          </div>

        </div>
      </div>

      {/* Subtle minimalist glowing gradients */}
      <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 translate-x-1/2 translate-y-1/2 w-64 h-64 bg-accent/5 rounded-full blur-3xl pointer-events-none" />
    </section>
  )
}