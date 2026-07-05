"use client"

import Link from "next/link"
import { BookOpen, Github, Globe, Heart, Star, GitFork, AlertCircle } from "lucide-react"
import { useState, useEffect } from "react"

/**
 * Render the site's responsive, cyber-terminal themed footer with branding, real navigation links,
 * codebase resources, live repository statistics, and developer credits.
 *
 * @returns The redesigned footer JSX element containing system nodes, legal scopes, and developer credits.
 */
export function Footer() {
  const [repoStats, setRepoStats] = useState<{ stars: number; forks: number; issues: number } | null>(null)

  useEffect(() => {
    async function fetchStats() {
      try {
        const res = await fetch("https://api.github.com/repos/MeAshikeqbal/yearbook")
        if (res.ok) {
          const data = await res.json()
          setRepoStats({
            stars: data.stargazers_count ?? 0,
            forks: data.forks_count ?? 0,
            issues: data.open_issues_count ?? 0,
          })
        }
      } catch (err) {
        console.warn("Could not retrieve GitHub repository telemetry:", err)
      }
    }
    fetchStats()
  }, [])

  return (
    <footer className="border-t bg-muted/20 border-border/80 backdrop-blur-md relative overflow-hidden">
      {/* Background neon blur grid effect */}
      <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-primary/5 rounded-full blur-3xl pointer-events-none" />
      
      <div className="container mx-auto max-w-7xl px-4 md:px-6 py-12 relative z-10">
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-8 mb-12">
          {/* Logo & Brand Column */}
          <div className="sm:col-span-12 md:col-span-5 space-y-4">
            <Link 
              href="/" 
              className="flex items-center gap-2 font-black text-lg md:text-xl text-foreground font-mono tracking-tight hover:opacity-85 transition-opacity"
            >
              <BookOpen className="h-5 w-5 md:h-6 md:w-6 text-primary animate-pulse" />
              <span>class_of_2026</span>
            </Link>
            <p className="text-xs text-muted-foreground font-mono leading-relaxed max-w-sm">
              An interactive graduation registry, student styling console, and digital mosaic archive built for the CSE graduating batch of 2026.
            </p>

            {/* Live Repository Telemetry */}
            <div className="flex flex-wrap items-center gap-2.5 text-[10px] font-mono text-neutral-500 py-1 select-none">
              <span className="flex items-center gap-1 border border-border/60 bg-card/30 px-2 py-0.5 rounded-md hover:border-amber-500/20 transition-colors">
                <Star className="h-3 w-3 text-amber-500" />
                <span>stars: {repoStats !== null ? repoStats.stars : "..."}</span>
              </span>
              <span className="flex items-center gap-1 border border-border/60 bg-card/30 px-2 py-0.5 rounded-md hover:border-sky-500/20 transition-colors">
                <GitFork className="h-3 w-3 text-sky-500" />
                <span>forks: {repoStats !== null ? repoStats.forks : "..."}</span>
              </span>
              <span className="flex items-center gap-1 border border-border/60 bg-card/30 px-2 py-0.5 rounded-md hover:border-red-500/20 transition-colors">
                <AlertCircle className="h-3 w-3 text-red-500" />
                <span>issues: {repoStats !== null ? repoStats.issues : "..."}</span>
              </span>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <a 
                href="https://github.com/MeAshikeqbal/yearbook" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="p-2 rounded-lg border border-border bg-card/50 hover:bg-muted text-muted-foreground hover:text-foreground hover:border-primary/30 transition-all duration-200" 
                title="GitHub Codebase"
              >
                <Github className="h-4 w-4" />
              </a>
              <a 
                href="https://itsashik.dev" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="p-2 rounded-lg border border-border bg-card/50 hover:bg-muted text-muted-foreground hover:text-foreground hover:border-primary/30 transition-all duration-200" 
                title="Ashik Iqbal - Website"
              >
                <Globe className="h-4 w-4" />
              </a>
            </div>
          </div>

          {/* System Nodes Column */}
          <div className="md:col-span-2 sm:col-span-4 space-y-4">
            <h3 className="font-mono text-xs font-bold uppercase tracking-wider text-primary">[SYSTEM_NODES]</h3>
            <ul className="space-y-2.5 text-xs font-mono">
              <li>
                <Link href="/browse" className="text-muted-foreground hover:text-foreground hover:underline transition-colors">
                  ./browse_directory
                </Link>
              </li>
              <li>
                <Link href="/memories" className="text-muted-foreground hover:text-foreground hover:underline transition-colors">
                  ./mosaic_registry
                </Link>
              </li>
              <li>
                <Link href="/flipbook" className="text-muted-foreground hover:text-foreground hover:underline transition-colors">
                  ./page_flipbook
                </Link>
              </li>
            </ul>
          </div>

          {/* System Shells Column */}
          <div className="md:col-span-2 sm:col-span-4 space-y-4">
            <h3 className="font-mono text-xs font-bold uppercase tracking-wider text-primary">[SYSTEM_SHELLS]</h3>
            <ul className="space-y-2.5 text-xs font-mono">
              <li>
                <Link href="/bugs" className="text-muted-foreground hover:text-foreground hover:underline transition-colors">
                  ./bug_tracker
                </Link>
              </li>
              <li>
                <Link href="/docs" className="text-muted-foreground hover:text-foreground hover:underline transition-colors">
                  ./specifications
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal Scopes Column */}
          <div className="md:col-span-3 sm:col-span-4 space-y-4">
            <h3 className="font-mono text-xs font-bold uppercase tracking-wider text-primary">[LEGAL_SCOPES]</h3>
            <ul className="space-y-2.5 text-xs font-mono">
              <li>
                <Link href="/privacy" className="text-muted-foreground hover:text-foreground hover:underline transition-colors">
                  ./privacy_policy
                </Link>
              </li>
              <li>
                <Link href="/terms" className="text-muted-foreground hover:text-foreground hover:underline transition-colors">
                  ./terms_of_service
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Credits Bar */}
        <div className="pt-8 border-t border-border/60 flex flex-col md:flex-row justify-between items-center gap-4 text-xs font-mono text-muted-foreground">
          <p className="text-center md:text-left max-w-md leading-relaxed">
            [DISCLAIMER]: This is an unofficial, student-run graduation record. Not affiliated with university administration.
          </p>
          
          <div className="flex flex-col items-center md:items-end gap-1.5 shrink-0">
            <p className="flex items-center gap-1.5">
              Compiled with <Heart className="h-3.5 w-3.5 text-red-500 fill-red-500 animate-pulse" /> by{" "}
              <a 
                href="https://itsashik.dev" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="text-foreground hover:text-primary hover:underline font-extrabold transition-colors"
              >
                Ashik Iqbal
              </a>
            </p>
            <p className="text-3xs text-muted-foreground/60 select-none">
              © {new Date().getFullYear()} Class of 2026 Yearbook. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </footer>
  )
}