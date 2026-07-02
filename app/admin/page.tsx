"use client"

import React, { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ShieldAlert, CheckCircle, XCircle, Trash2, Users, Loader2 } from "lucide-react"

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

export default function AdminPage() {
  const { data: session, status: sessionStatus } = useSession()
  const router = useRouter()
  const [users, setUsers] = useState<UserData[]>([])
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [error, setError] = useState("")
  const [selectedIdPhoto, setSelectedIdPhoto] = useState<string | null>(null)

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
      fetchUsers()
    }
  }, [sessionStatus, session, router])

  const fetchUsers = async () => {
    try {
      setLoading(true)
      const res = await fetch("/api/admin/users")
      if (!res.ok) {
        throw new Error("Failed to fetch users")
      }
      const data = await res.json()
      setUsers(data.users || [])
    } catch (err) {
      setError("Failed to load users list")
    } finally {
      setLoading(false)
    }
  }

  const handleAction = async (userId: string, action: "APPROVE" | "REJECT" | "DELETE") => {
    setActionLoading(userId + "-" + action)
    setError("")

    try {
      const res = await fetch("/api/admin/verify-user", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, action }),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || "Action failed")
      }

      // Refresh list
      await fetchUsers()
    } catch (err: any) {
      setError(err.message || "Action failed")
    } finally {
      setActionLoading(null)
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
                      onClick={() => handleAction(u.id, "APPROVE")}
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
                      onClick={() => handleAction(u.id, "REJECT")}
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
                        className="border-border text-muted-foreground hover:text-destructive flex-1 md:flex-initial bg-background"
                        onClick={() => handleAction(u.id, "REJECT")}
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
                        onClick={() => handleAction(u.id, "DELETE")}
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
                    <div className="text-xs text-muted-foreground font-mono animate-pulse">
                      Email: {u.email} | Username: @{u.studentProfile?.username}
                    </div>
                  </div>
                  <div className="flex gap-2 w-full md:w-auto">
                    {!(session?.user.role === "MODERATOR" && u.role !== "STUDENT") && (
                      <Button
                        size="sm"
                        className="bg-emerald-600 hover:bg-emerald-700 text-white flex-1 md:flex-initial"
                        onClick={() => handleAction(u.id, "APPROVE")}
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
                        onClick={() => handleAction(u.id, "DELETE")}
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
    </div>
  )
}
