"use client"

import * as React from "react"
import { Monitor, Sun, Moon, Sparkles, Terminal, Laptop } from "lucide-react"
import { useTheme } from "@/lib/theme-provider"
import { Button } from "@/components/ui/button"

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = React.useState(false)
  const [isOpen, setIsOpen] = React.useState(false)
  const dropdownRef = React.useRef<HTMLDivElement>(null)

  React.useEffect(() => {
    setMounted(true)
    
    // Close dropdown on click outside
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  if (!mounted) {
    return (
      <Button variant="ghost" size="icon" className="h-9 w-9">
        <Terminal className="h-5 w-5 animate-pulse" />
      </Button>
    )
  }

  const themes = [
    { id: "light-code", name: "Light Code", icon: Sun, color: "text-blue-500" },
    { id: "dark-commit", name: "Dark Commit", icon: Terminal, color: "text-emerald-500" },
    { id: "dracula", name: "Dracula", icon: Sparkles, color: "text-pink-500" },
    { id: "matrix-hacker", name: "Matrix Hacker", icon: Laptop, color: "text-green-500" },
  ]

  const currentThemeObj = themes.find((t) => t.id === theme) || themes[1]
  const CurrentIcon = currentThemeObj.icon

  return (
    <div className="relative" ref={dropdownRef}>
      <Button
        variant="ghost"
        size="sm"
        className="h-9 px-3 flex items-center gap-2 border border-border bg-card hover:bg-muted text-foreground transition-all duration-200"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Select theme"
      >
        <CurrentIcon className={`h-4 w-4 ${currentThemeObj.color}`} />
        <span className="hidden md:inline text-xs font-mono">{currentThemeObj.name}</span>
      </Button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-44 rounded-md border border-border bg-popover text-popover-foreground shadow-lg z-50 animate-in fade-in slide-in-from-top-1 duration-150">
          <div className="p-1 space-y-1">
            <div className="px-2 py-1.5 text-2xs font-mono uppercase tracking-wider text-muted-foreground border-b border-border mb-1">
              Select Environment
            </div>
            {themes.map((t) => {
              const Icon = t.icon
              const isSelected = theme === t.id
              return (
                <button
                  key={t.id}
                  className={`w-full text-left font-mono text-xs px-3 py-2 rounded-sm flex items-center gap-2 transition-all duration-200 ${
                    isSelected
                      ? "bg-primary/10 text-primary font-semibold"
                      : "hover:bg-muted text-muted-foreground hover:text-foreground"
                  }`}
                  onClick={() => {
                    setTheme(t.id)
                    setIsOpen(false)
                  }}
                >
                  <Icon className={`h-4 w-4 ${t.color}`} />
                  {t.name}
                </button>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}