"use client"

import React, { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { 
  Save, X, Camera, Plus, Trash2, Cpu, 
  Terminal, Eye, Code2, Loader2, ArrowLeft 
} from "lucide-react"

interface StudentData {
  username: string
  name: string
  role: string
  bio: string
  avatarUrl: string
  github: string
  linkedin: string
  customCss: string
  stats: Record<string, any>
}

interface ProfileEditorClientProps {
  initialData: StudentData
}

export default function ProfileEditorClient({ initialData }: ProfileEditorClientProps) {
  const router = useRouter()
  const [name, setName] = useState(initialData.name)
  const [role, setRole] = useState(initialData.role)
  const [bio, setBio] = useState(initialData.bio)
  const [avatarUrl, setAvatarUrl] = useState(initialData.avatarUrl)
  const [github, setGithub] = useState(initialData.github)
  const [linkedin, setLinkedin] = useState(initialData.linkedin)
  const [customCss, setCustomCss] = useState(initialData.customCss)
  
  // Convert stats object to key-value array for form rendering
  const [stats, setStats] = useState<{ key: string; val: string | number }[]>(
    Object.entries(initialData.stats).map(([k, v]) => ({ key: k, val: v }))
  )

  const [newStatKey, setNewStatKey] = useState("")
  const [newStatVal, setNewStatVal] = useState("")

  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)

  // S3/R2 Avatar file selector
  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploading(true)
    setError("")

    try {
      // 1. Get presigned URL
      const urlRes = await fetch("/api/upload-url", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          filename: file.name,
          contentType: file.type,
          folder: "avatars",
        }),
      })

      if (!urlRes.ok) {
        const urlData = await urlRes.json()
        throw new Error(urlData.error || "Failed to authorize avatar upload.")
      }

      const { uploadUrl, publicUrl } = await urlRes.json()

      // 2. Upload file directly to R2
      const uploadRes = await fetch(uploadUrl, {
        method: "PUT",
        headers: { "Content-Type": file.type },
        body: file,
      })

      if (!uploadRes.ok) {
        throw new Error("Failed to upload avatar to storage.")
      }

      // 3. Update preview avatarUrl
      setAvatarUrl(publicUrl)
    } catch (err: any) {
      setError(err.message || "Failed to upload avatar.")
    } finally {
      setUploading(false)
    }
  }

  const handleAddStat = () => {
    if (!newStatKey || !newStatVal) return
    
    // Clean key (camelCase or alphanumeric spaces only)
    const cleanKey = newStatKey.trim()
    if (stats.some((s) => s.key === cleanKey)) {
      setError("Metric name already exists.")
      return
    }

    setStats([...stats, { key: cleanKey, val: newStatVal.trim() }])
    setNewStatKey("")
    setNewStatVal("")
  }

  const handleRemoveStat = (keyToRemove: string) => {
    setStats(stats.filter((s) => s.key !== keyToRemove))
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError("")
    setSuccess(false)

    // Convert stats list back to object
    const statsObj: Record<string, any> = {}
    stats.forEach((s) => {
      // Try to parse values as numbers if they are pure digits
      const isNumber = /^\d+$/.test(s.val.toString())
      statsObj[s.key] = isNumber ? parseInt(s.val.toString(), 10) : s.val
    })

    try {
      const res = await fetch("/api/profile/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: initialData.username,
          name,
          role,
          bio,
          avatarUrl,
          github,
          linkedin,
          customCss,
          stats: statsObj,
        }),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || "Failed to update profile.")
      }

      setSuccess(true)
      router.push(`/profile/${initialData.username}`)
      router.refresh()
    } catch (err: any) {
      setError(err.message || "Failed to save profile changes.")
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="min-h-svh bg-background text-foreground py-8 md:py-12">
      
      {/* Scope dynamic CSS to preview container */}
      {customCss && (
        <style
          dangerouslySetInnerHTML={{
            __html: `
              .preview-card-wrapper {
                ${customCss}
              }
            `,
          }}
        />
      )}

      <div className="container mx-auto max-w-7xl px-4 md:px-6 space-y-8">
        
        {/* Navigation / Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-border pb-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight font-mono">./edit_profile</h1>
            <p className="text-muted-foreground text-sm font-mono mt-1">
              Customize student profile card details & override style code
            </p>
          </div>
          <Button variant="ghost" size="sm" className="font-mono text-xs gap-1" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4" /> Cancel
          </Button>
        </div>

        {error && (
          <div className="bg-destructive/10 border border-destructive/20 text-destructive rounded-md p-4 text-xs font-mono">
            [ERROR]: {error}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
          
          {/* LEFT COLUMN: WORKSPACE FORM */}
          <form onSubmit={handleSave} className="space-y-6">
            
            {/* General Info Card */}
            <Card className="border-border bg-card">
              <CardHeader className="border-b border-border/50 py-3 px-6">
                <CardTitle className="text-sm font-bold font-mono flex items-center gap-2">
                  <Code2 className="h-4 w-4 text-primary" /> profile.config
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                
                {/* Avatar upload */}
                <div className="flex items-center gap-4">
                  <div className="relative h-16 w-16 rounded-full overflow-hidden border border-border bg-muted flex items-center justify-center">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={avatarUrl} alt="Avatar" className="h-full w-full object-cover" />
                    {uploading && (
                      <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                        <Loader2 className="h-4 w-4 animate-spin text-white" />
                      </div>
                    )}
                  </div>
                  <div>
                    <label className="relative flex items-center gap-2 h-9 px-3 border border-border rounded-md text-xs font-mono bg-background hover:bg-muted cursor-pointer transition-colors text-foreground">
                      <Camera className="h-4 w-4" />
                      Upload Avatar
                      <input
                        type="file"
                        accept="image/*"
                        className="absolute inset-0 opacity-0 cursor-pointer"
                        onChange={handleAvatarChange}
                        disabled={uploading}
                      />
                    </label>
                    <span className="text-3xs text-muted-foreground font-mono block mt-1">Direct upload to Cloudflare R2</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {/* Name Input */}
                  <div className="space-y-1">
                    <label htmlFor="name" className="text-xs font-mono text-muted-foreground">Full Name</label>
                    <input
                      id="name"
                      type="text"
                      required
                      className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-2 text-xs focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-ring"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                    />
                  </div>

                  {/* Role Input */}
                  <div className="space-y-1">
                    <label htmlFor="role" className="text-xs font-mono text-muted-foreground">Tagline / Role</label>
                    <input
                      id="role"
                      type="text"
                      required
                      className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-2 text-xs focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-ring"
                      value={role}
                      onChange={(e) => setRole(e.target.value)}
                    />
                  </div>
                </div>

                {/* Bio text area */}
                <div className="space-y-1">
                  <label htmlFor="bio" className="text-xs font-mono text-muted-foreground">Biography (Markdown friendly)</label>
                  <textarea
                    id="bio"
                    required
                    rows={4}
                    className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-xs focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-ring font-mono"
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {/* GitHub Input */}
                  <div className="space-y-1">
                    <label htmlFor="github" className="text-xs font-mono text-muted-foreground">GitHub URL</label>
                    <input
                      id="github"
                      type="url"
                      className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-2 text-xs focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-ring"
                      placeholder="https://github.com/..."
                      value={github}
                      onChange={(e) => setGithub(e.target.value)}
                    />
                  </div>

                  {/* LinkedIn Input */}
                  <div className="space-y-1">
                    <label htmlFor="linkedin" className="text-xs font-mono text-muted-foreground">LinkedIn URL</label>
                    <input
                      id="linkedin"
                      type="url"
                      className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-2 text-xs focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-ring"
                      placeholder="https://linkedin.com/in/..."
                      value={linkedin}
                      onChange={(e) => setLinkedin(e.target.value)}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Metrics Editor Card */}
            <Card className="border-border bg-card">
              <CardHeader className="border-b border-border/50 py-3 px-6">
                <CardTitle className="text-sm font-bold font-mono flex items-center gap-2">
                  <Cpu className="h-4 w-4 text-accent" /> diagnostic_metrics
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                
                {/* Current stats list */}
                <div className="space-y-2">
                  <span className="text-xs font-mono text-muted-foreground block">Active Metrics Grid</span>
                  {stats.length === 0 ? (
                    <p className="text-3xs font-mono text-muted-foreground py-2 text-center border border-dashed border-border rounded-md">
                      No custom metrics compiled. Add some metrics below!
                    </p>
                  ) : (
                    <div className="grid grid-cols-2 gap-2">
                      {stats.map((s) => (
                        <div key={s.key} className="flex justify-between items-center bg-background border border-border p-2 rounded-md font-mono text-xs">
                          <div className="truncate pr-1">
                            <span className="text-muted-foreground text-3xs block uppercase tracking-wider">{s.key}</span>
                            <span className="font-semibold">{s.val}</span>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleRemoveStat(s.key)}
                            className="text-muted-foreground hover:text-destructive p-1"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Add new stat inputs */}
                <div className="border-t border-border/50 pt-4 flex gap-2 items-end">
                  <div className="flex-1 space-y-1">
                    <label className="text-3xs font-mono text-muted-foreground">Metric Name</label>
                    <input
                      type="text"
                      className="flex h-8 w-full rounded-md border border-input bg-background px-2.5 py-1 text-xs focus-visible:outline-hidden focus-visible:ring-1"
                      placeholder="e.g. coffeeConsumed, bugsFixed"
                      value={newStatKey}
                      onChange={(e) => setNewStatKey(e.target.value)}
                    />
                  </div>
                  <div className="flex-1 space-y-1">
                    <label className="text-3xs font-mono text-muted-foreground">Metric Value</label>
                    <input
                      type="text"
                      className="flex h-8 w-full rounded-md border border-input bg-background px-2.5 py-1 text-xs focus-visible:outline-hidden focus-visible:ring-1"
                      placeholder="e.g. 404, VS Code, C++"
                      value={newStatVal}
                      onChange={(e) => setNewStatVal(e.target.value)}
                    />
                  </div>
                  <Button
                    type="button"
                    size="sm"
                    className="h-8 gap-1 font-mono text-3xs"
                    onClick={handleAddStat}
                  >
                    <Plus className="h-3.5 w-3.5" /> Add
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Custom CSS Editor Card */}
            <Card className="border-border bg-card">
              <CardHeader className="border-b border-border/50 py-3 px-6">
                <CardTitle className="text-sm font-bold font-mono flex items-center gap-2">
                  <Terminal className="h-4 w-4 text-emerald-500" /> stylesheet_override.css
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-2">
                <span className="text-3xs font-mono text-muted-foreground block leading-relaxed">
                  Write custom CSS rules to customize your card. Scoped root is `.profile-card`. 
                  Try adding background gradients, border colors, or hover scales!
                </span>
                <textarea
                  rows={8}
                  className="flex w-full rounded-md border border-input bg-background p-3 text-xs focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-ring font-mono text-emerald-500"
                  placeholder={
                    "/* Custom CSS example */\n.profile-card {\n  background: linear-gradient(135deg, #1f1f2e, #2e1f3d);\n  border-color: #ec4899;\n  transform: rotate(-1deg);\n}"
                  }
                  value={customCss}
                  onChange={(e) => setCustomCss(e.target.value)}
                />
              </CardContent>
            </Card>

            <div className="flex gap-4">
              <Button type="submit" className="flex-1 h-10" disabled={saving || uploading}>
                {saving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving Changes...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" /> Save Configuration
                  </>
                )}
              </Button>
            </div>
          </form>

          {/* RIGHT COLUMN: LIVE INTERACTIVE PREVIEW */}
          <div className="space-y-6 lg:sticky lg:top-20">
            <div className="flex items-center gap-2 border-b border-border pb-3">
              <Eye className="h-4 w-4 text-primary" />
              <h3 className="font-mono text-xs font-semibold">Live Sandbox Compilation</h3>
            </div>

            {/* Simulated Profile Page rendering Preview Card */}
            <div className="preview-card-wrapper p-6 border border-border bg-background rounded-xl flex flex-col items-center justify-center space-y-6">
              
              {/* Profile Card Mock */}
              <div className="w-full max-w-sm flex flex-col items-center text-center p-6 border border-border bg-card rounded-lg space-y-4 profile-card">
                <div className="relative h-24 w-24 rounded-full overflow-hidden border border-border bg-muted flex items-center justify-center">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={avatarUrl} alt={name} className="h-full w-full object-cover" />
                </div>
                <div className="space-y-1">
                  <h4 className="text-base font-bold tracking-tight text-foreground">{name || "Your Name"}</h4>
                  <span className="text-3xs font-mono text-muted-foreground block">@{initialData.username}</span>
                </div>
                <span className="inline-block bg-primary/10 border border-primary/20 text-primary font-mono text-3xs px-2 py-0.5 rounded-full">
                  {role || "CSE Student"}
                </span>

                <p className="text-2xs text-muted-foreground font-mono leading-relaxed line-clamp-3 w-full border-t border-border/50 pt-3">
                  {bio || "Write your bio in the config editor..."}
                </p>

                {stats.length > 0 && (
                  <div className="grid grid-cols-2 gap-2 w-full border-t border-border/50 pt-3">
                    {stats.map((s) => (
                      <div key={s.key} className="p-2 border border-border/50 bg-background rounded-sm flex flex-col justify-center h-12 text-left font-mono">
                        <span className="text-4xs text-muted-foreground uppercase tracking-wider truncate">{s.key}</span>
                        <span className="text-xs font-bold text-foreground truncate">{s.val}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
