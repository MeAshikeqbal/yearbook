"use client"

import React, { useEffect, useState } from "react"
import { useSession, getCsrfToken } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  ShieldAlert, CheckCircle, XCircle, Trash2, Users, Loader2, History, X,
  LayoutDashboard, ToggleLeft, Image as ImageIcon, Bug, Edit3, Search, Plus, Settings, AlertCircle, RefreshCw
} from "lucide-react"

// Types matching database schemas
interface StudentProfile {
  username: string
  name: string
  role: string
  bio: string
  avatarUrl: string
  customCss?: string | null
  stats?: any
}

interface UserData {
  id: string
  email: string
  role: string
  status: string
  idCardUrl?: string | null
  createdAt: string
  studentProfile?: StudentProfile | null
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

interface FeatureFlag {
  id: string
  key: string
  description: string | null
  value: boolean
  updatedAt: string
}

interface Memory {
  id: string
  imageUrl: string
  description: string
  date: string
  uploadedBy: string
  uploaderName: string
  location?: string | null
  createdAt: string
}

interface BugItem {
  id: string
  title: string
  description: string
  status: string
  reporter: string
  createdAt: string
}

export default function AdminDashboard() {
  const { data: session, status: sessionStatus } = useSession()
  const router = useRouter()

  // Tab state
  const [activeTab, setActiveTab] = useState("overview")

  // Data states
  const [users, setUsers] = useState<UserData[]>([])
  const [logs, setLogs] = useState<ModerationLog[]>([])
  const [features, setFeatures] = useState<FeatureFlag[]>([])
  const [memories, setMemories] = useState<Memory[]>([])
  const [bugs, setBugs] = useState<BugItem[]>([])

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [successMsg, setSuccessMsg] = useState("")

  // Interactive UI action states
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [selectedIdPhoto, setSelectedIdPhoto] = useState<string | null>(null)

  // Modals / Dialog states
  const [reasonModalOpen, setReasonModalOpen] = useState(false)
  const [pendingAction, setPendingAction] = useState<{ userId: string; action: "APPROVE" | "REJECT" | "DELETE" } | null>(null)
  const [moderationReason, setModerationReason] = useState("")

  // Feature Flag form state
  const [newFlagKey, setNewFlagKey] = useState("")
  const [newFlagDesc, setNewFlagDesc] = useState("")
  const [newFlagVal, setNewFlagVal] = useState(true)

  // Edit User profile modal state
  const [editUserModalOpen, setEditUserModalOpen] = useState(false)
  const [editingUser, setEditingUser] = useState<UserData | null>(null)
  const [editName, setEditName] = useState("")
  const [editUsername, setEditUsername] = useState("")
  const [editBio, setEditBio] = useState("")
  const [editRole, setEditRole] = useState("")
  const [editCustomCss, setEditCustomCss] = useState("")
  const [editBugsFixed, setEditBugsFixed] = useState(0)
  const [editCoffeeConsumed, setEditCoffeeConsumed] = useState(0)
  const [editAccountRole, setEditAccountRole] = useState("STUDENT")
  const [editAccountStatus, setEditAccountStatus] = useState("PENDING")

  // Search filter
  const [userSearchQuery, setUserSearchQuery] = useState("")

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
      setError("")
      await Promise.all([
        fetchUsers(),
        fetchLogs(),
        fetchFeatures(),
        fetchMemories(),
        fetchBugs()
      ])
    } catch (err) {
      setError("Failed to fetch dashboard data modules.")
    } finally {
      setLoading(false)
    }
  }

  const fetchUsers = async () => {
    const res = await fetch("/api/admin/users")
    if (!res.ok) throw new Error("Failed to fetch user list")
    const data = await res.json()
    setUsers(data.users || [])
  }

  const fetchLogs = async () => {
    const res = await fetch("/api/admin/moderation-logs")
    if (!res.ok) throw new Error("Failed to fetch audit logs")
    const data = await res.json()
    setLogs(data.logs || [])
  }

  const fetchFeatures = async () => {
    const res = await fetch("/api/admin/features")
    if (!res.ok) throw new Error("Failed to fetch feature flags")
    const data = await res.json()
    setFeatures(data.flags || [])
  }

  const fetchMemories = async () => {
    const res = await fetch("/api/memories")
    if (!res.ok) throw new Error("Failed to fetch memories grid")
    const data = await res.json()
    setMemories(data.memories || [])
  }

  const fetchBugs = async () => {
    const res = await fetch("/api/bugs")
    if (!res.ok) throw new Error("Failed to fetch bug tracking board")
    const data = await res.json()
    setBugs(data.bugs || [])
  }

  // --- IDENTITY VERIFICATION HANDLERS ---
  const triggerActionPrompt = (userId: string, action: "APPROVE" | "REJECT" | "DELETE") => {
    setPendingAction({ userId, action })
    if (action === "APPROVE") {
      setModerationReason("Valid Student ID card verified")
    } else if (action === "REJECT") {
      setModerationReason("Student ID blurry or verification failed")
    } else {
      setModerationReason("Spam or inactive profile deletion")
    }
    setReasonModalOpen(true)
  }

  const handleIdentityAction = async () => {
    if (!pendingAction) return
    const { userId, action } = pendingAction
    setReasonModalOpen(false)
    setActionLoading(userId + "-" + action)
    setError("")
    setSuccessMsg("")

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
        throw new Error(data.error || "Verification operation failed")
      }

      setSuccessMsg(`Account action ${action} executed successfully.`)
      await Promise.all([fetchUsers(), fetchLogs()])
    } catch (err: any) {
      setError(err.message || "Action failed")
    } finally {
      setActionLoading(null)
      setPendingAction(null)
      setModerationReason("")
    }
  }

  // --- FEATURE FLAGS HANDLERS ---
  const handleToggleFeature = async (id: string, currentValue: boolean) => {
    setError("")
    setSuccessMsg("")
    try {
      const csrfToken = await getCsrfToken()
      const res = await fetch(`/api/admin/features/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "x-csrf-token": csrfToken || "",
        },
        body: JSON.stringify({ value: !currentValue }),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || "Failed to update feature flag")
      }

      setSuccessMsg("Feature flag status toggled successfully.")
      await fetchFeatures()
      await fetchLogs()
    } catch (err: any) {
      setError(err.message || "Failed to toggle feature flag")
    }
  }

  const handleCreateFeature = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setSuccessMsg("")
    if (!newFlagKey) {
      setError("Feature key code is required.")
      return
    }

    try {
      const csrfToken = await getCsrfToken()
      const res = await fetch("/api/admin/features", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-csrf-token": csrfToken || "",
        },
        body: JSON.stringify({
          key: newFlagKey,
          value: newFlagVal,
          description: newFlagDesc
        }),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || "Failed to compile feature flag")
      }

      setSuccessMsg(`Feature flag '${newFlagKey.toUpperCase()}' initialized.`)
      setNewFlagKey("")
      setNewFlagDesc("")
      setNewFlagVal(true)
      await fetchFeatures()
      await fetchLogs()
    } catch (err: any) {
      setError(err.message || "Failed to register feature flag")
    }
  }

  const handleDeleteFeature = async (id: string) => {
    if (!confirm("Are you sure you want to delete this feature flag? This might break pages checking it.")) return
    setError("")
    setSuccessMsg("")
    try {
      const csrfToken = await getCsrfToken()
      const res = await fetch(`/api/admin/features/${id}`, {
        method: "DELETE",
        headers: {
          "x-csrf-token": csrfToken || "",
        },
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || "Failed to delete feature flag")
      }

      setSuccessMsg("Feature flag removed permanently.")
      await fetchFeatures()
      await fetchLogs()
    } catch (err: any) {
      setError(err.message || "Failed to remove flag")
    }
  }

  // --- PROFILE EDIT HANDLERS ---
  const openEditUserModal = (user: UserData) => {
    setEditingUser(user)
    setEditName(user.studentProfile?.name || "")
    setEditUsername(user.studentProfile?.username || "")
    setEditBio(user.studentProfile?.bio || "")
    setEditRole(user.studentProfile?.role || "")
    setEditCustomCss(user.studentProfile?.customCss || "")
    setEditBugsFixed(user.studentProfile?.stats?.bugsFixed || 0)
    setEditCoffeeConsumed(user.studentProfile?.stats?.coffeeConsumed || 0)
    setEditAccountRole(user.role)
    setEditAccountStatus(user.status)
    setEditUserModalOpen(true)
  }

  const handleUpdateProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingUser) return
    setError("")
    setSuccessMsg("")
    setEditUserModalOpen(false)

    try {
      const csrfToken = await getCsrfToken()
      const res = await fetch(`/api/admin/users/${editingUser.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "x-csrf-token": csrfToken || "",
        },
        body: JSON.stringify({
          role: editAccountRole,
          status: editAccountStatus,
          name: editName,
          username: editUsername,
          bio: editBio,
          customCss: editCustomCss,
          stats: {
            bugsFixed: Number(editBugsFixed),
            coffeeConsumed: Number(editCoffeeConsumed)
          }
        }),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || "Failed to update profile settings")
      }

      setSuccessMsg(`Successfully overridden profile settings for ${editName}.`)
      await fetchUsers()
      await fetchLogs()
    } catch (err: any) {
      setError(err.message || "Update profile failed")
    }
  }

  // --- PHOTO MOSAIC MODERATION ---
  const handleDeleteMemory = async (id: string) => {
    if (!confirm("Are you sure you want to delete this memory snapshot? It will be removed from mosaic grid.")) return
    setError("")
    setSuccessMsg("")
    try {
      const csrfToken = await getCsrfToken()
      const res = await fetch(`/api/admin/memories/${id}`, {
        method: "DELETE",
        headers: {
          "x-csrf-token": csrfToken || "",
        },
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || "Failed to moderate memory upload")
      }

      setSuccessMsg("Memory snapshot purged from archive.")
      await fetchMemories()
      await fetchLogs()
    } catch (err: any) {
      setError(err.message || "Failed to delete memory")
    }
  }

  // --- BUG TRACKER MODERATION ---
  const handleUpdateBugStatus = async (id: string, newStatus: string) => {
    setError("")
    setSuccessMsg("")
    try {
      const csrfToken = await getCsrfToken()
      const res = await fetch(`/api/admin/bugs/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "x-csrf-token": csrfToken || "",
        },
        body: JSON.stringify({ status: newStatus }),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || "Failed to update issue status")
      }

      setSuccessMsg("Bug report state updated.")
      await fetchBugs()
      await fetchLogs()
    } catch (err: any) {
      setError(err.message || "Failed to modify bug status")
    }
  }

  const handleDeleteBug = async (id: string) => {
    if (!confirm("Dismiss and delete this bug report permanently?")) return
    setError("")
    setSuccessMsg("")
    try {
      const csrfToken = await getCsrfToken()
      const res = await fetch(`/api/admin/bugs/${id}`, {
        method: "DELETE",
        headers: {
          "x-csrf-token": csrfToken || "",
        },
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || "Failed to dismiss bug report")
      }

      setSuccessMsg("Bug report deleted from issues queue.")
      await fetchBugs()
      await fetchLogs()
    } catch (err: any) {
      setError(err.message || "Failed to delete bug")
    }
  }

  if (sessionStatus === "loading" || loading) {
    return (
      <div className="flex h-svh items-center justify-center bg-background">
        <div className="text-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
          <p className="text-muted-foreground text-sm font-mono">Loading Yearbook Control Node...</p>
        </div>
      </div>
    )
  }

  // Data metrics compilation
  const pendingUsers = users.filter((u) => u.status === "PENDING")
  const approvedUsers = users.filter((u) => u.status === "APPROVED")
  const rejectedUsers = users.filter((u) => u.status === "REJECTED")

  const filteredUsers = users.filter((u) =>
    u.email.toLowerCase().includes(userSearchQuery.toLowerCase()) ||
    (u.studentProfile?.name || "").toLowerCase().includes(userSearchQuery.toLowerCase()) ||
    (u.studentProfile?.username || "").toLowerCase().includes(userSearchQuery.toLowerCase())
  )

  const openBugs = bugs.filter((b) => b.status === "OPEN")
  const activeFlagsCount = features.filter((f) => f.value).length

  return (
    <div className="container mx-auto max-w-7xl px-4 py-8 md:py-12 space-y-8 min-h-svh bg-background text-foreground">
      {/* Title block */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-border pb-6 gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2 font-mono">
            <ShieldAlert className="h-8 w-8 text-primary" /> admin_control_node
          </h1>
          <p className="text-muted-foreground text-xs font-mono mt-1">
            Global Configuration, Access Control, Mosaic Moderation & Feature Flags [{session?.user.role}]
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm" onClick={fetchData} className="font-mono text-xs bg-background border-border">
            <RefreshCw className="h-3.5 w-3.5 mr-1" /> refresh_data
          </Button>
          <div className="flex gap-4 items-center bg-card border border-border px-4 py-2 rounded-lg text-xs font-mono">
            <Users className="h-4 w-4 text-primary" />
            Clearances: {users.length} registered
          </div>
        </div>
      </div>

      {error && (
        <div className="bg-destructive/10 border border-destructive/20 text-destructive rounded-md p-4 text-xs font-mono animate-in slide-in-from-top-1">
          [ERROR_LOG]: {error}
        </div>
      )}

      {successMsg && (
        <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 rounded-md p-4 text-xs font-mono animate-in slide-in-from-top-1">
          [SUCCESS_LOG]: {successMsg}
        </div>
      )}

      {/* Navigation tabs */}
      <div className="flex overflow-x-auto gap-2 border-b border-border pb-1 no-scrollbar">
        <button
          onClick={() => setActiveTab("overview")}
          className={`px-4 py-2 text-xs font-mono transition-colors border-b-2 whitespace-nowrap flex items-center gap-1.5 ${
            activeTab === "overview" ? "border-primary text-foreground font-bold" : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          <LayoutDashboard className="h-3.5 w-3.5" /> ./overview
        </button>
        <button
          onClick={() => setActiveTab("verification")}
          className={`px-4 py-2 text-xs font-mono transition-colors border-b-2 whitespace-nowrap flex items-center gap-1.5 ${
            activeTab === "verification" ? "border-primary text-foreground font-bold" : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          ⏳ ./verification ({pendingUsers.length})
        </button>
        <button
          onClick={() => setActiveTab("users")}
          className={`px-4 py-2 text-xs font-mono transition-colors border-b-2 whitespace-nowrap flex items-center gap-1.5 ${
            activeTab === "users" ? "border-primary text-foreground font-bold" : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          <Users className="h-3.5 w-3.5" /> ./classmates_db
        </button>
        <button
          onClick={() => setActiveTab("features")}
          className={`px-4 py-2 text-xs font-mono transition-colors border-b-2 whitespace-nowrap flex items-center gap-1.5 ${
            activeTab === "features" ? "border-primary text-foreground font-bold" : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          <ToggleLeft className="h-3.5 w-3.5" /> ./feature_flags ({features.length})
        </button>
        <button
          onClick={() => setActiveTab("memories")}
          className={`px-4 py-2 text-xs font-mono transition-colors border-b-2 whitespace-nowrap flex items-center gap-1.5 ${
            activeTab === "memories" ? "border-primary text-foreground font-bold" : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          <ImageIcon className="h-3.5 w-3.5" /> ./mosaic_moderate ({memories.length})
        </button>
        <button
          onClick={() => setActiveTab("bugs")}
          className={`px-4 py-2 text-xs font-mono transition-colors border-b-2 whitespace-nowrap flex items-center gap-1.5 ${
            activeTab === "bugs" ? "border-primary text-foreground font-bold" : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          <Bug className="h-3.5 w-3.5" /> ./bug_board ({openBugs.length} open)
        </button>
        <button
          onClick={() => setActiveTab("logs")}
          className={`px-4 py-2 text-xs font-mono transition-colors border-b-2 whitespace-nowrap flex items-center gap-1.5 ${
            activeTab === "logs" ? "border-primary text-foreground font-bold" : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          <History className="h-3.5 w-3.5" /> ./audit_logs
        </button>
      </div>

      {/* --- TAB CONTENT: OVERVIEW --- */}
      {activeTab === "overview" && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="border-border bg-card">
              <CardContent className="p-6 space-y-2">
                <span className="text-xs font-mono text-muted-foreground">Classmates Enrolled</span>
                <div className="text-3xl font-bold font-mono">{approvedUsers.length} <span className="text-xs text-muted-foreground font-normal">/ {users.length} total</span></div>
                <div className="text-2xs font-mono text-amber-500">⏳ {pendingUsers.length} waiting for ID check</div>
              </CardContent>
            </Card>

            <Card className="border-border bg-card">
              <CardContent className="p-6 space-y-2">
                <span className="text-xs font-mono text-muted-foreground">Feature Toggle Status</span>
                <div className="text-3xl font-bold font-mono">{activeFlagsCount} <span className="text-xs text-muted-foreground font-normal">/ {features.length} active</span></div>
                <div className="text-2xs font-mono text-emerald-500">System modules fully configurable</div>
              </CardContent>
            </Card>

            <Card className="border-border bg-card">
              <CardContent className="p-6 space-y-2">
                <span className="text-xs font-mono text-muted-foreground">Memory Collage Photos</span>
                <div className="text-3xl font-bold font-mono">{memories.length}</div>
                <div className="text-2xs font-mono text-muted-foreground">Cloudflare R2 bucket linked</div>
              </CardContent>
            </Card>

            <Card className="border-border bg-card">
              <CardContent className="p-6 space-y-2">
                <span className="text-xs font-mono text-muted-foreground">Outstanding Bug Tickets</span>
                <div className="text-3xl font-bold font-mono">{openBugs.length} <span className="text-xs text-muted-foreground font-normal">open</span></div>
                <div className="text-2xs font-mono text-red-400">Total reported issues: {bugs.length}</div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="lg:col-span-2 border-border bg-card">
              <CardHeader className="pb-3 border-b border-border/50">
                <CardTitle className="text-sm font-bold font-mono">./recent_moderation_logs</CardTitle>
                <CardDescription className="text-2xs font-mono">Immutable audit register activity</CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs font-mono">
                    <thead className="bg-muted/50 border-b border-border text-muted-foreground">
                      <tr>
                        <th className="p-3">Timestamp</th>
                        <th className="p-3">Moderator</th>
                        <th className="p-3">Action</th>
                        <th className="p-3">Target Details</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {logs.slice(0, 5).map((log) => (
                        <tr key={log.id} className="hover:bg-muted/20">
                          <td className="p-3 whitespace-nowrap text-3xs text-muted-foreground">
                            {new Date(log.createdAt).toLocaleString()}
                          </td>
                          <td className="p-3 font-semibold">{log.adminName}</td>
                          <td className="p-3">
                            <span className="px-1.5 py-0.5 rounded text-[10px] bg-primary/10 text-primary border border-primary/20">
                              {log.action}
                            </span>
                          </td>
                          <td className="p-3 truncate max-w-xs" title={log.reason || ""}>
                            {log.reason || "-"}
                          </td>
                        </tr>
                      ))}
                      {logs.length === 0 && (
                        <tr>
                          <td colSpan={4} className="p-4 text-center text-muted-foreground">
                            No logs recorded.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>

            <Card className="border-border bg-card">
              <CardHeader className="pb-3 border-b border-border/50">
                <CardTitle className="text-sm font-bold font-mono">./network_diagnostics</CardTitle>
              </CardHeader>
              <CardContent className="p-4 space-y-4 text-xs font-mono">
                <div className="flex justify-between items-center pb-2 border-b border-border/30">
                  <span>Database Link:</span>
                  <span className="text-emerald-500 font-bold">ONLINE</span>
                </div>
                <div className="flex justify-between items-center pb-2 border-b border-border/30">
                  <span>Prisma Client Client:</span>
                  <span className="text-emerald-500 font-bold">CONNECTED</span>
                </div>
                <div className="flex justify-between items-center pb-2 border-b border-border/30">
                  <span>Secure R2 Store:</span>
                  <span className="text-emerald-500 font-bold">READY (AWS-SDK)</span>
                </div>
                <div className="flex justify-between items-center pb-2 border-b border-border/30">
                  <span>CSRF Shielding:</span>
                  <span className="text-emerald-500 font-bold">ARMED</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Admin Session Clearance:</span>
                  <span className="text-amber-500 font-bold">{session?.user.role}</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* --- TAB CONTENT: VERIFICATION --- */}
      {activeTab === "verification" && (
        <Card className="border-border bg-card animate-in fade-in duration-200">
          <CardHeader>
            <CardTitle className="text-xl font-bold font-mono text-amber-500 flex items-center gap-2">
              ⏳ Identity Verification Queue ({pendingUsers.length})
            </CardTitle>
            <CardDescription className="text-xs font-mono">
              Review and verify uploaded Student ID cards before approving digital profiles.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {pendingUsers.length === 0 ? (
              <p className="text-sm text-muted-foreground font-mono py-8 text-center border border-dashed border-border rounded-lg bg-background/50">
                All verification request logs clear.
              </p>
            ) : (
              <div className="divide-y divide-border border border-border rounded-lg overflow-hidden bg-background/30">
                {pendingUsers.map((u) => (
                  <div key={u.id} className="p-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 hover:bg-muted/10 transition-colors">
                    <div className="flex items-start md:items-center gap-4 flex-1">
                      {u.idCardUrl ? (
                        <div
                          className="relative h-14 w-24 rounded-md border border-border bg-muted overflow-hidden cursor-pointer group hover:opacity-85 transition-opacity flex-shrink-0 shadow-xs"
                          onClick={() => setSelectedIdPhoto(u.idCardUrl || null)}
                          title="Inspect Student ID photo"
                        >
                          <img
                            src={u.idCardUrl}
                            alt="Student ID card upload"
                            className="h-full w-full object-cover"
                          />
                          <div className="absolute inset-0 bg-black/45 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                            <span className="text-[9px] text-white font-mono font-bold">INSPECT ID</span>
                          </div>
                        </div>
                      ) : (
                        <div className="h-14 w-24 rounded-md border border-dashed border-border flex items-center justify-center text-[10px] text-muted-foreground font-mono bg-muted flex-shrink-0">
                          NO ID FILE
                        </div>
                      )}
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-foreground">{u.studentProfile?.name || "Unknown"}</span>
                          <span className="text-xs font-mono bg-muted text-muted-foreground px-2 py-0.5 rounded-full">
                            @{u.studentProfile?.username}
                          </span>
                        </div>
                        <div className="text-xs text-muted-foreground font-mono flex flex-wrap gap-x-4 gap-y-0.5">
                          <span>Email: {u.email}</span>
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
                          "Approve"
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
                          "Reject"
                        )}
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* --- TAB CONTENT: CLASSMATES DATABASE --- */}
      {activeTab === "users" && (
        <Card className="border-border bg-card animate-in fade-in duration-200">
          <CardHeader className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-border/50 pb-4 gap-4">
            <div>
              <CardTitle className="text-lg font-bold font-mono">./classmates_database</CardTitle>
              <CardDescription className="text-2xs font-mono">Admin access list overrides & profile overrides</CardDescription>
            </div>
            <div className="relative w-full sm:w-72">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search by name, email, @username..."
                className="w-full pl-9 pr-4 h-9 bg-background border border-border rounded-md text-xs font-mono focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-ring"
                value={userSearchQuery}
                onChange={(e) => setUserSearchQuery(e.target.value)}
              />
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-mono">
                <thead className="bg-muted/50 border-b border-border text-muted-foreground">
                  <tr>
                    <th className="p-3">Classmate Details</th>
                    <th className="p-3">Role Level</th>
                    <th className="p-3">Verification State</th>
                    <th className="p-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filteredUsers.map((u) => (
                    <tr key={u.id} className="hover:bg-muted/10 transition-colors">
                      <td className="p-3">
                        <div className="font-semibold text-foreground">{u.studentProfile?.name || "Uninitiated Profile"}</div>
                        <div className="text-3xs text-muted-foreground">
                          @{u.studentProfile?.username || "no-slug"} | {u.email}
                        </div>
                      </td>
                      <td className="p-3">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          u.role === "ADMIN" ? "bg-red-950/40 text-red-400 border border-red-500/20" :
                          u.role === "MODERATOR" ? "bg-amber-950/40 text-amber-400 border border-amber-500/20" :
                          "bg-zinc-800 text-zinc-300"
                        }`}>
                          {u.role}
                        </span>
                      </td>
                      <td className="p-3">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                          u.status === "APPROVED" ? "bg-emerald-950/40 text-emerald-400 border border-emerald-500/20" :
                          u.status === "PENDING" ? "bg-amber-950/40 text-amber-400 border border-amber-500/20 animate-pulse" :
                          "bg-red-950/40 text-red-400 border border-red-500/20"
                        }`}>
                          {u.status}
                        </span>
                      </td>
                      <td className="p-3 text-right space-x-1">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => openEditUserModal(u)}
                          className="h-7 px-2 font-mono text-3xs border-border bg-background"
                        >
                          <Edit3 className="h-3 w-3 mr-1" /> Edit Profile
                        </Button>
                        {u.status === "APPROVED" && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => triggerActionPrompt(u.id, "REJECT")}
                            className="h-7 px-2 text-destructive border-destructive/20 hover:bg-destructive/10 font-mono text-3xs"
                          >
                            Suspend
                          </Button>
                        )}
                        {session?.user.role === "ADMIN" && (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => triggerActionPrompt(u.id, "DELETE")}
                            className="h-7 w-7 p-0 text-muted-foreground hover:text-destructive"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        )}
                      </td>
                    </tr>
                  ))}
                  {filteredUsers.length === 0 && (
                    <tr>
                      <td colSpan={4} className="p-4 text-center text-muted-foreground">
                        No classmate profiles match filters.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* --- TAB CONTENT: FEATURE FLAGS --- */}
      {activeTab === "features" && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Create flag form */}
            {session?.user.role === "ADMIN" ? (
              <Card className="border-border bg-card">
                <CardHeader>
                  <CardTitle className="text-sm font-bold font-mono">./initialize_new_feature_flag</CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleCreateFeature} className="space-y-4">
                    <div className="space-y-1">
                      <label className="text-2xs font-mono text-muted-foreground">Flag Key Name (allcaps_slug)</label>
                      <input
                        type="text"
                        placeholder="e.g. MAINTENANCE_MODE"
                        required
                        className="flex h-9 w-full rounded-md border border-input bg-background/50 px-3 py-2 text-xs font-mono focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-ring"
                        value={newFlagKey}
                        onChange={(e) => setNewFlagKey(e.target.value)}
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-2xs font-mono text-muted-foreground">Description / Purpose</label>
                      <textarea
                        placeholder="Purpose of this flag..."
                        rows={2}
                        className="flex w-full rounded-md border border-input bg-background/50 px-3 py-2 text-xs font-mono focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-ring"
                        value={newFlagDesc}
                        onChange={(e) => setNewFlagDesc(e.target.value)}
                      />
                    </div>
                    <div className="flex items-center gap-2">
                      <label className="text-2xs font-mono text-muted-foreground">Default Value:</label>
                      <input
                        type="checkbox"
                        checked={newFlagVal}
                        onChange={(e) => setNewFlagVal(e.target.checked)}
                        className="rounded border-input text-primary focus:ring-primary h-4 w-4"
                      />
                      <span className="text-xs font-mono">{newFlagVal ? "ACTIVE (TRUE)" : "OFF (FALSE)"}</span>
                    </div>
                    <Button type="submit" size="sm" className="w-full text-xs font-mono">
                      <Plus className="h-4.5 w-4.5 mr-1" /> Create Feature Flag
                    </Button>
                  </form>
                </CardContent>
              </Card>
            ) : (
              <Card className="border-border bg-card">
                <CardHeader>
                  <CardTitle className="text-sm font-bold font-mono text-amber-500 flex items-center gap-2">
                    <AlertCircle className="h-4.5 w-4.5" /> Authorization Alert
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-xs font-mono text-muted-foreground">
                  Only System Administrators can create new feature flags. Moderators can only toggle existing flags.
                </CardContent>
              </Card>
            )}

            {/* Flags list */}
            <Card className="lg:col-span-2 border-border bg-card">
              <CardHeader>
                <CardTitle className="text-sm font-bold font-mono">./registered_feature_flags</CardTitle>
                <CardDescription className="text-2xs font-mono">Toggle site modules online/offline instantly</CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs font-mono">
                    <thead className="bg-muted/50 border-b border-border text-muted-foreground">
                      <tr>
                        <th className="p-3">Flag Key / Description</th>
                        <th className="p-3">Status</th>
                        <th className="p-3 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {features.map((f) => (
                        <tr key={f.id} className="hover:bg-muted/10 transition-colors">
                          <td className="p-3">
                            <div className="font-bold text-foreground">{f.key}</div>
                            <div className="text-3xs text-muted-foreground font-normal max-w-sm">
                              {f.description || "No description loaded."}
                            </div>
                            <div className="text-[10px] text-muted-foreground/60 mt-0.5">
                              Last updated: {new Date(f.updatedAt).toLocaleString()}
                            </div>
                          </td>
                          <td className="p-3">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              f.value ? "bg-emerald-950/45 text-emerald-400 border border-emerald-500/20" : "bg-red-950/45 text-red-400 border border-red-500/20"
                            }`}>
                              {f.value ? "ENABLED" : "DISABLED"}
                            </span>
                          </td>
                          <td className="p-3 text-right space-x-1">
                            <Button
                              size="sm"
                              variant={f.value ? "destructive" : "default"}
                              onClick={() => handleToggleFeature(f.id, f.value)}
                              className="h-7 px-2 font-mono text-3xs"
                            >
                              {f.value ? "Disable" : "Enable"}
                            </Button>
                            {session?.user.role === "ADMIN" && (
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => handleDeleteFeature(f.id)}
                                className="h-7 w-7 p-0 text-muted-foreground hover:text-destructive"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </Button>
                            )}
                          </td>
                        </tr>
                      ))}
                      {features.length === 0 && (
                        <tr>
                          <td colSpan={3} className="p-4 text-center text-muted-foreground">
                            No feature flags registered.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* --- TAB CONTENT: MOSAIC MODERATION --- */}
      {activeTab === "memories" && (
        <Card className="border-border bg-card animate-in fade-in duration-200">
          <CardHeader>
            <CardTitle className="text-lg font-bold font-mono">./mosaic_upload_moderation</CardTitle>
            <CardDescription className="text-2xs font-mono">Monitor and remove inappropriate photo uploads from classmate grids</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-mono">
                <thead className="bg-muted/50 border-b border-border text-muted-foreground">
                  <tr>
                    <th className="p-3">Snapshot</th>
                    <th className="p-3">Uploader details</th>
                    <th className="p-3">Description / Metadata</th>
                    <th className="p-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {memories.map((m) => (
                    <tr key={m.id} className="hover:bg-muted/10 transition-colors">
                      <td className="p-3">
                        <div
                          className="h-12 w-20 rounded border border-border bg-muted overflow-hidden cursor-pointer group"
                          onClick={() => setSelectedIdPhoto(m.imageUrl)}
                        >
                          <img src={m.imageUrl} alt="Mosaic snap" className="h-full w-full object-cover" />
                        </div>
                      </td>
                      <td className="p-3">
                        <div className="font-semibold text-foreground">{m.uploaderName}</div>
                        <div className="text-3xs text-muted-foreground">ID: {m.uploadedBy}</div>
                      </td>
                      <td className="p-3">
                        <div className="max-w-xs truncate text-foreground font-normal" title={m.description}>{m.description}</div>
                        <div className="text-3xs text-muted-foreground flex gap-3">
                          <span>Captured: {new Date(m.date).toLocaleDateString()}</span>
                          {m.location && <span>Loc: {m.location}</span>}
                        </div>
                      </td>
                      <td className="p-3 text-right">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDeleteMemory(m.id)}
                          className="h-7 px-2 text-destructive border-destructive/20 hover:bg-destructive/10 font-mono text-3xs bg-background"
                        >
                          <Trash2 className="h-3 w-3 mr-1" /> Purge Image
                        </Button>
                      </td>
                    </tr>
                  ))}
                  {memories.length === 0 && (
                    <tr>
                      <td colSpan={4} className="p-4 text-center text-muted-foreground">
                        No memory snaps uploaded.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* --- TAB CONTENT: BUG REPORTS BOARD --- */}
      {activeTab === "bugs" && (
        <Card className="border-border bg-card animate-in fade-in duration-200">
          <CardHeader>
            <CardTitle className="text-lg font-bold font-mono">./bug_reports_board</CardTitle>
            <CardDescription className="text-2xs font-mono">Review classmate-logged issues, jokes, and sandbox reports</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-mono">
                <thead className="bg-muted/50 border-b border-border text-muted-foreground">
                  <tr>
                    <th className="p-3">Bug Code / Title</th>
                    <th className="p-3">Description</th>
                    <th className="p-3">Reporter</th>
                    <th className="p-3">Workflow State</th>
                    <th className="p-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {bugs.map((b) => (
                    <tr key={b.id} className="hover:bg-muted/10 transition-colors">
                      <td className="p-3">
                        <div className="font-bold text-foreground">{b.title}</div>
                        <div className="text-[10px] text-muted-foreground/60">{new Date(b.createdAt).toLocaleString()}</div>
                      </td>
                      <td className="p-3">
                        <div className="max-w-xs whitespace-pre-wrap leading-relaxed text-muted-foreground font-normal">
                          {b.description}
                        </div>
                      </td>
                      <td className="p-3 font-semibold text-foreground">{b.reporter}</td>
                      <td className="p-3">
                        <select
                          className="h-8 rounded border border-input bg-background/50 px-2 py-1 text-3xs font-mono focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-ring"
                          value={b.status}
                          onChange={(e) => handleUpdateBugStatus(b.id, e.target.value)}
                        >
                          <option value="OPEN">🔴 OPEN</option>
                          <option value="IN_PROGRESS">🟡 IN PROGRESS</option>
                          <option value="RESOLVED">🟢 RESOLVED</option>
                        </select>
                      </td>
                      <td className="p-3 text-right">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleDeleteBug(b.id)}
                          className="h-7 w-7 p-0 text-muted-foreground hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                  {bugs.length === 0 && (
                    <tr>
                      <td colSpan={5} className="p-4 text-center text-muted-foreground">
                        No reported issues in catalog.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* --- TAB CONTENT: AUDIT LOGS --- */}
      {activeTab === "logs" && (
        <Card className="border-border bg-card animate-in fade-in duration-200">
          <CardHeader>
            <CardTitle className="text-xl font-bold text-foreground flex items-center gap-2">
              <History className="h-5 w-5 text-primary" /> 🛡 Moderation Audit Logs
            </CardTitle>
            <CardDescription className="text-muted-foreground text-xs font-mono">
              Immutable tracking of verification actions, suspensions, and configuration toggles.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm font-mono">
                <thead className="bg-muted/50 border-b border-border text-muted-foreground text-xs">
                  <tr>
                    <th className="p-3">Timestamp</th>
                    <th className="p-3">Moderator</th>
                    <th className="p-3">Target Node</th>
                    <th className="p-3">Action</th>
                    <th className="p-3">Reason / Details</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border text-xs">
                  {logs.map((log) => (
                    <tr key={log.id} className="hover:bg-muted/30 transition-colors">
                      <td className="p-3 whitespace-nowrap text-3xs text-muted-foreground">
                        {new Date(log.createdAt).toLocaleString()}
                      </td>
                      <td className="p-3 font-semibold text-foreground">
                        {log.adminName}
                      </td>
                      <td className="p-3 text-foreground">
                        {log.targetName}
                      </td>
                      <td className="p-3">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          log.action.includes("APPROVE") ? "bg-emerald-950 text-emerald-400 border border-emerald-500/25" :
                          log.action.includes("REJECT") ? "bg-amber-950 text-amber-400 border border-amber-500/25" :
                          log.action.includes("FLAG") ? "bg-blue-950 text-blue-400 border border-blue-500/25" :
                          "bg-red-950 text-red-400 border border-red-500/25"
                        }`}>
                          {log.action}
                        </span>
                      </td>
                      <td className="p-3 text-muted-foreground leading-relaxed max-w-sm truncate" title={log.reason || ""}>
                        {log.reason || "-"}
                      </td>
                    </tr>
                  ))}
                  {logs.length === 0 && (
                    <tr>
                      <td colSpan={5} className="p-4 text-center text-muted-foreground">
                        No audit logs recorded yet.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* --- ID CARD LIGHTBOX --- */}
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
              className="absolute right-4 top-4 z-10 bg-black/75 hover:bg-black/90 text-white hover:text-red-400 p-2 rounded-full transition-colors shadow-md"
              aria-label="Close image viewer"
            >
              <XCircle className="h-5 w-5" />
            </button>
            <img
              src={selectedIdPhoto}
              alt="Verification inspection attachment"
              className="max-w-full max-h-[80vh] object-contain rounded"
            />
          </div>
        </div>
      )}

      {/* --- REASON PROMPT MODAL --- */}
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
                  onClick={handleIdentityAction}
                >
                  Confirm Action
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* --- EDIT STUDENT PROFILE OVERRIDE DIALOG --- */}
      {editUserModalOpen && editingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="relative w-full max-w-2xl rounded-lg border border-border bg-card p-6 shadow-xl space-y-4 animate-in zoom-in-95 my-8">
            <button
              onClick={() => {
                setEditUserModalOpen(false)
                setEditingUser(null)
              }}
              className="absolute right-4 top-4 text-muted-foreground hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </button>

            <div className="border-b border-border pb-3">
              <h3 className="text-lg font-semibold font-mono flex items-center gap-1.5 text-primary">
                ⚙ Override Student Profile settings
              </h3>
              <p className="text-xs text-muted-foreground font-mono mt-1">
                Directly override profile details, system clearances, or custom styling rules for student profile node.
              </p>
            </div>

            <form onSubmit={handleUpdateProfileSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-2xs font-mono text-muted-foreground">Full Name</label>
                  <input
                    type="text"
                    required
                    className="flex h-9 w-full rounded-md border border-input bg-background/50 px-3 py-2 text-xs font-mono"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-2xs font-mono text-muted-foreground">Username Slug</label>
                  <input
                    type="text"
                    required
                    className="flex h-9 w-full rounded-md border border-input bg-background/50 px-3 py-2 text-xs font-mono"
                    value={editUsername}
                    onChange={(e) => setEditUsername(e.target.value)}
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-2xs font-mono text-muted-foreground">Sub-Title / Interest Role</label>
                  <input
                    type="text"
                    required
                    className="flex h-9 w-full rounded-md border border-input bg-background/50 px-3 py-2 text-xs font-mono"
                    value={editRole}
                    onChange={(e) => setEditRole(e.target.value)}
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-2xs font-mono text-muted-foreground">Bugs Fixed (Stats Counter)</label>
                  <input
                    type="number"
                    required
                    min={0}
                    className="flex h-9 w-full rounded-md border border-input bg-background/50 px-3 py-2 text-xs font-mono"
                    value={editBugsFixed}
                    onChange={(e) => setEditBugsFixed(Number(e.target.value))}
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-2xs font-mono text-muted-foreground">Coffee Consumed (Stats Counter)</label>
                  <input
                    type="number"
                    required
                    min={0}
                    className="flex h-9 w-full rounded-md border border-input bg-background/50 px-3 py-2 text-xs font-mono"
                    value={editCoffeeConsumed}
                    onChange={(e) => setEditCoffeeConsumed(Number(e.target.value))}
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-2xs font-mono text-muted-foreground">System Security Clearance Role</label>
                  <select
                    className="flex h-9 w-full rounded-md border border-input bg-background/50 px-3 py-2 text-xs font-mono"
                    value={editAccountRole}
                    onChange={(e) => setEditAccountRole(e.target.value)}
                  >
                    <option value="STUDENT">STUDENT</option>
                    <option value="MODERATOR">MODERATOR</option>
                    {session?.user.role === "ADMIN" && <option value="ADMIN">ADMIN</option>}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-2xs font-mono text-muted-foreground">Account Status</label>
                  <select
                    className="flex h-9 w-full rounded-md border border-input bg-background/50 px-3 py-2 text-xs font-mono"
                    value={editAccountStatus}
                    onChange={(e) => setEditAccountStatus(e.target.value)}
                  >
                    <option value="PENDING">PENDING</option>
                    <option value="APPROVED">APPROVED</option>
                    <option value="REJECTED">REJECTED / SUSPENDED</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-2xs font-mono text-muted-foreground">Bio / Profile Description</label>
                <textarea
                  rows={3}
                  className="flex w-full rounded-md border border-input bg-background/50 px-3 py-2 text-xs font-mono"
                  value={editBio}
                  onChange={(e) => setEditBio(e.target.value)}
                />
              </div>

              <div className="space-y-1">
                <label className="text-2xs font-mono text-muted-foreground">Custom CSS injection rules (optional)</label>
                <textarea
                  rows={4}
                  placeholder="e.g. .student-card { background: gold; }"
                  className="flex w-full rounded-md border border-input bg-background/50 px-3 py-2 text-[11px] font-mono"
                  value={editCustomCss}
                  onChange={(e) => setEditCustomCss(e.target.value)}
                />
              </div>

              <div className="flex gap-3 justify-end pt-3 border-t border-border">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="font-mono text-xs bg-background"
                  onClick={() => {
                    setEditUserModalOpen(false)
                    setEditingUser(null)
                  }}
                >
                  Cancel
                </Button>
                <Button type="submit" size="sm" className="font-mono text-xs">
                  Save Changes
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
