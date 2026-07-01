"use client"

import React from "react"
import { Eye } from "lucide-react"
import ProfileCard from "@/components/ui/ProfileCard"

interface StatItem {
  key: string
  val: string | number
}

interface LiveSandboxProps {
  username: string
  name: string
  role: string
  bio: string
  avatarUrl: string
  stats: StatItem[]
}

export function LiveSandbox({
  username,
  name,
  role,
  bio,
  avatarUrl,
  stats,
}: LiveSandboxProps) {
  const bugsFixed = stats.find((s) => s.key.toLowerCase().includes("bug"))?.val ?? 0
  const coffeeConsumed = stats.find((s) => s.key.toLowerCase().includes("coffee") || s.key.toLowerCase().includes("chai"))?.val ?? 0

  return (
    <div className="space-y-6 lg:sticky lg:top-20">
      
      {/* Title */}
      <div className="flex items-center gap-2 border-b border-border pb-3">
        <Eye className="h-4 w-4 text-primary" />
        <h3 className="font-mono text-xs font-semibold text-foreground">Live Sandbox Compilation</h3>
      </div>

      {/* Simulated profile view rendering the card */}
      <div className="preview-card-wrapper p-6 border border-border bg-background rounded-xl flex flex-col items-center justify-center space-y-6">
        
        {/* Profile Card Mock */}
        <div className="profile-card w-full max-w-sm">
          <ProfileCard
            name={name || "Your Name"}
            title={role || "CSE Student"}
            handle={username}
            status={`🐛 ${bugsFixed} / ☕ ${coffeeConsumed}`}
            contactText="Contact"
            avatarUrl={avatarUrl || "https://placehold.co/150"}
            showUserInfo={true}
            enableTilt={true}
            enableMobileTilt={false}
            behindGlowEnabled={true}
            behindGlowColor="rgba(var(--primary-rgb, 125, 190, 255), 0.35)"
            behindGlowSize="45%"
            innerGradient="linear-gradient(145deg, rgba(30,30,46,0.85) 0%, rgba(20,20,30,0.95) 100%)"
          />
        </div>
      </div>
    </div>
  )
}
