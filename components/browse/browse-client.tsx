"use client"

import React, { useState } from "react"
import { BrowseHeader } from "./browse-header"
import { StudentCard } from "./student-card"
import { User } from "lucide-react"

interface Student {
  username: string
  name: string
  role: string
  bio: string
  avatarUrl: string
  stats: Record<string, number | string>
  customCss?: string | null
}

interface BrowseClientProps {
  initialStudents: Student[]
}

export default function BrowseClient({ initialStudents }: BrowseClientProps) {
  const [searchQuery, setSearchQuery] = useState("")

  const filteredStudents = initialStudents.filter(
    (student) =>
      student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      student.role.toLowerCase().includes(searchQuery.toLowerCase()) ||
      student.bio.toLowerCase().includes(searchQuery.toLowerCase()) ||
      student.username.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="min-h-svh bg-background text-foreground py-8 md:py-16">
      <div className="container mx-auto max-w-7xl px-4 md:px-6 space-y-8">
        
        {/* Modular Browse Header */}
        <BrowseHeader
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          totalCount={filteredStudents.length}
        />

        {/* Profiles Grid */}
        {filteredStudents.length === 0 ? (
          <div className="flex flex-col h-60 items-center justify-center border border-dashed border-border rounded-lg p-6 text-center">
            <User className="h-8 w-8 text-muted-foreground mb-2" />
            <p className="text-sm font-mono text-muted-foreground">No students matched search filters.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {filteredStudents.map((student) => (
              <StudentCard key={student.username} student={student} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
