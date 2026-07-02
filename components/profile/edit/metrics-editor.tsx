"use client"

import React, { useState } from "react"
import { Button } from "@/components/ui/button"
import { Cpu, Plus, Trash2, Hash, Layers } from "lucide-react"

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
    <div className="space-y-6 animate-in fade-in-50 duration-300">
      <div>
        <h3 className="text-base font-bold text-foreground font-mono">./diagnostic_metrics</h3>
        <p className="text-xs text-muted-foreground font-mono mt-0.5">
          Define custom numeric or text-based stats to track compile-time diagnostics.
        </p>
      </div>

      {/* Active metrics grid list */}
      <div className="space-y-2.5">
        <span className="text-xs font-mono font-semibold text-muted-foreground flex items-center gap-1.5">
          <Layers className="h-3.5 w-3.5 text-primary" /> Active Metrics Grid
        </span>
        
        {stats.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-8 border border-dashed border-white/5 rounded-xl bg-black/10 text-center font-mono">
            <Cpu className="h-8 w-8 text-neutral-600 animate-pulse mb-2" />
            <p className="text-3xs text-muted-foreground max-w-xs leading-relaxed">
              No custom metrics compiled. Add metrics like `bugsFixed` or `coffeeConsumed` to populate your telemetry cards.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {stats.map((s) => (
              <div 
                key={s.key} 
                className="group relative flex justify-between items-center bg-neutral-900/30 hover:bg-neutral-900/60 border border-white/5 rounded-xl p-3 font-mono text-xs transition-all duration-200"
              >
                {/* Glow border on hover */}
                <div className="absolute left-0 top-0 bottom-0 w-[3px] bg-primary/40 rounded-l-xl opacity-0 group-hover:opacity-100 transition-opacity" />
                
                <div className="truncate pr-2 pl-1.5">
                  <span className="text-neutral-500 text-3xs block uppercase tracking-wider font-bold">{s.key}</span>
                  <span className="font-bold text-foreground text-sm tracking-tight">{s.val}</span>
                </div>
                
                <button
                  type="button"
                  onClick={() => handleRemoveStat(s.key)}
                  className="text-neutral-500 hover:text-red-400 p-1.5 rounded-lg hover:bg-white/5 transition-all duration-200"
                  title="Remove Metric"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add new metric elements */}
      <div className="border-t border-white/5 pt-5 space-y-4">
        <span className="text-xs font-mono font-bold text-white block">Add Telemetry Node</span>
        
        <div className="flex flex-col md:flex-row gap-3 items-end">
          <div className="flex-1 w-full space-y-1.5">
            <label className="text-3xs font-mono text-muted-foreground uppercase font-bold flex items-center gap-1">
              <Hash className="h-3 w-3" /> Metric Key
            </label>
            <input
              type="text"
              className="flex h-9 w-full rounded-lg border border-white/10 bg-black/20 hover:bg-black/35 px-3 py-1.5 text-xs text-foreground placeholder:text-neutral-600 focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-primary focus-visible:border-primary transition-all font-mono"
              placeholder="e.g. linesOfCode"
              value={newStatKey}
              onChange={(e) => setNewStatKey(e.target.value)}
            />
          </div>
          
          <div className="flex-1 w-full space-y-1.5">
            <label className="text-3xs font-mono text-muted-foreground uppercase font-bold flex items-center gap-1">
              <Cpu className="h-3 w-3" /> Metric Value
            </label>
            <input
              type="text"
              className="flex h-9 w-full rounded-lg border border-white/10 bg-black/20 hover:bg-black/35 px-3 py-1.5 text-xs text-foreground placeholder:text-neutral-600 focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-primary focus-visible:border-primary transition-all font-mono"
              placeholder="e.g. 10000 or v1.0.0"
              value={newStatVal}
              onChange={(e) => setNewStatVal(e.target.value)}
            />
          </div>
          
          <Button
            type="button"
            className="h-9 w-full md:w-auto px-4 gap-1.5 font-mono text-xs bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg transition-all shadow-md shrink-0 cursor-pointer"
            onClick={handleAddStat}
          >
            <Plus className="h-4 w-4" /> Add Metric
          </Button>
        </div>
      </div>
    </div>
  )
}
