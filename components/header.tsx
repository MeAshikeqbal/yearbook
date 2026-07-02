"use client"

import Link from "next/link"
import { useSession, signOut } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { BookOpen, Menu, X, ShieldAlert, Edit3, LogOut, Image, Bug, Book } from "lucide-react"
import { ThemeToggle } from "@/components/theme-toggle"
import { useState } from "react"

export function Header() {
  const { data: session } = useSession()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur-md border-border">
      <div className="container mx-auto max-w-7xl flex h-16 items-center justify-between px-4 md:px-6">
        <Link href="/" className="flex items-center gap-2 font-bold text-lg md:text-xl text-foreground font-mono">
          <BookOpen className="h-5 w-5 md:h-6 md:w-6 text-primary" />
          <span className="hidden sm:inline">class_of_2026</span>
          <span className="sm:hidden">c_o_2026</span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-6">
          <Link
            href="/browse"
            className="text-sm font-mono text-muted-foreground hover:text-foreground transition-colors"
          >
            ./browse
          </Link>
          <Link
            href="/memories"
            className="text-sm font-mono text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1"
          >
            <Image className="h-3.5 w-3.5" /> ./mosaic
          </Link>
          <Link
            href="/flipbook"
            className="text-sm font-mono text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1"
          >
            <Book className="h-3.5 w-3.5" /> ./flipbook
          </Link>
          <Link
            href="/bugs"
            className="text-sm font-mono text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1"
          >
            <Bug className="h-3.5 w-3.5" /> ./bugs
          </Link>

          {session?.user.role === "ADMIN" && (
            <Link
              href="/admin"
              className="text-sm font-mono text-amber-500 hover:text-amber-400 transition-colors flex items-center gap-1"
            >
              <ShieldAlert className="h-3.5 w-3.5" /> ./admin
            </Link>
          )}

          <span className="h-4 w-[1px] bg-border" />

          <ThemeToggle />

          {session ? (
            <div className="flex items-center gap-3">
              {session.user.status === "APPROVED" && (
                <Button asChild size="sm" variant="outline" className="h-9 px-3 bg-background border-border">
                  <Link href={`/profile/${session.user.username}/edit`} className="flex items-center gap-1 font-mono text-xs">
                    <Edit3 className="h-3.5 w-3.5 text-primary" /> edit_profile
                  </Link>
                </Button>
              )}
              <Button
                size="sm"
                variant="ghost"
                className="h-9 w-9 p-0 text-muted-foreground hover:text-destructive transition-colors"
                onClick={() => signOut({ callbackUrl: "/" })}
                title="Sign Out"
              >
                <LogOut className="h-4 w-4" />
                <span className="sr-only">Sign Out</span>
              </Button>
            </div>
          ) : (
            <Button asChild size="sm" className="h-9 px-4">
              <Link href="/login" className="font-mono text-xs">./login</Link>
            </Button>
          )}
        </nav>

        {/* Mobile controls */}
        <div className="flex md:hidden items-center gap-2">
          <ThemeToggle />
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
            className="text-foreground"
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </div>

      {/* Mobile Navigation */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t bg-background/95 backdrop-blur-md border-border">
          <nav className="container mx-auto max-w-7xl px-4 py-4 flex flex-col gap-3">
            <Link
              href="/browse"
              className="text-sm font-mono text-muted-foreground hover:text-foreground transition-colors py-2"
              onClick={() => setMobileMenuOpen(false)}
            >
              ./browse
            </Link>
            <Link
              href="/memories"
              className="text-sm font-mono text-muted-foreground hover:text-foreground transition-colors py-2 flex items-center gap-2"
              onClick={() => setMobileMenuOpen(false)}
            >
              <Image className="h-4 w-4" /> ./mosaic
            </Link>
            <Link
              href="/flipbook"
              className="text-sm font-mono text-muted-foreground hover:text-foreground transition-colors py-2 flex items-center gap-2"
              onClick={() => setMobileMenuOpen(false)}
            >
              <Book className="h-4 w-4" /> ./flipbook
            </Link>
            <Link
              href="/bugs"
              className="text-sm font-mono text-muted-foreground hover:text-foreground transition-colors py-2 flex items-center gap-2"
              onClick={() => setMobileMenuOpen(false)}
            >
              <Bug className="h-4 w-4" /> ./bugs
            </Link>

            {session?.user.role === "ADMIN" && (
              <Link
                href="/admin"
                className="text-sm font-mono text-amber-500 hover:text-amber-400 transition-colors py-2 flex items-center gap-2"
                onClick={() => setMobileMenuOpen(false)}
              >
                <ShieldAlert className="h-4 w-4" /> ./admin
              </Link>
            )}

            <div className="border-t border-border my-2 pt-2">
              {session ? (
                <div className="flex flex-col gap-2">
                  {session.user.status === "APPROVED" && (
                    <Button asChild size="sm" variant="outline" className="w-full bg-background" onClick={() => setMobileMenuOpen(false)}>
                      <Link href={`/profile/${session.user.username}/edit`} className="flex items-center justify-center gap-2 font-mono">
                        <Edit3 className="h-4 w-4 text-primary" /> edit_profile
                      </Link>
                    </Button>
                  )}
                  <Button
                    size="sm"
                    variant="ghost"
                    className="w-full text-destructive hover:bg-destructive/10 flex items-center justify-center gap-2"
                    onClick={() => {
                      setMobileMenuOpen(false)
                      signOut({ callbackUrl: "/" })
                    }}
                  >
                    <LogOut className="h-4 w-4" /> Sign Out
                  </Button>
                </div>
              ) : (
                <Button asChild size="sm" className="w-full" onClick={() => setMobileMenuOpen(false)}>
                  <Link href="/login" className="font-mono text-center">./login</Link>
                </Button>
              )}
            </div>
          </nav>
        </div>
      )}
    </header>
  )
}