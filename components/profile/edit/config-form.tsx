"use client"

import React from "react"
import { Camera, Loader2, User, Tag, FileText, Github, Linkedin } from "lucide-react"

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

      const uploadRes = await fetch(uploadUrl, {
        method: "PUT",
        headers: { "Content-Type": file.type },
        body: file,
      })

      if (!uploadRes.ok) {
        throw new Error("Failed to upload avatar to storage.")
      }

      setAvatarUrl(publicUrl)
    } catch (err: any) {
      setError(err.message || "Failed to upload avatar.")
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="space-y-6 animate-in fade-in-50 duration-300">
      <div>
        <h3 className="text-base font-bold text-foreground font-mono">./identity_config</h3>
        <p className="text-xs text-muted-foreground font-mono mt-0.5">
          Configure primary metadata, avatar, and social links.
        </p>
      </div>

      {/* Avatar Upload Box */}
      <div className="bg-neutral-900/40 border border-white/5 rounded-xl p-5 flex items-center gap-5 backdrop-blur-xs relative overflow-hidden">
        {/* Glow effect in background */}
        <div className="absolute -right-10 -top-10 w-24 h-24 bg-primary/10 rounded-full blur-xl pointer-events-none" />
        
        <div className="relative h-20 w-20 rounded-full overflow-hidden border border-white/10 bg-black/40 flex items-center justify-center group shadow-md shrink-0">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={avatarUrl} alt="Avatar" className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105" />
          {uploading && (
            <div className="absolute inset-0 bg-black/75 flex items-center justify-center">
              <Loader2 className="h-5 w-5 animate-spin text-primary" />
            </div>
          )}
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity cursor-pointer">
            <Camera className="h-5 w-5 text-white/90" />
          </div>
          <input
            type="file"
            accept="image/*"
            className="absolute inset-0 opacity-0 cursor-pointer"
            onChange={handleAvatarChange}
            disabled={uploading}
          />
        </div>

        <div className="space-y-1">
          <span className="text-xs font-mono font-bold text-white block">Upload Profile Photo</span>
          <p className="text-3xs text-muted-foreground font-mono max-w-xs leading-relaxed">
            Click photo or drag-and-drop. Accepts JPEG, PNG, WEBP. Uploads directly to secure Cloudflare R2 storage.
          </p>
          <label className="inline-flex items-center gap-1.5 h-7 px-2.5 bg-primary/10 border border-primary/20 hover:border-primary/40 hover:bg-primary/20 rounded-md text-[10px] font-mono text-primary transition-all cursor-pointer mt-1">
            <Camera className="h-3 w-3" /> Select File
            <input
              type="file"
              accept="image/*"
              className="absolute inset-0 opacity-0 cursor-pointer hidden"
              onChange={handleAvatarChange}
              disabled={uploading}
            />
          </label>
        </div>
      </div>

      {/* Grid for Name and Role */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        
        {/* Name Input */}
        <div className="space-y-1.5">
          <label htmlFor="name" className="text-xs font-mono font-semibold text-muted-foreground flex items-center gap-1.5">
            <User className="h-3.5 w-3.5 text-primary" /> Full Name
          </label>
          <div className="relative">
            <input
              id="name"
              type="text"
              required
              placeholder="e.g. John Doe"
              className="flex h-10 w-full rounded-lg border border-white/10 bg-black/20 hover:bg-black/35 px-4 text-xs text-foreground placeholder:text-muted-foreground focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-primary focus-visible:border-primary transition-all"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
        </div>

        {/* Role Input */}
        <div className="space-y-1.5">
          <label htmlFor="role" className="text-xs font-mono font-semibold text-muted-foreground flex items-center gap-1.5">
            <Tag className="h-3.5 w-3.5 text-primary" /> Tagline / Role
          </label>
          <div className="relative">
            <input
              id="role"
              type="text"
              required
              placeholder="e.g. Fullstack Engineer"
              className="flex h-10 w-full rounded-lg border border-white/10 bg-black/20 hover:bg-black/35 px-4 text-xs text-foreground placeholder:text-muted-foreground focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-primary focus-visible:border-primary transition-all"
              value={role}
              onChange={(e) => setRole(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Bio Text Area */}
      <div className="space-y-1.5">
        <label htmlFor="bio" className="text-xs font-mono font-semibold text-muted-foreground flex items-center gap-1.5">
          <FileText className="h-3.5 w-3.5 text-primary" /> Biography
        </label>
        <p className="text-3xs text-muted-foreground font-mono leading-none">
          Introduce yourself. Supports markdown.
        </p>
        <textarea
          id="bio"
          required
          rows={5}
          placeholder="### Hello World! \nTell your story here..."
          className="flex w-full rounded-lg border border-white/10 bg-black/20 hover:bg-black/35 p-4 text-xs text-foreground placeholder:text-muted-foreground focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-primary focus-visible:border-primary transition-all font-mono leading-relaxed"
          value={bio}
          onChange={(e) => setBio(e.target.value)}
        />
      </div>

      {/* Social URLs */}
      <div className="space-y-4">
        <span className="text-xs font-mono font-bold text-foreground block">./social_nodes</span>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* GitHub Input */}
          <div className="space-y-1.5">
            <label htmlFor="github" className="text-xs font-mono font-semibold text-muted-foreground flex items-center gap-1.5">
              <Github className="h-3.5 w-3.5 text-purple-400" /> GitHub URL
            </label>
            <input
              id="github"
              type="url"
              className="flex h-10 w-full rounded-lg border border-white/10 bg-black/20 hover:bg-black/35 px-4 text-xs text-foreground placeholder:text-neutral-600 focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-primary focus-visible:border-primary transition-all"
              placeholder="https://github.com/username"
              value={github}
              onChange={(e) => setGithub(e.target.value)}
            />
          </div>

          {/* LinkedIn Input */}
          <div className="space-y-1.5">
            <label htmlFor="linkedin" className="text-xs font-mono font-semibold text-muted-foreground flex items-center gap-1.5">
              <Linkedin className="h-3.5 w-3.5 text-sky-400" /> LinkedIn URL
            </label>
            <input
              id="linkedin"
              type="url"
              className="flex h-10 w-full rounded-lg border border-white/10 bg-black/20 hover:bg-black/35 px-4 text-xs text-foreground placeholder:text-neutral-600 focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-primary focus-visible:border-primary transition-all"
              placeholder="https://linkedin.com/in/username"
              value={linkedin}
              onChange={(e) => setLinkedin(e.target.value)}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
