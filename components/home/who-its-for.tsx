"use client"

import { ShieldCheck, Lock, AlertTriangle } from "lucide-react"

export function WhoItsFor() {
  return (
    <section className="container mx-auto max-w-7xl px-4 md:px-6 py-12 md:py-20 relative">
      <div className="max-w-3xl mx-auto">
        <div className="relative rounded-lg border-2 border-dashed border-accent/30 bg-accent/5 p-4 sm:p-8 md:p-10 text-center font-mono space-y-6 overflow-hidden group">
          
          {/* Subtle background lock element */}
          <div className="absolute -right-6 -bottom-6 w-24 h-24 text-accent/10 pointer-events-none select-none group-hover:scale-110 transition-transform duration-300">
            <Lock className="w-full h-full" />
          </div>

          {/* Access level details */}
          <div className="flex justify-center">
            <div className="rounded-full bg-accent/10 border border-accent/20 p-3 text-accent animate-float">
              <ShieldCheck className="h-6 w-6" />
            </div>
          </div>

          <div className="space-y-3">
            <h3 className="text-xs sm:text-base md:text-xl font-bold text-foreground tracking-tight whitespace-normal break-words">
              [ AUTHORIZATION_SCOPE:<br className="sm:hidden" /> SKF_CLASS_OF_2026 ]
            </h3>
            <p className="text-sm md:text-base text-muted-foreground max-w-xl mx-auto leading-relaxed">
              This system registry is restricted to students belonging to the <span className="text-accent font-semibold">SKF Class of 2026</span>.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 justify-center text-2xs md:text-xs text-muted-foreground pt-2">
            <div className="flex items-center gap-1.5 justify-center bg-card border border-border/80 rounded-md px-3 py-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
              <span>Status: Opt-in (Voluntary)</span>
            </div>
            <div className="flex items-center gap-1.5 justify-center bg-card border border-border/80 rounded-md px-3 py-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-primary" />
              <span>Verification: ID Upload Required</span>
            </div>
          </div>

          {/* Security footnote */}
          <p className="text-3xs text-muted-foreground/60 max-w-md mx-auto pt-2 leading-normal">
            By registering, you authorize the display of your custom HTML/CSS stylesheet overrides on your public profile directory route.
          </p>

        </div>
      </div>
    </section>
  )
}