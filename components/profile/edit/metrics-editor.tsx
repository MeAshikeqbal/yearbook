"use client"

import React, { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Cpu, Plus, Trash2 } from "lucide-react"

interface StatItem {
  key: string
  val: string | number
}

interface MetricsEditorProps {
  stats: StatItem[]
  setStats: React.Dispatch<React.SetStateAction<StatItem[]>>
  setError: (v: string) => void
}

export function MetricsEditor({ stats, setStats, setError }: MetricsEditorProps) {
  const [newStatKey, setNewStatKey] = useState("")
  const [newStatVal, setNewStatVal] = useState("")

  const handleAddStat = () => {
    if (!newStatKey || !newStatVal) return

    const cleanKey = newStatKey.trim()
    if (stats.some((s) => s.key.toLowerCase() === cleanKey.toLowerCase())) {
      setError("Metric key already exists.")
      return
    }

    setStats([...stats, { key: cleanKey, val: newStatVal.trim() }])
    setNewStatKey("")
    setNewStatVal("")
    setError("")
  }

  const handleRemoveStat = (keyToRemove: string) => {
    setStats(stats.filter((s) => s.key !== keyToRemove))
  }

  return (
    <Card className="border-border bg-card">
      <CardHeader className="border-b border-border/50 py-3 px-6">
        <CardTitle className="text-sm font-bold font-mono flex items-center gap-2">
          <Cpu className="h-4 w-4 text-accent" /> diagnostic_metrics
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6 space-y-4">
        
        {/* Active metrics grid list */}
        <div className="space-y-2">
          <span className="text-xs font-mono text-muted-foreground block">Active Metrics Grid</span>
          {stats.length === 0 ? (
            <p className="text-3xs font-mono text-muted-foreground py-2 text-center border border-dashed border-border rounded-md">
              No custom metrics compiled. Add some metrics below!
            </p>
          ) : (
            <div className="grid grid-cols-2 gap-2">
              {stats.map((s) => (
                <div key={s.key} className="flex justify-between items-center bg-background border border-border p-2 rounded-md font-mono text-xs">
                  <div className="truncate pr-1">
                    <span className="text-muted-foreground text-3xs block uppercase tracking-wider">{s.key}</span>
                    <span className="font-semibold text-foreground">{s.val}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemoveStat(s.key)}
                    className="text-muted-foreground hover:text-destructive p-1 transition-colors"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Add new metric elements */}
        <div className="border-t border-border/50 pt-4 flex gap-2 items-end">
          <div className="flex-1 space-y-1">
            <label className="text-3xs font-mono text-muted-foreground">Metric Name</label>
            <input
              type="text"
              className="flex h-8 w-full rounded-md border border-input bg-background px-2.5 py-1 text-xs focus-visible:outline-hidden focus-visible:ring-1"
              placeholder="e.g. coffeeConsumed, bugsFixed"
              value={newStatKey}
              onChange={(e) => setNewStatKey(e.target.value)}
            />
          </div>
          <div className="flex-1 space-y-1">
            <label className="text-3xs font-mono text-muted-foreground">Metric Value</label>
            <input
              type="text"
              className="flex h-8 w-full rounded-md border border-input bg-background px-2.5 py-1 text-xs focus-visible:outline-hidden focus-visible:ring-1"
              placeholder="e.g. 404, VS Code, C++"
              value={newStatVal}
              onChange={(e) => setNewStatVal(e.target.value)}
            />
          </div>
          <Button
            type="button"
            size="sm"
            className="h-8 gap-1 font-mono text-3xs bg-primary text-primary-foreground"
            onClick={handleAddStat}
          >
            <Plus className="h-3.5 w-3.5" /> Add
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
