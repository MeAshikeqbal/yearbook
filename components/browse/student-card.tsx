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
}

interface StudentCardProps {
  student: Student
}

export function StudentCard({ student }: StudentCardProps) {
  const bugsFixed = student.stats?.bugsFixed ?? 0
  const coffeeConsumed = student.stats?.coffeeConsumed ?? 0

  return (
    <Link href={`/profile/${student.username}`} className="block w-full">
      <ProfileCard
        name={student.name}
        title={student.role}
        handle={student.username}
        status={`🐛 ${bugsFixed} / ☕ ${coffeeConsumed}`}
        contactText="Profile"
        avatarUrl={student.avatarUrl || "https://placehold.co/150"}
        showUserInfo={true}
        enableTilt={true}
        enableMobileTilt={false}
        behindGlowEnabled={true}
        behindGlowColor="rgba(var(--primary-rgb, 125, 190, 255), 0.35)"
        behindGlowSize="45%"
        innerGradient="linear-gradient(145deg, rgba(30,30,46,0.85) 0%, rgba(20,20,30,0.95) 100%)"
        className="cursor-pointer"
      />
    </Link>
  )
}
