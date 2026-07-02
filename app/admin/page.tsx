"use client"

import React, { useEffect, useState } from "react"
import { useSession, getCsrfToken } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ShieldAlert, CheckCircle, XCircle, Trash2, Users, Loader2, History, X } from "lucide-react"

interface StudentProfile {
  username: string
  name: string
  role: string
  bio: string
  avatarUrl: string
}

interface UserData {
  id: string
  email: string
  role: string
  status: string
  idCardUrl?: string | null
  createdAt: string
  studentProfile?: StudentProfile
}

interface ModerationLog {
  id: string
  adminId: string
  adminName: string
  targetId: string
  targetName: string
  action: string
  reason: string | null
  createdAt: string
}

export default function AdminPage() {
  const { data: session, status: sessionStatus } = useSession()
  const router = useRouter()
  const [users, setUsers] = useState<UserData[]>([])
  const [logs, setLogs] = useState<ModerationLog[]>([])
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [error, setError] = useState("")
  const [selectedIdPhoto, setSelectedIdPhoto] = useState<string | null>(null)

  // Reason Modal states
  const [reasonModalOpen, setReasonModalOpen] = useState(false)
  const [pendingAction, setPendingAction] = useState<{ userId: string; action: "APPROVE" | "REJECT" | "DELETE" } | null>(null)
  const [moderationReason, setModerationReason] = useState("")

  useEffect(() => {
    if (sessionStatus === "unauthenticated") {
      router.push("/login")
    } else if (
      sessionStatus === "authenticated" &&
      session.user.role !== "ADMIN" &&
      session.user.role !== "MODERATOR"
    ) {
      router.push("/")
    } else if (
      sessionStatus === "authenticated" &&
      (session.user.role === "ADMIN" || session.user.role === "MODERATOR")
    ) {
      fetchData()
    }
  }, [sessionStatus, session, router])

  const fetchData = async () => {
    try {
      setLoading(true)
      await Promise.all([fetchUsers(), fetchLogs()])
    } catch (err) {
      setError("Failed to load control center data")
    } finally {
      setLoading(false)
    }
  }

  const fetchUsers = async () => {
    const res = await fetch("/api/admin/users")
    if (!res.ok) {
      throw new Error("Failed to fetch users")
    }
    const data = await res.json()
    setUsers(data.users || [])
  }

  const fetchLogs = async () => {
    try {
      const res = await fetch("/api/admin/moderation-logs")
      if (res.ok) {
        const data = await res.json()
        setLogs(data.logs || [])
      }
    } catch (err) {
      console.error("Failed to fetch logs", err)
    }
  }

  const triggerActionPrompt = (userId: string, action: "APPROVE" | "REJECT" | "DELETE") => {
    setPendingAction({ userId, action })
    
    // Set default preset reasons
    if (action === "APPROVE") {
      setModerationReason("Valid Student ID card verified")
    } else if (action === "REJECT") {
      setModerationReason("Student ID blurry or verification failed")
    } else {
      setModerationReason("Spam or inactive profile deletion")
    }
    
    setReasonModalOpen(true)
  }

  const handleAction = async () => {
    if (!pendingAction) return
    const { userId, action } = pendingAction
    
    setReasonModalOpen(false)
    setActionLoading(userId + "-" + action)
    setError("")

    try {
      const csrfToken = await getCsrfToken()
      const res = await fetch("/api/admin/verify-user", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "x-csrf-token": csrfToken || "",
        },
        body: JSON.stringify({ 
          userId, 
          action, 
          reason: moderationReason 
        }),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || "Action failed")
      }

      // Refresh both list and moderation logs
      await Promise.all([fetchUsers(), fetchLogs()])
    } catch (err: any) {
      setError(err.message || "Action failed")
    } finally {
      setActionLoading(null)
      setPendingAction(null)
      setModerationReason("")
    }
  }

  if (sessionStatus === "loading" || loading) {
    return (
      <div className="flex h-svh items-center justify-center bg-background">
        <div className="text-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
          <p className="text-muted-foreground text-sm font-mono">Verifying authorization clearances...</p>
        </div>
      </div>
    )
  }

  const pendingUsers = users.filter((u) => u.status === "PENDING" && u.role !== "ADMIN")
  const approvedUsers = users.filter((u) => u.status === "APPROVED" && u.role !== "ADMIN")
  const rejectedUsers = users.filter((u) => u.status === "REJECTED" && u.role !== "ADMIN")

  return (
    <div className="container mx-auto max-w-6xl px-4 py-8 md:py-12 space-y-8 min-h-svh bg-background">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-border pb-6 gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <ShieldAlert className="h-8 w-8 text-primary" /> Control Center
          </h1>
          <p className="text-muted-foreground text-sm font-mono mt-1">
            Manual Identity Verification & Yearbook Moderation [{session?.user.role}]
          </p>
        </div>
        <div className="flex gap-4 items-center bg-card border border-border px-4 py-2 rounded-lg text-sm font-mono">
          <Users className="h-4 w-4 text-primary" />
          Total Users: {users.length - 1} {/* Exclude current admin/mod if loaded */}
        </div>
      </div>

      {error && (
        <div className="bg-destructive/10 border border-destructive/20 text-destructive rounded-md p-4 text-sm font-mono animate-in slide-in-from-top-1">
          [ERROR]: {error}
        </div>
      )}

      {/* PENDING REQUESTS */}
      <Card className="border-amber-500/20 bg-amber-500/5">
        <CardHeader>
          <CardTitle className="text-xl font-bold text-amber-500 flex items-center gap-2">
            ⏳ Pending Verification ({pendingUsers.length})
          </CardTitle>
          <CardDescription className="text-muted-foreground text-xs font-mono">
            Requires inspection of Student ID Card before profile activation
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {pendingUsers.length === 0 ? (
            <p className="text-sm text-muted-foreground font-mono py-4 text-center border border-dashed border-amber-500/10 rounded-lg bg-card">
              No pending registrations at this time.
            </p>
          ) : (
            <div className="divide-y divide-border border border-border rounded-lg overflow-hidden bg-card">
              {pendingUsers.map((u) => (
                <div key={u.id} className="p-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                  <div className="flex items-start md:items-center gap-4 flex-1">
                    {u.idCardUrl ? (
                      <div 
                        className="relative h-14 w-24 rounded-md border border-border bg-muted overflow-hidden cursor-pointer group hover:opacity-85 transition-opacity flex-shrink-0 shadow-xs"
                        onClick={() => setSelectedIdPhoto(u.idCardUrl || null)}
                        title="Click to inspect Student ID photo"
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img 
                          src={u.idCardUrl} 
                          alt="Student ID photo" 
                          className="h-full w-full object-cover"
                        />
                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                          <span className="text-[10px] text-white font-mono font-bold">Inspect ID</span>
                        </div>
                      </div>
                    ) : (
                      <div className="h-14 w-24 rounded-md border border-dashed border-border flex items-center justify-center text-[10px] text-muted-foreground font-mono bg-muted flex-shrink-0">
                        No ID Card
                      </div>
                    )}
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-foreground">{u.studentProfile?.name || "Unknown"}</span>
                        <span className="text-xs font-mono bg-muted text-muted-foreground px-2 py-0.5 rounded-full">
                          @{u.studentProfile?.username}
                        </span>
                        {u.role !== "STUDENT" && (
                          <span className="text-[10px] font-mono bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                            {u.role}
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-muted-foreground font-mono flex flex-wrap gap-x-4 gap-y-1">
                        <span>Email: {u.email}</span>
                        <span>Interest: {u.studentProfile?.role}</span>
                        <span>Registered: {new Date(u.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2 w-full md:w-auto">
                    <Button
                      size="sm"
                      className="bg-emerald-600 hover:bg-emerald-700 text-white flex-1 md:flex-initial"
                      onClick={() => triggerActionPrompt(u.id, "APPROVE")}
                      disabled={actionLoading !== null}
                    >
                      {actionLoading === `${u.id}-APPROVE` ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <>
                          <CheckCircle className="h-4 w-4 mr-1" /> Approve
                        </>
                      )}
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="border-destructive/30 text-destructive hover:bg-destructive/10 flex-1 md:flex-initial bg-background"
                      onClick={() => triggerActionPrompt(u.id, "REJECT")}
                      disabled={actionLoading !== null}
                    >
                      {actionLoading === `${u.id}-REJECT` ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <>
                          <XCircle className="h-4 w-4 mr-1" /> Reject
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* APPROVED STUDENTS */}
      <Card className="border-border bg-card">
        <CardHeader>
          <CardTitle className="text-xl font-bold text-foreground flex items-center gap-2">
            ✓ Approved Accounts ({approvedUsers.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {approvedUsers.length === 0 ? (
            <p className="text-sm text-muted-foreground font-mono py-4 text-center border border-dashed border-border rounded-lg">
              No approved users found.
            </p>
          ) : (
            <div className="divide-y divide-border border border-border rounded-lg overflow-hidden bg-card">
              {approvedUsers.map((u) => (
                <div key={u.id} className="p-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-foreground">{u.studentProfile?.name || "Unknown"}</span>
                      <span className="text-xs font-mono bg-muted text-muted-foreground px-2 py-0.5 rounded-full">
                        @{u.studentProfile?.username}
                      </span>
                      {u.role !== "STUDENT" && (
                        <span className="text-[10px] font-mono bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                          {u.role}
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-muted-foreground font-mono">
                      Email: {u.email} | Role: {u.studentProfile?.role}
                    </div>
                  </div>
                  <div className="flex gap-2 w-full md:w-auto">
                    {/* Hide moderator buttons if current user is moderator and target is also a staff role */}
                    {!(session?.user.role === "MODERATOR" && u.role !== "STUDENT") && (
                      <Button
                        size="sm"
                        variant="outline"
                        className="border-border text-muted-foreground hover:text-destructive flex-1 md:flex-initial bg-background animate-pulse"
                        onClick={() => triggerActionPrompt(u.id, "REJECT")}
                        disabled={actionLoading !== null}
                      >
                        Suspend
                      </Button>
                    )}
                    {session?.user.role === "ADMIN" && (
                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-muted-foreground hover:text-destructive p-2"
                        onClick={() => triggerActionPrompt(u.id, "DELETE")}
                        disabled={actionLoading !== null}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* REJECTED / SUSPENDED REQUESTS */}
      {rejectedUsers.length > 0 && (
        <Card className="border-destructive/20 bg-destructive/5">
          <CardHeader>
            <CardTitle className="text-xl font-bold text-destructive flex items-center gap-2">
              🚷 Suspended / Rejected ({rejectedUsers.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="divide-y divide-border border border-border rounded-lg overflow-hidden bg-card">
              {rejectedUsers.map((u) => (
                <div key={u.id} className="p-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                  <div className="space-y-1">
                    <span className="font-semibold text-foreground">{u.studentProfile?.name || "Unknown"}</span>
                    <div className="text-xs text-muted-foreground font-mono">
                      Email: {u.email} | Username: @{u.studentProfile?.username}
                    </div>
                  </div>
                  <div className="flex gap-2 w-full md:w-auto">
                    {!(session?.user.role === "MODERATOR" && u.role !== "STUDENT") && (
                      <Button
                        size="sm"
                        className="bg-emerald-600 hover:bg-emerald-700 text-white flex-1 md:flex-initial"
                        onClick={() => triggerActionPrompt(u.id, "APPROVE")}
                        disabled={actionLoading !== null}
                      >
                        Restore & Approve
                      </Button>
                    )}
                    {session?.user.role === "ADMIN" && (
                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-muted-foreground hover:text-destructive p-2"
                        onClick={() => triggerActionPrompt(u.id, "DELETE")}
                        disabled={actionLoading !== null}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* MODERATION AUDIT LOGS */}
      <Card className="border-border bg-card">
        <CardHeader>
          <CardTitle className="text-xl font-bold text-foreground flex items-center gap-2">
            <History className="h-5 w-5 text-primary" /> 🛡 Moderation Audit Logs
          </CardTitle>
          <CardDescription className="text-muted-foreground text-xs font-mono">
            Immutable tracking of verification actions and suspensions
          </CardDescription>
        </CardHeader>
        <CardContent>
          {logs.length === 0 ? (
            <p className="text-sm text-muted-foreground font-mono py-4 text-center border border-dashed border-border rounded-lg bg-card">
              No audit logs recorded yet.
            </p>
          ) : (
            <div className="border border-border rounded-lg overflow-x-auto bg-neutral-900/10">
              <table className="w-full text-left border-collapse text-sm font-mono">
                <thead>
                  <tr className="border-b border-border bg-muted/50 text-muted-foreground text-xs">
                    <th className="p-3">Timestamp</th>
                    <th className="p-3">Moderator</th>
                    <th className="p-3">Target Account</th>
                    <th className="p-3">Action</th>
                    <th className="p-3">Reason / Details</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {logs.map((log) => (
                    <tr key={log.id} className="hover:bg-muted/30 transition-colors">
                      <td className="p-3 whitespace-nowrap text-xs text-muted-foreground">
                        {new Date(log.createdAt).toLocaleString()}
                      </td>
                      <td className="p-3 font-semibold text-foreground text-xs">
                        {log.adminName}
                      </td>
                      <td className="p-3 text-xs text-foreground">
                        {log.targetName}
                      </td>
                      <td className="p-3">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          log.action === "APPROVE" ? "bg-emerald-950 text-emerald-400 border border-emerald-500/25" :
                          log.action === "REJECT" ? "bg-amber-950 text-amber-400 border border-amber-500/25" :
                          "bg-red-950 text-red-400 border border-red-500/25"
                        }`}>
                          {log.action}
                        </span>
                      </td>
                      <td className="p-3 text-xs text-muted-foreground max-w-xs truncate" title={log.reason || ""}>
                        {log.reason || "-"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* ID CARD LIGHTBOX */}
      {selectedIdPhoto && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-200"
          onClick={() => setSelectedIdPhoto(null)}
        >
          <div 
            className="relative max-w-3xl max-h-[85vh] overflow-hidden rounded-lg border border-border bg-card p-2 shadow-2xl animate-in zoom-in-95"
            onClick={(e) => e.stopPropagation()}
          >
            <button 
              onClick={() => setSelectedIdPhoto(null)}
              className="absolute right-4 top-4 z-10 bg-black/70 hover:bg-black/90 text-white hover:text-red-400 p-2 rounded-full transition-colors shadow-md"
              aria-label="Close image viewer"
            >
              <XCircle className="h-5 w-5" />
            </button>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img 
              src={selectedIdPhoto} 
              alt="Student ID full verification image" 
              className="max-w-full max-h-[80vh] object-contain rounded"
            />
          </div>
        </div>
      )}

      {/* REASON PROMPT MODAL */}
      {reasonModalOpen && pendingAction && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="relative w-full max-w-md rounded-lg border border-border bg-card p-6 shadow-xl space-y-4 animate-in zoom-in-95">
            <button
              onClick={() => {
                setReasonModalOpen(false)
                setPendingAction(null)
              }}
              className="absolute right-4 top-4 text-muted-foreground hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </button>
            
            <div className="border-b border-border pb-3">
              <h3 className="text-lg font-semibold font-mono flex items-center gap-1.5 text-primary">
                🛡 Audit Log Details
              </h3>
              <p className="text-xs text-muted-foreground font-mono mt-1">
                Provide a reason for the action: <strong className="text-foreground">{pendingAction.action}</strong>
              </p>
            </div>

            <div className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-mono text-muted-foreground">Action Reason</label>
                <textarea
                  value={moderationReason}
                  onChange={(e) => setModerationReason(e.target.value)}
                  placeholder="e.g. Valid student ID card / Blurry student card..."
                  className="flex min-h-20 w-full rounded-md border border-input bg-background/50 px-3 py-2 text-xs font-mono placeholder:text-muted-foreground/50 focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-ring focus-visible:border-primary disabled:cursor-not-allowed disabled:opacity-50"
                  required
                />
              </div>
              
              <div className="flex gap-3 justify-end pt-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="font-mono text-xs"
                  onClick={() => {
                    setReasonModalOpen(false)
                    setPendingAction(null)
                  }}
                >
                  Cancel
                </Button>
                <Button
                  size="sm"
                  className="bg-primary text-primary-foreground hover:bg-primary/95 font-mono text-xs"
                  onClick={handleAction}
                >
                  Confirm Action
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
