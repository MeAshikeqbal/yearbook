"use client"

import React from "react"
import Link from "next/link"
import ProfileCard from "@/components/ui/ProfileCard"

interface Student {
  username: string
  name: string
  role: string
  bio: string
  avatarUrl: string
  stats: Record<string, number | string>
  customCss?: string | null
}

interface StudentCardProps {
  student: Student
}

export function StudentCard({ student }: StudentCardProps) {
  const bugsFixed = student.stats?.bugsFixed ?? 0
  const coffeeConsumed = student.stats?.coffeeConsumed ?? 0

  // Scope user's custom CSS to avoid global style pollution
  const scopedCss = student.customCss
    ? student.customCss
        .replaceAll(".profile-card", `.student-card-${student.username}`)
        .replaceAll(".student-profile-wrapper", `.student-card-${student.username}`)
    : ""

  return (
    <Link href={`/profile/${student.username}`} className="block w-full group relative">
      {scopedCss && (
        <style dangerouslySetInnerHTML={{ __html: scopedCss }} />
      )}
      <ProfileCard
        name={student.name}
        title={student.role}
        handle={student.username}
        status={`🐛 ${bugsFixed} / ☕ ${coffeeConsumed}`}
        contactText="View Profile"
        avatarUrl={student.avatarUrl || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=400&h=400&fit=crop"}
        showUserInfo={true}
        enableTilt={true}
        behindGlowEnabled={true}
        behindGlowColor="rgba(124, 58, 237, 0.25)"
        behindGlowSize="50%"
        className={`cursor-pointer transition-transform duration-300 student-card-${student.username}`}
      />
    </Link>
  )
}
