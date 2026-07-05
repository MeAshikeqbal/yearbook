"use client"

import Link from "next/link"
import { useSession, signOut } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { 
  BookOpen, Menu, X, ShieldAlert, Edit3, LogOut, 
  Image, Bug, Book, UploadCloud, AlertTriangle, Loader2 
} from "lucide-react"
import { ThemeToggle } from "@/components/theme-toggle"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { useFeatures } from "@/components/features-provider"

export function Header() {
  const { data: session, update: updateSession } = useSession()
  const { hasFeature } = useFeatures()
  const router = useRouter()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  // ID Upload inside Banner State
  const [uploadOpen, setUploadOpen] = useState(false)
  const [idFile, setIdFile] = useState<File | null>(null)
  const [idPreview, setIdPreview] = useState<string | null>(null)
  const [idUploading, setIdUploading] = useState(false)
  const [idError, setIdError] = useState("")

  const handleIdFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0]
    if (selected) {
      if (selected.size > 5 * 1024 * 1024) {
        setIdError("File size exceeds 5MB limit.")
        return
      }
      setIdFile(selected)
      setIdPreview(URL.createObjectURL(selected))
    }
  }

  const handleIdUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!idFile) return
    setIdUploading(true)
    setIdError("")

    try {
      // 1. Get presigned R2 upload URL
      const urlRes = await fetch("/api/upload-url", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          filename: idFile.name,
          contentType: idFile.type,
          folder: "id-cards",
        }),
      })

      if (!urlRes.ok) {
        const data = await urlRes.json()
        throw new Error(data.error || "Failed to get upload authorization.")
      }

      const { uploadUrl, publicUrl } = await urlRes.json()

      // 2. Put file to R2
      const uploadRes = await fetch(uploadUrl, {
        method: "PUT",
        headers: { "Content-Type": idFile.type },
        body: idFile,
      })

      if (!uploadRes.ok) {
        throw new Error("Failed to upload image file to Cloudflare storage.")
      }

      // 3. Post to db
      const dbRes = await fetch("/api/auth/upload-id", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idCardUrl: publicUrl }),
      })

      if (!dbRes.ok) {
        const data = await dbRes.json()
        throw new Error(data.error || "Failed to update user profile in database.")
      }

      // Clean up and refresh
      setIdFile(null)
      setIdPreview(null)
      setUploadOpen(false)
      
      // Update NextAuth session client side
      await updateSession()
      router.refresh()
    } catch (err: any) {
      setIdError(err.message || "An unexpected error occurred.")
    } finally {
      setIdUploading(false)
    }
  }

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
          {hasFeature("BROWSE") && (
            <Link
              href="/browse"
              className="text-sm font-mono text-muted-foreground hover:text-foreground transition-colors"
            >
              ./browse
            </Link>
          )}
          {hasFeature("MEMORIES") && (
            <Link
              href="/memories"
              className="text-sm font-mono text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1"
            >
              <Image className="h-3.5 w-3.5" /> ./mosaic
            </Link>
          )}
          {hasFeature("FLIPBOOK") && (
            <Link
              href="/flipbook"
              className="text-sm font-mono text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1"
            >
              <Book className="h-3.5 w-3.5" /> ./flipbook
            </Link>
          )}
          {hasFeature("BUGS") && (
            <Link
              href="/bugs"
              className="text-sm font-mono text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1"
            >
              <Bug className="h-3.5 w-3.5" /> ./bugs
            </Link>
          )}

          {(session?.user.role === "ADMIN" || session?.user.role === "MODERATOR") && (
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
            {hasFeature("BROWSE") && (
              <Link
                href="/browse"
                className="text-sm font-mono text-muted-foreground hover:text-foreground transition-colors py-2"
                onClick={() => setMobileMenuOpen(false)}
              >
                ./browse
              </Link>
            )}
            {hasFeature("MEMORIES") && (
              <Link
                href="/memories"
                className="text-sm font-mono text-muted-foreground hover:text-foreground transition-colors py-2 flex items-center gap-2"
                onClick={() => setMobileMenuOpen(false)}
              >
                <Image className="h-4 w-4" /> ./mosaic
              </Link>
            )}
            {hasFeature("FLIPBOOK") && (
              <Link
                href="/flipbook"
                className="text-sm font-mono text-muted-foreground hover:text-foreground transition-colors py-2 flex items-center gap-2"
                onClick={() => setMobileMenuOpen(false)}
              >
                <Book className="h-4 w-4" /> ./flipbook
              </Link>
            )}
            {hasFeature("BUGS") && (
              <Link
                href="/bugs"
                className="text-sm font-mono text-muted-foreground hover:text-foreground transition-colors py-2 flex items-center gap-2"
                onClick={() => setMobileMenuOpen(false)}
              >
                <Bug className="h-4 w-4" /> ./bugs
              </Link>
            )}

            {(session?.user.role === "ADMIN" || session?.user.role === "MODERATOR") && (
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

      {/* Dynamic Verification Banners */}
      {session && session.user.role !== "ADMIN" && session.user.role !== "MODERATOR" && session.user.status !== "APPROVED" && (
        <div className={`w-full py-2 px-4 text-center text-xs font-mono border-t flex flex-wrap items-center justify-center gap-2 ${
          session.user.status === "REJECTED" 
            ? "bg-destructive/10 border-destructive/20 text-destructive"
            : "bg-amber-500/10 border-amber-500/20 text-amber-500 animate-pulse"
        }`}>
          {session.user.status === "REJECTED" ? (
            <span className="flex items-center gap-1"><AlertTriangle className="h-3.5 w-3.5" /> [ACCESS_LOCKED]: Profile verification rejected. Contact administration for assistance.</span>
          ) : session.user.idCardUrl ? (
            <span>[PENDING_VERIFICATION]: Student ID submitted. A moderator will review your account shortly.</span>
          ) : (
            <div className="flex items-center gap-2">
              <span>[ACTION_REQUIRED]: Upload your Student ID card photo to request profile activation.</span>
              <Button 
                onClick={() => setUploadOpen(true)}
                variant="outline" 
                className="h-6 px-2 text-[10px] border-amber-500/30 text-amber-500 hover:bg-amber-500/10 bg-transparent font-mono transition-all duration-150"
              >
                Upload ID Card
              </Button>
            </div>
          )}
        </div>
      )}

      {/* ID UPLOAD DIALOG FOR BANNER */}
      {uploadOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="relative w-full max-w-md rounded-lg border border-border bg-card p-6 shadow-lg space-y-4">
            <button
              onClick={() => {
                setUploadOpen(false)
                setIdPreview(null)
                setIdFile(null)
                setIdError("")
              }}
              className="absolute right-4 top-4 text-muted-foreground hover:text-foreground"
            >
              <X className="h-5 w-5" />
            </button>
            <div className="border-b border-border pb-3">
              <h3 className="text-lg font-semibold font-mono">Verify Student Identity</h3>
              <p className="text-xs text-muted-foreground font-mono mt-1">
                Upload your Student ID Card photo to request verification.
              </p>
            </div>

            {idError && (
              <div className="bg-destructive/10 border border-destructive/20 text-destructive rounded-md p-3 text-xs font-mono text-center">
                [error]: {idError}
              </div>
            )}

            <form onSubmit={handleIdUploadSubmit} className="space-y-4">
              <div className="border border-dashed border-border rounded-md p-6 bg-background/50 hover:bg-muted/50 transition-colors flex flex-col items-center justify-center text-center cursor-pointer relative min-h-32">
                {idPreview ? (
                  <div className="relative w-full max-h-40 overflow-hidden rounded border border-border">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={idPreview} alt="ID preview" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => {
                        setIdFile(null)
                        setIdPreview(null)
                      }}
                      className="absolute top-2 right-2 bg-black/75 hover:bg-black/90 text-white rounded-full p-1 border border-border/30"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ) : (
                  <>
                    <input
                      type="file"
                      accept="image/*"
                      required
                      onChange={handleIdFileChange}
                      className="absolute inset-0 opacity-0 cursor-pointer"
                      disabled={idUploading}
                    />
                    <UploadCloud className="h-8 w-8 text-muted-foreground/60 mb-2 animate-pulse" />
                    <span className="text-xs font-mono text-muted-foreground">Select Student ID photo</span>
                    <span className="text-3xs text-muted-foreground/50 font-mono mt-1">JPEG, PNG up to 5MB</span>
                  </>
                )}
              </div>

              <div className="flex gap-2 justify-end pt-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="font-mono text-xs"
                  onClick={() => {
                    setUploadOpen(false)
                    setIdPreview(null)
                    setIdFile(null)
                    setIdError("")
                  }}
                  disabled={idUploading}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  size="sm"
                  className="font-mono text-xs"
                  disabled={!idFile || idUploading}
                >
                  {idUploading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Uploading...
                    </>
                  ) : (
                    "Submit Verification"
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </header>
  )
}