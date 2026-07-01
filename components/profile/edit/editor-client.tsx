"use client"

import React, { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Save, Terminal, Loader2, ArrowLeft } from "lucide-react"

// Import custom components locally
import { ConfigForm } from "./config-form"
import { MetricsEditor } from "./metrics-editor"
import { LiveSandbox } from "./live-sandbox"

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

interface StatItem {
  key: string
  val: string | number
}

export default function ProfileEditorClient({ initialData }: ProfileEditorClientProps) {
  const router = useRouter()
  
  // Shared States
  const [name, setName] = useState<string>(initialData.name)
  const [role, setRole] = useState<string>(initialData.role)
  const [bio, setBio] = useState<string>(initialData.bio)
  const [avatarUrl, setAvatarUrl] = useState<string>(initialData.avatarUrl)
  const [github, setGithub] = useState<string>(initialData.github)
  const [linkedin, setLinkedin] = useState<string>(initialData.linkedin)
  const [customCss, setCustomCss] = useState<string>(initialData.customCss)
  const [stats, setStats] = useState<StatItem[]>(
    Object.entries(initialData.stats).map(([k, v]) => ({ key: k, val: v }))
  )

  // Status States
  const [saving, setSaving] = useState<boolean>(false)
  const [uploading, setUploading] = useState<boolean>(false)
  const [error, setError] = useState<string>("")

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError("")

    // Convert stats array back to JSON object
    const statsObj: Record<string, string | number> = {}
    stats.forEach((s) => {
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
            
            {/* General Info Configuration Component */}
            <ConfigForm
              name={name}
              setName={setName}
              role={role}
              setRole={setRole}
              bio={bio}
              setBio={setBio}
              avatarUrl={avatarUrl}
              setAvatarUrl={setAvatarUrl}
              github={github}
              setGithub={setGithub}
              linkedin={linkedin}
              setLinkedin={setLinkedin}
              uploading={uploading}
              setUploading={setUploading}
              setError={setError}
            />

            {/* Custom Metrics Grid Component */}
            <MetricsEditor
              stats={stats}
              setStats={setStats}
              setError={setError}
            />

            {/* Custom CSS Scoped Rules Override */}
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

            {/* Save Buttons */}
            <div className="flex gap-4">
              <Button type="submit" className="flex-1 h-10 font-mono text-xs" disabled={saving || uploading}>
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
          <LiveSandbox
            username={initialData.username}
            name={name}
            role={role}
            bio={bio}
            avatarUrl={avatarUrl}
            stats={stats}
          />
        </div>
      </div>
    </div>
  )
}
