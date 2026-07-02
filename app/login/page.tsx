"use client"

import React, { useState, useEffect } from "react"
import { signIn, useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Github, KeyRound, Mail, Loader2, Eye, EyeOff } from "lucide-react"

export default function LoginPage() {
  const { data: session, status: sessionStatus } = useSession()
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const [githubLoading, setGithubLoading] = useState(false)

  // Redirect if session is already active
  useEffect(() => {
    if (sessionStatus === "authenticated") {
      router.push("/")
    }
  }, [sessionStatus, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      const res = await signIn("credentials", {
        redirect: false,
        email,
        password,
      })

      if (res?.error) {
        setError("Invalid email or password")
      } else {
        router.push("/")
        router.refresh()
      }
    } catch (err) {
      setError("An unexpected error occurred")
    } finally {
      setLoading(false)
    }
  }

  const handleGithubLogin = async () => {
    setError("")
    setGithubLoading(true)
    try {
      await signIn("github", { callbackUrl: "/" })
    } catch (err) {
      setError("Could not authenticate with GitHub")
      setGithubLoading(false)
    }
  }

  if (sessionStatus === "loading") {
    return (
      <div className="flex h-svh items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="flex min-h-svh items-center justify-center bg-background px-4 py-12 md:py-24 relative overflow-hidden">
      {/* Background abstract radial glows for a premium look */}
      <div className="absolute top-1/4 left-1/4 -z-10 h-72 w-72 rounded-full bg-primary/10 blur-3xl" />
      <div className="absolute bottom-1/4 right-1/4 -z-10 h-72 w-72 rounded-full bg-primary/5 blur-3xl" />

      <Card className="w-full max-w-md border-border bg-card/85 backdrop-blur-md shadow-xl hover:shadow-2xl transition-all duration-300">
        <CardHeader className="space-y-1 text-center">
          <CardTitle className="text-2xl font-bold tracking-tight font-mono">./login</CardTitle>
          <CardDescription className="text-muted-foreground text-sm font-mono">
            Sign in to your digital yearbook credentials
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
                disabled={loading || githubLoading}
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
                  disabled={loading || githubLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-2.5 text-muted-foreground hover:text-foreground transition-colors"
                  disabled={loading || githubLoading}
                >
                  {showPassword ? <EyeOff className="h-4.5 w-4.5" /> : <Eye className="h-4.5 w-4.5" />}
                </button>
              </div>
            </div>

            <Button type="submit" className="w-full h-10 font-mono text-xs" disabled={loading || githubLoading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> executing_auth...
                </>
              ) : (
                "./sign_in"
              )}
            </Button>
          </form>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center text-3xs uppercase font-mono">
              <span className="bg-card px-2 text-muted-foreground">or connect via</span>
            </div>
          </div>

          <Button
            variant="outline"
            className="w-full h-10 bg-background/50 border-border hover:bg-muted font-mono text-xs"
            onClick={handleGithubLogin}
            disabled={loading || githubLoading}
          >
            {githubLoading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Github className="mr-2 h-4 w-4" />
            )}
            OAuth GitHub
          </Button>
        </CardContent>
        <CardFooter className="flex flex-wrap items-center justify-center gap-1 border-t border-border p-6 text-xs text-muted-foreground font-mono">
          unregistered?{" "}
          <Link href="/register" className="text-primary hover:underline font-semibold">
            ./register_account
          </Link>
        </CardFooter>
      </Card>
    </div>
  )
}
