"use client"

import React, { useEffect, useState } from "react"
import { useSession, getCsrfToken } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { 
  Camera, Calendar, MapPin, User, Plus, X, 
  Loader2, Image as ImageIcon, Search, ChevronRight 
} from "lucide-react"
import { useFeatures } from "@/components/features-provider"
import FeatureDisabled from "@/components/ui/feature-disabled"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"

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

export default function MemoriesPage() {
  const { data: session } = useSession()
  const { hasFeature } = useFeatures()
  const [memories, setMemories] = useState<Memory[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")

  // Upload modal state
  const [uploadOpen, setUploadOpen] = useState(false)
  const [file, setFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [description, setDescription] = useState("")
  const [date, setDate] = useState("")
  const [location, setLocation] = useState("")
  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState("")

  // Lightbox state
  const [activeMemory, setActiveMemory] = useState<Memory | null>(null)

  useEffect(() => {
    fetchMemories()
  }, [])

  const fetchMemories = async () => {
    try {
      setLoading(true)
      const res = await fetch("/api/memories")
      if (!res.ok) throw new Error("Failed to fetch memories")
      const data = await res.json()
      setMemories(data.memories || [])
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile) {
      setFile(selectedFile)
      setPreviewUrl(URL.createObjectURL(selectedFile))
    }
  }

  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!file || !description || !date) {
      setUploadError("Please fill out all required fields and select an image.")
      return
    }

    setUploading(true)
    setUploadError("")

    try {
      const csrfToken = await getCsrfToken();
      // 1. Request presigned URL from R2 API
      const urlRes = await fetch("/api/upload-url", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "x-csrf-token": csrfToken || "",
        },
        body: JSON.stringify({
          filename: file.name,
          contentType: file.type,
          folder: "memories",
        }),
      })

      if (!urlRes.ok) {
        const urlData = await urlRes.json()
        throw new Error(urlData.error || "Failed to get upload authorization.")
      }

      const { uploadUrl, publicUrl } = await urlRes.json()

      // 2. Upload file directly to Cloudflare R2
      const uploadRes = await fetch(uploadUrl, {
        method: "PUT",
        headers: { "Content-Type": file.type },
        body: file,
      })

      if (!uploadRes.ok) {
        throw new Error("Failed to upload image file to Cloudflare storage.")
      }

      // 3. Create database entry
      const dbRes = await fetch("/api/memories", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "x-csrf-token": csrfToken || "",
        },
        body: JSON.stringify({
          imageUrl: publicUrl,
          description,
          date,
          location: location || undefined,
        }),
      })

      if (!dbRes.ok) {
        const dbData = await dbRes.json()
        throw new Error(dbData.error || "Failed to create database entry.")
      }

      // Clear form and reload
      setFile(null)
      setPreviewUrl(null)
      setDescription("")
      setDate("")
      setLocation("")
      setUploadOpen(false)
      fetchMemories()
    } catch (err: any) {
      setUploadError(err.message || "An unexpected error occurred.")
    } finally {
      setUploading(false)
    }
  }

  const filteredMemories = memories.filter((m) =>
    m.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    m.uploaderName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (m.location && m.location.toLowerCase().includes(searchQuery.toLowerCase()))
  )

  const isVerified = session && (session.user.status === "APPROVED" || session.user.role === "ADMIN")

  if (!hasFeature("MEMORIES")) {
    return (
      <>
        <Header />
        <FeatureDisabled feature="Memory Mosaic" />
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
            <h1 className="text-3xl font-bold tracking-tight font-mono">./memories</h1>
            <p className="text-muted-foreground text-sm font-mono mt-1">
              Class memory grid and visual archive
            </p>
          </div>
          <div className="flex w-full sm:w-auto items-center gap-3">
            <div className="relative flex-1 sm:w-60">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search memories..."
                className="w-full pl-9 pr-4 h-9 bg-card border border-border rounded-md text-xs font-mono focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-ring"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            {isVerified ? (
              <Button onClick={() => setUploadOpen(true)} size="sm" className="gap-1 font-mono text-xs h-9">
                <Plus className="h-4 w-4" /> add_memory
              </Button>
            ) : (
              session && (
                <span className="text-xs font-mono text-amber-500 border border-amber-500/20 bg-amber-500/5 px-3 py-1.5 rounded-md">
                  Verification pending to upload
                </span>
              )
            )}
          </div>
        </div>

        {/* Loading Spinner */}
        {loading ? (
          <div className="flex h-60 items-center justify-center">
            <div className="text-center space-y-2">
              <Loader2 className="h-6 w-6 animate-spin mx-auto text-primary" />
              <p className="text-muted-foreground text-xs font-mono">Fetching R2 assets...</p>
            </div>
          </div>
        ) : filteredMemories.length === 0 ? (
          <div className="flex flex-col h-60 items-center justify-center border border-dashed border-border rounded-lg p-6 text-center">
            <ImageIcon className="h-8 w-8 text-muted-foreground mb-2" />
            <p className="text-sm font-mono text-muted-foreground">No memories compiled in registry.</p>
          </div>
        ) : (
          /* Masonry Columns Layout */
          <div className="columns-1 sm:columns-2 md:columns-3 lg:columns-4 gap-6">
            {filteredMemories.map((memory) => (
              <div
                key={memory.id}
                className="break-inside-avoid mb-6 bg-card border border-border rounded-lg overflow-hidden group cursor-pointer hover:border-primary/50 transition-all duration-300 shadow-xs hover:shadow-md"
                onClick={() => setActiveMemory(memory)}
              >
                <div className="relative overflow-hidden aspect-auto bg-muted">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={memory.imageUrl}
                    alt={memory.description}
                    className="w-full object-cover group-hover:scale-[1.03] transition-transform duration-500 max-h-96"
                    loading="lazy"
                  />
                </div>
                <div className="p-4 space-y-2">
                  <p className="text-sm leading-relaxed text-foreground/90 font-mono text-pretty line-clamp-3">
                    {memory.description}
                  </p>
                  <div className="flex justify-between items-center text-3xs font-mono text-muted-foreground border-t border-border/50 pt-2">
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" /> {new Date(memory.date).toLocaleDateString()}
                    </span>
                    <span className="flex items-center gap-1 font-semibold">
                      <User className="h-3 w-3" /> {memory.uploaderName}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* UPLOAD FORM DIALOG */}
      {uploadOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
          <div className="relative w-full max-w-lg rounded-lg border border-border bg-card p-6 shadow-lg space-y-4">
            <button
              onClick={() => {
                setUploadOpen(false)
                setPreviewUrl(null)
                setFile(null)
              }}
              className="absolute right-4 top-4 text-muted-foreground hover:text-foreground"
            >
              <X className="h-5 w-5" />
            </button>
            <div className="border-b border-border pb-3">
              <h3 className="text-lg font-semibold font-mono">Upload to Mosaic</h3>
              <p className="text-xs text-muted-foreground font-mono mt-1">Upload a memory to Cloudflare R2 bucket</p>
            </div>

            {uploadError && (
              <div className="bg-destructive/10 border border-destructive/20 text-destructive rounded-md p-3 text-xs font-mono">
                {uploadError}
              </div>
            )}

            <form onSubmit={handleUploadSubmit} className="space-y-4">
              {/* Image Input Container */}
              <div className="space-y-2">
                <label className="text-xs font-mono text-muted-foreground">Select Memory Snapshot</label>
                {previewUrl ? (
                  <div className="relative aspect-video rounded-md overflow-hidden bg-muted border border-border">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => {
                        setPreviewUrl(null)
                        setFile(null)
                      }}
                      className="absolute right-2 top-2 p-1.5 bg-black/70 rounded-full text-white hover:bg-black/90"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ) : (
                  <div className="border-2 border-dashed border-border rounded-md p-8 text-center hover:border-primary/50 transition-colors cursor-pointer relative bg-background/50">
                    <input
                      type="file"
                      accept="image/*"
                      required
                      onChange={handleFileChange}
                      className="absolute inset-0 opacity-0 cursor-pointer"
                    />
                    <Camera className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                    <span className="text-xs font-mono text-muted-foreground block">
                      Click to choose image file
                    </span>
                  </div>
                )}
              </div>

              {/* Description Input */}
              <div className="space-y-2">
                <label htmlFor="desc" className="text-xs font-mono text-muted-foreground">Memory Description</label>
                <textarea
                  id="desc"
                  required
                  rows={3}
                  className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-ring"
                  placeholder="Describe the moment (e.g., 'Crying in the compiler design lab before submission')"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* Date Input */}
                <div className="space-y-2">
                  <label htmlFor="date" className="text-xs font-mono text-muted-foreground">Capture Date</label>
                  <input
                    id="date"
                    type="date"
                    required
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-ring"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                  />
                </div>

                {/* Location Input */}
                <div className="space-y-2">
                  <label htmlFor="loc" className="text-xs font-mono text-muted-foreground">Location (Optional)</label>
                  <input
                    id="loc"
                    type="text"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-ring"
                    placeholder="e.g. Canteen, Lab 3"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                  />
                </div>
              </div>

              <div className="flex gap-3 justify-end pt-3 border-t border-border">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setUploadOpen(false)}
                  disabled={uploading}
                  className="bg-background border-border"
                >
                  Cancel
                </Button>
                <Button type="submit" size="sm" disabled={uploading}>
                  {uploading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Uploading to R2...
                    </>
                  ) : (
                    "Compile Entry"
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* LIGHTBOX / DETAILS MODAL */}
      {activeMemory && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4 animate-in fade-in duration-200" onClick={() => setActiveMemory(null)}>
          <div 
            className="relative w-full max-w-4xl max-h-[90vh] flex flex-col md:flex-row bg-card rounded-lg overflow-hidden border border-border animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setActiveMemory(null)}
              className="absolute right-3 top-3 z-10 p-1.5 bg-black/70 hover:bg-black/90 rounded-full text-white"
            >
              <X className="h-4 w-4" />
            </button>

            {/* Left/Main Image */}
            <div className="flex-1 bg-black flex items-center justify-center p-2 min-h-60 max-h-[50vh] md:max-h-[85vh]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={activeMemory.imageUrl}
                alt={activeMemory.description}
                className="max-w-full max-h-full object-contain"
              />
            </div>

            {/* Right Details Pane */}
            <div className="w-full md:w-80 bg-card p-6 flex flex-col justify-between border-t md:border-t-0 md:border-l border-border space-y-4">
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-2xs font-mono text-primary uppercase tracking-wider">
                  <span>Entry Node Details</span>
                  <ChevronRight className="h-3 w-3" />
                </div>
                <p className="text-sm leading-relaxed text-foreground font-mono whitespace-pre-wrap">
                  {activeMemory.description}
                </p>
              </div>

              <div className="space-y-3 border-t border-border pt-4 text-xs font-mono text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-primary" />
                  <span>Captured: {new Date(activeMemory.date).toLocaleDateString("en-US", { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                </div>
                {activeMemory.location && (
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-accent" />
                    <span>Location: {activeMemory.location}</span>
                  </div>
                )}
                <div className="flex items-center gap-2 border-t border-border/30 pt-3">
                  <User className="h-4 w-4 text-emerald-500" />
                  <span className="font-semibold text-foreground">Uploaded by: {activeMemory.uploaderName}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      </div>
      <Footer />
    </>
  )
}
