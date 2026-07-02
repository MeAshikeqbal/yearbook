"use client"

import React, { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { User, Mail, KeyRound, ArrowRight, Loader2, Sparkles, Eye, EyeOff, X } from "lucide-react"

export default function RegisterPage() {
  const { data: session, status: sessionStatus } = useSession()
  const router = useRouter()
  const [name, setName] = useState("")
  const [username, setUsername] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [role, setRole] = useState("CSE Student")
  const [idCardFile, setIdCardFile] = useState<File | null>(null)
  const [idCardPreview, setIdCardPreview] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)

  const [passwordStrength, setPasswordStrength] = useState({
    score: 0,
    feedback: "",
  })

  // Redirect if already authenticated
  useEffect(() => {
    if (sessionStatus === "authenticated") {
      router.push("/")
    }
  }, [sessionStatus, router])

  // Password strength check
  useEffect(() => {
    if (!password) {
      setPasswordStrength({ score: 0, feedback: "" })
      return
    }

    let score = 0
    let feedback = []

    if (password.length >= 8) score += 1
    else feedback.push("Min 8 characters")

    if (/[A-Z]/.test(password)) score += 1
    else feedback.push("Uppercase letter")

    if (/[0-9]/.test(password)) score += 1
    else feedback.push("Number")

    if (/[^A-Za-z0-9]/.test(password)) score += 1
    else feedback.push("Special character")

    let feedbackStr = ""
    if (score === 4) feedbackStr = "Strong password"
    else if (score >= 2) feedbackStr = `Moderate (Missing: ${feedback.join(", ")})`
    else feedbackStr = `Weak (Missing: ${feedback.join(", ")})`

    setPasswordStrength({ score, feedback: feedbackStr })
  }, [password])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile) {
      if (selectedFile.size > 5 * 1024 * 1024) {
        setError("File size exceeds 5MB limit.")
        return
      }
      setIdCardFile(selectedFile)
      setIdCardPreview(URL.createObjectURL(selectedFile))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    // Validate username (letters, numbers, underscores, hyphens only)
    const usernameRegex = /^[a-zA-Z0-9_-]+$/
    if (!usernameRegex.test(username)) {
      setError("Username can only contain letters, numbers, underscores (_), and hyphens (-)")
      setLoading(false)
      return
    }

    if (!idCardFile) {
      setError("A Student ID photo is required for registration verification.")
      setLoading(false)
      return
    }

    try {
      // 1. Get presigned R2 upload URL for the id-cards folder
      const urlRes = await fetch("/api/upload-url", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          filename: idCardFile.name,
          contentType: idCardFile.type,
          folder: "id-cards",
        }),
      })

      if (!urlRes.ok) {
        const urlData = await urlRes.json()
        throw new Error(urlData.error || "Failed to authorize Student ID photo upload.")
      }

      const { uploadUrl, publicUrl } = await urlRes.json()

      // 2. Upload Student ID directly to Cloudflare R2
      const uploadRes = await fetch(uploadUrl, {
        method: "PUT",
        headers: { "Content-Type": idCardFile.type },
        body: idCardFile,
      })

      if (!uploadRes.ok) {
        throw new Error("Failed to upload Student ID image to secure storage.")
      }

      // 3. Create the student user record
      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          username,
          email,
          password,
          role,
          idCardUrl: publicUrl,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || "Failed to register")
      } else {
        setSuccess(true)
      }
    } catch (err: any) {
      setError(err.message || "An error occurred during registration")
    } finally {
      setLoading(false)
    }
  }

  if (sessionStatus === "loading") {
    return (
      <div className="flex h-svh items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (success) {
    return (
      <div className="flex min-h-svh items-center justify-center bg-background px-4 py-12">
        <Card className="w-full max-w-md border-border bg-card text-center shadow-lg">
          <CardHeader>
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
              <Sparkles className="h-6 w-6 animate-pulse" />
            </div>
            <CardTitle className="text-2xl font-bold font-mono">./registered</CardTitle>
            <CardDescription className="text-muted-foreground mt-2 font-mono text-xs">
              Registration submitted successfully.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground leading-relaxed font-mono text-left bg-muted/40 p-4 border border-border rounded-lg">
              Your profile is currently <span className="font-semibold text-amber-500 font-bold">Pending Admin/Mod Approval</span>. 
              Once our moderators verify your uploaded Student ID photo, your profile will be approved, allowing you to customize your space and share memories.
            </p>
          </CardContent>
          <CardFooter className="flex justify-center border-t border-border p-6">
            <Button asChild className="w-full font-mono text-xs">
              <Link href="/login" className="flex items-center justify-center gap-2">
                ./go_to_login <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </CardFooter>
        </Card>
      </div>
    )
  }

  return (
    <div className="flex min-h-svh items-center justify-center bg-background px-4 py-12 md:py-24 relative overflow-hidden">
      {/* Background glow effects */}
      <div className="absolute top-1/4 left-1/4 -z-10 h-72 w-72 rounded-full bg-primary/10 blur-3xl" />
      <div className="absolute bottom-1/4 right-1/4 -z-10 h-72 w-72 rounded-full bg-primary/5 blur-3xl" />

      <Card className="w-full max-w-md border-border bg-card/85 backdrop-blur-md shadow-xl hover:shadow-2xl transition-all duration-300">
        <CardHeader className="space-y-1 text-center">
          <CardTitle className="text-2xl font-bold tracking-tight font-mono">./register</CardTitle>
          <CardDescription className="text-muted-foreground text-sm font-mono">
            Join the CSE class of 2026 digital yearbook
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && (
            <div className="bg-destructive/10 border border-destructive/20 text-destructive rounded-md p-3 text-sm text-center font-mono animate-shake">
              [error]: {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="name" className="text-xs font-mono text-muted-foreground flex items-center gap-2">
                <User className="h-3.5 w-3.5" /> full_name
              </label>
              <input
                id="name"
                type="text"
                required
                className="flex h-10 w-full rounded-md border border-input bg-background/50 px-3 py-2 text-sm font-mono placeholder:text-muted-foreground/50 focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-ring focus-visible:border-primary disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-150"
                placeholder="Ashik Iqbal"
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={loading}
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="username" className="text-xs font-mono text-muted-foreground flex items-center gap-2">
                <span className="text-xs font-mono">@</span> username_slug
              </label>
              <input
                id="username"
                type="text"
                required
                className="flex h-10 w-full rounded-md border border-input bg-background/50 px-3 py-2 text-sm font-mono placeholder:text-muted-foreground/50 focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-ring focus-visible:border-primary disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-150"
                placeholder="ashik (letters, numbers, - or _)"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                disabled={loading}
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="email" className="text-xs font-mono text-muted-foreground flex items-center gap-2">
                <Mail className="h-3.5 w-3.5" /> email_address
              </label>
              <input
                id="email"
                type="email"
                required
                className="flex h-10 w-full rounded-md border border-input bg-background/50 px-3 py-2 text-sm font-mono placeholder:text-muted-foreground/50 focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-ring focus-visible:border-primary disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-150"
                placeholder="student@college.edu"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="role" className="text-xs font-mono text-muted-foreground flex items-center gap-2">
                🎓 role_or_title
              </label>
              <input
                id="role"
                type="text"
                required
                className="flex h-10 w-full rounded-md border border-input bg-background/50 px-3 py-2 text-sm font-mono placeholder:text-muted-foreground/50 focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-ring focus-visible:border-primary disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-150"
                placeholder="e.g. Frontend Dev, AI Enthusiast"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                disabled={loading}
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="password" className="text-xs font-mono text-muted-foreground flex items-center gap-2">
                <KeyRound className="h-3.5 w-3.5" /> password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  required
                  className="flex h-10 w-full rounded-md border border-input bg-background/50 pl-3 pr-10 py-2 text-sm font-mono placeholder:text-muted-foreground/50 focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-ring focus-visible:border-primary disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-150"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-2.5 text-muted-foreground hover:text-foreground transition-colors"
                  disabled={loading}
                >
                  {showPassword ? <EyeOff className="h-4.5 w-4.5" /> : <Eye className="h-4.5 w-4.5" />}
                </button>
              </div>
              {password && (
                <div className="space-y-1.5 pt-1">
                  <div className="flex h-1 gap-1">
                    {[1, 2, 3, 4].map((index) => (
                      <div
                        key={index}
                        className={`h-full flex-1 rounded-full transition-colors duration-300 ${
                          index <= passwordStrength.score
                            ? passwordStrength.score === 4
                              ? "bg-emerald-500"
                              : passwordStrength.score >= 2
                              ? "bg-amber-500"
                              : "bg-destructive"
                            : "bg-border"
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-[10px] font-mono text-muted-foreground block">
                    {passwordStrength.feedback}
                  </span>
                </div>
              )}
            </div>

            {/* Student ID Upload */}
            <div className="space-y-2">
              <label className="text-xs font-mono text-muted-foreground flex items-center gap-2">
                🪪 student_id_photo <span className="text-destructive font-bold">*</span>
              </label>
              <div className="border border-dashed border-border rounded-md p-4 bg-background/50 hover:bg-muted/50 transition-all duration-200 flex flex-col items-center justify-center text-center cursor-pointer relative min-h-24 shadow-inner hover:border-primary/50">
                {idCardPreview ? (
                  <div className="relative w-full max-h-36 overflow-hidden rounded border border-border">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={idCardPreview} alt="Student ID preview" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => {
                        setIdCardFile(null)
                        setIdCardPreview(null)
                      }}
                      className="absolute top-2 right-2 bg-black/75 hover:bg-black/90 text-white rounded-full p-1 border border-border/40 transition-colors"
                    >
                      <X className="h-4.5 w-4.5" />
                    </button>
                  </div>
                ) : (
                  <>
                    <input
                      type="file"
                      accept="image/*"
                      required
                      onChange={handleFileChange}
                      className="absolute inset-0 opacity-0 cursor-pointer"
                      disabled={loading}
                    />
                    <User className="h-6 w-6 text-muted-foreground/60 mb-1 animate-pulse" />
                    <span className="text-xs font-mono text-muted-foreground">Click to upload ID photo</span>
                    <span className="text-3xs text-muted-foreground/50 font-mono mt-0.5">JPEG, PNG up to 5MB</span>
                  </>
                )}
              </div>
            </div>

            <Button type="submit" className="w-full h-10 font-mono text-xs" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> processing_registration...
                </>
              ) : (
                "./submit_registration"
              )}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex flex-wrap items-center justify-center gap-1 border-t border-border p-6 text-xs text-muted-foreground font-mono">
          already registered?{" "}
          <Link href="/login" className="text-primary hover:underline font-semibold">
            ./sign_in
          </Link>
        </CardFooter>
      </Card>
    </div>
  )
}
