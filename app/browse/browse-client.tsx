"use client"

import React, { useState } from "react"
import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Search, Terminal, Github, Linkedin, ArrowRight, User } from "lucide-react"

interface Student {
  username: string
  name: string
  role: string
  bio: string
  avatarUrl: string
  stats: Record<string, number | string>
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
        
        {/* Title Block */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-border pb-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight font-mono">./browse_profiles</h1>
            <p className="text-muted-foreground text-sm font-mono mt-1">
              Class Registry / Student Directory ({filteredStudents.length} entries)
            </p>
          </div>
          <div className="relative w-full md:w-80">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search by name, role, bio..."
              className="w-full pl-9 pr-4 h-9 bg-card border border-border rounded-md text-xs font-mono focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-ring"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {/* Profiles Grid */}
        {filteredStudents.length === 0 ? (
          <div className="flex flex-col h-60 items-center justify-center border border-dashed border-border rounded-lg p-6 text-center">
            <User className="h-8 w-8 text-muted-foreground mb-2" />
            <p className="text-sm font-mono text-muted-foreground">No students matched search filters.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {filteredStudents.map((student) => {
              // Extract standard stats if available
              const bugsFixed = student.stats?.bugsFixed ?? 0
              const coffeeConsumed = student.stats?.coffeeConsumed ?? 0

              return (
                <Link key={student.username} href={`/profile/${student.username}`}>
                  <Card className="h-full border-border bg-card hover:border-primary/50 hover:shadow-md transition-all duration-300 overflow-hidden flex flex-col justify-between group">
                    <CardContent className="p-6 space-y-4 flex-1 flex flex-col justify-between">
                      <div className="space-y-4">
                        {/* Avatar & Identifiers */}
                        <div className="flex items-center gap-3">
                          <div className="relative h-12 w-12 rounded-full overflow-hidden border border-border bg-muted flex items-center justify-center">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={student.avatarUrl || "https://placehold.co/150"}
                              alt={student.name}
                              className="h-full w-full object-cover"
                            />
                          </div>
                          <div>
                            <h3 className="font-semibold text-sm tracking-tight text-foreground group-hover:text-primary transition-colors">
                              {student.name}
                            </h3>
                            <span className="text-2xs font-mono text-muted-foreground block">
                              @{student.username}
                            </span>
                          </div>
                        </div>

                        {/* Student Role Badge */}
                        <span className="inline-block bg-primary/10 border border-primary/20 text-primary font-mono text-3xs px-2.5 py-0.5 rounded-full">
                          {student.role}
                        </span>

                        {/* Bio Text */}
                        <p className="text-xs text-muted-foreground line-clamp-3 leading-relaxed">
                          {student.bio}
                        </p>
                      </div>

                      {/* Developer Stats Footer */}
                      <div className="border-t border-border/50 pt-3 mt-4 flex items-center justify-between text-3xs font-mono text-muted-foreground">
                        <div className="flex gap-3">
                          <span>🐛 bugs: {bugsFixed}</span>
                          <span>☕ coffee: {coffeeConsumed}</span>
                        </div>
                        <ArrowRight className="h-3.5 w-3.5 text-muted-foreground group-hover:text-primary group-hover:translate-x-0.5 transition-all" />
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
