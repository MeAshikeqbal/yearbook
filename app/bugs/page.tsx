"use client"

import React, { useEffect, useState } from "react"
import { useSession, getCsrfToken } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Bug, Plus, X, Loader2, User, HelpCircle, MessageSquare, RefreshCw, Github } from "lucide-react"
import { useFeatures } from "@/components/features-provider"
import FeatureDisabled from "@/components/ui/feature-disabled"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"

interface BugItem {
  id: string
  title: string
  description: string
  status: string // "OPEN", "IN_PROGRESS", "RESOLVED"
  reporter: string
  createdAt: string
  githubNumber?: number
  githubUrl?: string
}

export default function BugsPage() {
  const { data: session } = useSession()
  const { hasFeature } = useFeatures()
  const [bugs, setBugs] = useState<BugItem[]>([])
  const [loading, setLoading] = useState(true)
  const [syncing, setSyncing] = useState(false)

  // Report modal state
  const [modalOpen, setModalOpen] = useState(false)
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [status, setStatus] = useState("OPEN")
  const [reporter, setReporter] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState("")

  const handleSync = async () => {
    try {
      setSyncing(true)
      const csrfToken = await getCsrfToken();
      const res = await fetch("/api/bugs/sync", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-csrf-token": csrfToken || "",
        },
      })
      if (!res.ok) {
        throw new Error("Sync failed")
      }
      await fetchBugs()
    } catch (err) {
      console.error(err)
    } finally {
      setSyncing(false)
    }
  }

  useEffect(() => {
    fetchBugs()
    if (session?.user) {
      setReporter(session.user.name || session.user.username)
    }
  }, [session])

  const fetchBugs = async () => {
    try {
      setLoading(true)
      const res = await fetch("/api/bugs")
      if (!res.ok) throw new Error("Failed to fetch bugs")
      const data = await res.json()
      setBugs(data.bugs || [])
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleReportSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title || !description || !reporter) {
      setError("Please fill in all required fields.")
      return
    }

    setSubmitting(true)
    setError("")

    try {
      const csrfToken = await getCsrfToken();
      const res = await fetch("/api/bugs", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "x-csrf-token": csrfToken || "",
        },
        body: JSON.stringify({
          title: `[BUG-${Math.floor(Math.random() * 900) + 100}] ${title.trim().toLowerCase().replace(/\s+/g, "-")}`,
          description,
          status,
          reporter,
        }),
      })

      if (!res.ok) {
        throw new Error("Failed to file issue report")
      }

      // Reset
      setTitle("")
      setDescription("")
      setStatus("OPEN")
      setModalOpen(false)
      fetchBugs()
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred.")
    } finally {
      setSubmitting(false)
    }
  }

  const openBugs = bugs.filter((b) => b.status === "OPEN")
  const inProgressBugs = bugs.filter((b) => b.status === "IN_PROGRESS")
  const resolvedBugs = bugs.filter((b) => b.status === "RESOLVED")

  if (!hasFeature("BUGS")) {
    return (
      <>
        <Header />
        <FeatureDisabled feature="Bug Tracker" />
        <Footer />
      </>
    )
  }

  return (
    <>
      <Header />
      <div className="min-h-svh bg-background text-foreground py-8 md:py-16">
      <div className="container mx-auto max-w-7xl px-4 md:px-6 space-y-8">
        
        {/* Header Block */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-border pb-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight font-mono">./bug_tracker</h1>
            <p className="text-muted-foreground text-sm font-mono mt-1">
              Class memory issues, lab slips, and semester bugs board
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              onClick={handleSync}
              disabled={syncing}
              variant="outline"
              size="sm"
              className="gap-1 font-mono text-xs border-border text-foreground hover:bg-muted"
            >
              {syncing ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <RefreshCw className="h-4 w-4" />
              )}
              sync_github
            </Button>
            <Button onClick={() => setModalOpen(true)} size="sm" className="gap-1 font-mono text-xs">
              <Plus className="h-4 w-4" /> report_bug
            </Button>
          </div>
        </div>

        {loading ? (
          <div className="flex h-60 items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        ) : (
          /* Kanban Board columns */
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* COLUMN 1: OPEN BUGS */}
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-border pb-2 px-1">
                <span className="text-xs font-mono font-bold text-red-500">🔴 OPEN / BACKLOG ({openBugs.length})</span>
              </div>
              <div className="space-y-4">
                {openBugs.length === 0 ? (
                  <p className="text-3xs font-mono text-muted-foreground text-center py-8 border border-dashed border-border rounded-lg">
                    No active bugs found.
                  </p>
                ) : (
                  openBugs.map((bug) => <BugCard key={bug.id} bug={bug} borderColor="border-l-red-500" />)
                )}
              </div>
            </div>

            {/* COLUMN 2: IN PROGRESS */}
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-border pb-2 px-1">
                <span className="text-xs font-mono font-bold text-amber-500">🟡 IN REVIEW / PROGRESS ({inProgressBugs.length})</span>
              </div>
              <div className="space-y-4">
                {inProgressBugs.length === 0 ? (
                  <p className="text-3xs font-mono text-muted-foreground text-center py-8 border border-dashed border-border rounded-lg">
                    No active processes.
                  </p>
                ) : (
                  inProgressBugs.map((bug) => <BugCard key={bug.id} bug={bug} borderColor="border-l-amber-500" />)
                )}
              </div>
            </div>

            {/* COLUMN 3: RESOLVED */}
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-border pb-2 px-1">
                <span className="text-xs font-mono font-bold text-emerald-500">🟢 MERGED / RESOLVED ({resolvedBugs.length})</span>
              </div>
              <div className="space-y-4">
                {resolvedBugs.length === 0 ? (
                  <p className="text-3xs font-mono text-muted-foreground text-center py-8 border border-dashed border-border rounded-lg">
                    No resolved bugs.
                  </p>
                ) : (
                  resolvedBugs.map((bug) => <BugCard key={bug.id} bug={bug} borderColor="border-l-emerald-500" />)
                )}
              </div>
            </div>

          </div>
        )}
      </div>

      {/* REPORT MODAL */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="relative w-full max-w-md rounded-lg border border-border bg-card p-6 shadow-lg space-y-4">
            <button
              onClick={() => setModalOpen(false)}
              className="absolute right-4 top-4 text-muted-foreground hover:text-foreground"
            >
              <X className="h-5 w-5" />
            </button>
            <div className="border-b border-border pb-3">
              <h3 className="text-lg font-semibold font-mono flex items-center gap-1.5"><Bug className="h-5 w-5 text-destructive" /> Report Batch Bug</h3>
              <p className="text-xs text-muted-foreground font-mono mt-1">Log a funny memory, exam cry or lab incident</p>
              {session?.accessToken ? (
                <p className="text-4xs text-emerald-500 font-mono mt-1 flex items-center gap-1">
                  <Github className="h-3 w-3 animate-pulse" /> Syncing report directly to GitHub issues (@{session.user?.username})
                </p>
              ) : (
                <p className="text-4xs text-amber-500 font-mono mt-1 flex items-center gap-1">
                  <HelpCircle className="h-3 w-3" /> Report will be saved locally. Login via GitHub to sync issues.
                </p>
              )}
            </div>

            {error && (
              <div className="bg-destructive/10 border border-destructive/20 text-destructive rounded-md p-3 text-xs font-mono">
                {error}
              </div>
            )}

            <form onSubmit={handleReportSubmit} className="space-y-4">
              
              <div className="space-y-1">
                <label htmlFor="bug-title" className="text-xs font-mono text-muted-foreground">Issue Title / Code</label>
                <input
                  id="bug-title"
                  type="text"
                  required
                  placeholder="e.g. print-hello-world-failed, crying-before-viva"
                  className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-2 text-xs focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-ring font-mono"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </div>

              <div className="space-y-1">
                <label htmlFor="bug-desc" className="text-xs font-mono text-muted-foreground">Issue Description</label>
                <textarea
                  id="bug-desc"
                  required
                  rows={4}
                  placeholder="Explain the incident in detail..."
                  className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-xs focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-ring"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label htmlFor="bug-status" className="text-xs font-mono text-muted-foreground">Workflow State</label>
                  <select
                    id="bug-status"
                    className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-2 text-xs focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-ring font-mono"
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                  >
                    <option value="OPEN">🔴 OPEN</option>
                    <option value="IN_PROGRESS">🟡 IN PROGRESS</option>
                    <option value="RESOLVED">🟢 RESOLVED</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label htmlFor="bug-reporter" className="text-xs font-mono text-muted-foreground">Reporter / Logger</label>
                  <input
                    id="bug-reporter"
                    type="text"
                    required
                    placeholder="Your Name"
                    className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-2 text-xs focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-ring font-mono"
                    value={reporter}
                    onChange={(e) => setReporter(e.target.value)}
                  />
                </div>
              </div>

              <div className="flex gap-3 justify-end pt-3 border-t border-border">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setModalOpen(false)}
                  disabled={submitting}
                  className="bg-background border-border"
                >
                  Cancel
                </Button>
                <Button type="submit" size="sm" disabled={submitting}>
                  {submitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Filing Report...
                    </>
                  ) : (
                    "File Bug"
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
      </div>
      <Footer />
    </>
  )
}

