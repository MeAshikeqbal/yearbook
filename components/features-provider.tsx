"use client"

import React, { createContext, useContext, useEffect, useState, useCallback } from "react"

interface FeaturesContextType {
  flags: Record<string, boolean>
  loading: boolean
  hasFeature: (key: string) => boolean
  refreshFeatures: () => Promise<void>
}

const FeaturesContext = createContext<FeaturesContextType | null>(null)

export function FeaturesProvider({ children }: { children: React.ReactNode }) {
  const [flags, setFlags] = useState<Record<string, boolean>>({})
  const [loading, setLoading] = useState(true)

  const refreshFeatures = useCallback(async () => {
    try {
      const res = await fetch("/api/features")
      if (res.ok) {
        const data = await res.json()
        setFlags(data.flags || {})
      }
    } catch (error) {
      console.error("Failed to load feature flags client-side:", error)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    refreshFeatures()
  }, [refreshFeatures])

  const hasFeature = useCallback(
    (key: string) => {
      // Default to true if loading or key is not configured, to fail-open
      // rather than breaking the UI, but check flag state if present
      if (loading) return true
      return flags[key] !== false
    },
    [flags, loading]
  )

  return (
    <FeaturesContext.Provider value={{ flags, loading, hasFeature, refreshFeatures }}>
      {children}
    </FeaturesContext.Provider>
  )
}

export function useFeatures() {
  const context = useContext(FeaturesContext)
  if (!context) {
    throw new Error("useFeatures must be used within a FeaturesProvider")
  }
  return context
}
