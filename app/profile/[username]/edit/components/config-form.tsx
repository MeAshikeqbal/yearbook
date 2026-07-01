"use client"

import React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Code2, Camera, Loader2 } from "lucide-react"

interface ConfigFormProps {
  name: string
  setName: (v: string) => void
  role: string
  setRole: (v: string) => void
  bio: string
  setBio: (v: string) => void
  avatarUrl: string
  setAvatarUrl: (v: string) => void
  github: string
  setGithub: (v: string) => void
  linkedin: string
  setLinkedin: (v: string) => void
  uploading: boolean
  setUploading: (v: boolean) => void
  setError: (v: string) => void
}

export function ConfigForm({
  name,
  setName,
  role,
  setRole,
  bio,
  setBio,
  avatarUrl,
  setAvatarUrl,
  github,
  setGithub,
  linkedin,
  setLinkedin,
  uploading,
  setUploading,
  setError,
}: ConfigFormProps) {
  
  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploading(true)
    setError("")

    try {
      // 1. Get pre-signed URL from Cloudflare R2 API
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

      // 2. Upload file directly to R2 using PUT
      const uploadRes = await fetch(uploadUrl, {
        method: "PUT",
        headers: { "Content-Type": file.type },
        body: file,
      })

      if (!uploadRes.ok) {
        throw new Error("Failed to upload avatar to storage.")
      }

      // 3. Update parent state
      setAvatarUrl(publicUrl)
    } catch (err: any) {
      setError(err.message || "Failed to upload avatar.")
    } finally {
      setUploading(false)
    }
  }

  return (
    <Card className="border-border bg-card">
      <CardHeader className="border-b border-border/50 py-3 px-6">
        <CardTitle className="text-sm font-bold font-mono flex items-center gap-2">
          <Code2 className="h-4 w-4 text-primary" /> profile.config
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6 space-y-4">
        
        {/* Avatar Upload Container */}
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

        {/* Bio Text Area */}
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
  )
}