function BugCard({ bug, borderColor }: { bug: BugItem; borderColor: string }) {
  return (
    <Card className={`border-border bg-card border-l-4 ${borderColor} shadow-2xs hover:shadow-md transition-shadow`}>
      <CardHeader className="p-4 pb-2 space-y-1">
        <div className="flex justify-between items-start gap-2">
          <CardTitle className="text-sm font-bold font-mono tracking-tight text-foreground truncate max-w-[85%]">
            {bug.title}
          </CardTitle>
          <Bug className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
        </div>
        <CardDescription className="text-3xs font-mono text-muted-foreground">
          Filed on {new Date(bug.createdAt).toLocaleDateString()}
        </CardDescription>
      </CardHeader>
      <CardContent className="p-4 pt-0 space-y-3">
        <p className="text-xs text-muted-foreground leading-relaxed whitespace-pre-wrap">
          {bug.description}
        </p>
        <div className="flex items-center justify-between gap-1.5 text-3xs font-mono text-foreground/80 border-t border-border/40 pt-2">
          <div className="flex items-center gap-1.5">
            <User className="h-3.5 w-3.5 text-primary" />
            <span>Reporter: <strong className="text-foreground">{bug.reporter}</strong></span>
          </div>
          {bug.githubUrl && (
            <a
              href={bug.githubUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-sky-500 hover:text-sky-400 font-bold transition-colors"
            >
              <Github className="h-3 w-3" />
              <span>#{bug.githubNumber}</span>
            </a>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
