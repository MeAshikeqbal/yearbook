"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Camera, Edit3, BookOpen, Terminal, Sparkles, Code2 } from "lucide-react"

const features = [
  {
    icon: Camera,
    title: "Share Memories",
    description: "Upload photos and memorable moments from your college journey. Create a visual story of your time together.",
    snippet: "const upload = async (snap) => { registry.push(snap); }",
    tag: "[UPLOAD_SERVICE]"
  },
  {
    icon: Edit3,
    title: "Sign Yearbooks",
    description: "Leave heartfelt digital signatures and messages on your friends' profiles. Connect and celebrate friendships.",
    snippet: "friend.signatures.push({ from: user, msg: 'HAGS!' })",
    tag: "[OVERRIDE_CONSOLE]"
  },
  {
    icon: BookOpen,
    title: "Relive It All",
    description: "Browse profiles or experience the full class yearbook in an immersive and interactive flipbook format.",
    snippet: "yearbook.flipPage().then(reliveMemories);",
    tag: "[RENDER_ENGINE]"
  },
]

export function FeaturesSection() {
  return (
    <section className="container mx-auto max-w-7xl px-4 md:px-6 py-16 md:py-24 relative">
      {/* Background glow blobs */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-primary/5 rounded-full blur-3xl pointer-events-none" />

      <div className="text-center mb-16 space-y-3 relative z-10 font-mono">
        <div className="inline-flex items-center gap-1.5 bg-accent/10 border border-accent/20 text-accent px-3 py-1 rounded-full text-2xs uppercase tracking-wider font-semibold">
          <Code2 className="h-3.5 w-3.5" /> capabilities.list()
        </div>
        <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-foreground">
          System Features & Protocols
        </h2>
        <p className="text-sm md:text-base text-muted-foreground max-w-2xl mx-auto">
          Everything you need to compile and preserve the definitive record of the Class of 2026.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 max-w-6xl mx-auto relative z-10">
        {features.map((feature, index) => {
          const Icon = feature.icon
          return (
            <Card
              key={index}
              className="bg-card/75 backdrop-blur-md border border-border/80 hover:border-primary/50 transition-all duration-300 hover:shadow-xl hover:shadow-primary/5 group hover:-translate-y-1 relative overflow-hidden flex flex-col justify-between"
            >
              <CardContent className="pt-8 pb-8 flex flex-col justify-between h-full space-y-6">
                {/* Card Top Details */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between font-mono">
                    <span className="text-3xs text-muted-foreground uppercase tracking-widest">{feature.tag}</span>
                    <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                  </div>

                  <div className="rounded-xl bg-primary/10 p-3.5 w-fit group-hover:bg-primary/20 transition-all duration-300 group-hover:scale-105">
                    <Icon className="h-6 w-6 text-primary group-hover:rotate-6 transition-transform duration-300" />
                  </div>

                  <div className="space-y-2">
                    <h3 className="font-mono font-bold text-lg md:text-xl text-foreground">{feature.title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">{feature.description}</p>
                  </div>
                </div>

                {/* Simulated Code Snippet */}
                <div className="font-mono text-3xs p-3 rounded-md bg-muted/60 border border-border/50 text-muted-foreground select-none">
                  <div className="flex items-center gap-1 text-accent font-semibold mb-1">
                    <Terminal className="h-3 w-3" /> sandbox.js
                  </div>
                  <div className="overflow-x-auto whitespace-nowrap text-foreground/80">
                    {feature.snippet}
                  </div>
                </div>
              </CardContent>

              {/* Top border glowing highlight line */}
              <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-primary/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </Card>
          )
        })}
      </div>
    </section>
  )
}