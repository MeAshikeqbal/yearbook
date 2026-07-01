"use client"

import React from "react"
import { Search } from "lucide-react"

interface BrowseHeaderProps {
  searchQuery: string
  setSearchQuery: (v: string) => void
  totalCount: number
}

export function BrowseHeader({
  searchQuery,
  setSearchQuery,
  totalCount,
}: BrowseHeaderProps) {
  return (
    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-border pb-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight font-mono">./browse_profiles</h1>
        <p className="text-muted-foreground text-sm font-mono mt-1">
          Class Registry / Student Directory ({totalCount} entries)
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
  )
}
