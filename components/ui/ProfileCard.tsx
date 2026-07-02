"use client"

import React, { useRef, useState, useCallback, useMemo } from 'react'
import { Terminal, ArrowUpRight } from 'lucide-react'

interface ProfileCardProps {
  avatarUrl?: string
  iconUrl?: string
  grainUrl?: string
  innerGradient?: string
  behindGlowEnabled?: boolean
  behindGlowColor?: string
  behindGlowSize?: string
  className?: string
  enableTilt?: boolean
  miniAvatarUrl?: string
  name?: string
  title?: string
  handle?: string
  status?: string
  contactText?: string
  showUserInfo?: boolean
  onContactClick?: () => void
}

export function ProfileCard({
  avatarUrl = "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=400&h=400&fit=crop",
  innerGradient,
  behindGlowEnabled = true,
  behindGlowColor = "var(--primary)", // Follow active theme primary color
  behindGlowSize = "50%",
  className = "",
  enableTilt = true,
  name = "Anonymous Developer",
  title = "Software Engineer",
  handle = "developer",
  status = "Available",
  contactText = "Profile",
  showUserInfo = true,
  onContactClick
}: ProfileCardProps) {
  const cardRef = useRef<HTMLDivElement>(null)
  const [tilt, setTilt] = useState({ x: 0, y: 0 })
  const [glarePos, setGlarePos] = useState({ x: 50, y: 50 })
  const [isHovered, setIsHovered] = useState(false)

  const handlePointerMove = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    if (!cardRef.current || !enableTilt) return
    const rect = cardRef.current.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    const centerX = rect.width / 2
    const centerY = rect.height / 2

    // Calculate rotation angles (max 10 degrees)
    const rotateX = -((y - centerY) / centerY) * 10
    const rotateY = ((x - centerX) / centerX) * 10

    setTilt({ x: rotateX, y: rotateY })

    // Glare position percentage
    const px = (x / rect.width) * 100
    const py = (y / rect.height) * 100
    setGlarePos({ x: px, y: py })
  }, [enableTilt])

  const handlePointerEnter = useCallback(() => {
    setIsHovered(true)
  }, [])

  const handlePointerLeave = useCallback(() => {
    setIsHovered(false)
    setTilt({ x: 0, y: 0 })
    setGlarePos({ x: 50, y: 50 })
  }, [])

  const cardBackgroundStyle = useMemo(() => {
    return innerGradient || "linear-gradient(145deg, color-mix(in srgb, var(--card) 90%, transparent) 0%, color-mix(in srgb, var(--background) 80%, transparent) 100%)"
  }, [innerGradient])

  const cardStyle: React.CSSProperties = useMemo(() => {
    return {
      transform: `perspective(1000px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg) scale3d(${isHovered ? 1.02 : 1}, ${isHovered ? 1.02 : 1}, 1)`,
      transition: isHovered ? "none" : "transform 0.4s cubic-bezier(0.25, 1, 0.5, 1), box-shadow 0.4s cubic-bezier(0.25, 1, 0.5, 1)",
      "--card-bg-default": cardBackgroundStyle,
    } as React.CSSProperties
  }, [tilt.x, tilt.y, isHovered, cardBackgroundStyle])

  const glareStyle: React.CSSProperties = useMemo(() => {
    return {
      background: `radial-gradient(circle at ${glarePos.x}% ${glarePos.y}%, rgba(255, 255, 255, 0.12) 0%, transparent 65%)`,
      opacity: isHovered ? 1 : 0,
      transition: isHovered ? "none" : "opacity 0.4s ease-out",
    }
  }, [glarePos.x, glarePos.y, isHovered])

  const glowStyle: React.CSSProperties = useMemo(() => {
    return {
      background: `radial-gradient(circle at ${glarePos.x}% ${glarePos.y}%, var(--behind-glow-color, ${behindGlowColor}) 0%, transparent var(--behind-glow-size, ${behindGlowSize}))`,
      opacity: isHovered ? 0.95 : 0.4,
      transition: isHovered ? "none" : "opacity 0.4s ease-out",
    }
  }, [glarePos.x, glarePos.y, behindGlowColor, behindGlowSize, isHovered])

  return (
    <div
      className={`relative w-full aspect-[3/4.2] rounded-2xl select-none touch-none ${className}`}
      onPointerMove={handlePointerMove}
      onPointerEnter={handlePointerEnter}
      onPointerLeave={handlePointerLeave}
    >
      {/* Background Neon Aura Glow */}
      {behindGlowEnabled && (
        <div
          className="absolute -inset-2 rounded-3xl blur-2xl pointer-events-none transition-opacity duration-300 ease-out z-0"
          style={glowStyle}
        />
      )}

      {/* Main Glass Card Structure */}
      <div
        ref={cardRef}
        className="profile-card-inner w-full h-full relative z-10 flex flex-col justify-between p-5 rounded-2xl border border-foreground/10 shadow-2xl backdrop-blur-xl overflow-hidden"
        style={{
          ...cardStyle,
          background: "var(--card-bg, var(--card-bg-default))",
          borderColor: "var(--card-border-color, color-mix(in srgb, var(--foreground) 10%, transparent))",
          borderWidth: "var(--card-border-width, 1px)",
        }}
      >
        {/* Holographic Glare Layer */}
        <div className="absolute inset-0 pointer-events-none z-30" style={glareStyle} />

        {/* Card Header: Tech Badge & Status */}
        <div className="flex items-center justify-between w-full z-20">
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-foreground/5 border border-foreground/10 backdrop-blur-md">
            <Terminal className="w-3.5 h-3.5 text-primary" />
            <span className="text-[10px] font-mono font-semibold tracking-wider text-primary/95 uppercase">
              @{handle}
            </span>
          </div>
          <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/25">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-[9px] font-mono font-medium text-emerald-400 max-w-[80px] truncate">
              {status}
            </span>
          </div>
        </div>

        {/* Card Center: Beautiful Framed Avatar */}
        <div className="flex-1 flex items-center justify-center py-4 z-20">
          <div className="relative group/avatar w-32 h-32 rounded-xl p-1 bg-gradient-to-tr from-primary to-primary/40 shadow-md">
            <div className="w-full h-full rounded-lg overflow-hidden bg-slate-950 border border-foreground/10 relative">
              <img
                src={avatarUrl}
                alt={`${name} avatar`}
                className="w-full h-full object-cover transition-transform duration-500 group-hover/avatar:scale-110"
                loading="lazy"
                onError={(e) => {
                  const target = e.target as HTMLImageElement
                  target.src = "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=400&h=400&fit=crop"
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/40 to-transparent pointer-events-none" />
            </div>
            {/* Corner Decorative Tech Elements */}
            <div className="absolute top-0 left-0 w-2.5 h-2.5 border-t-2 border-l-2 border-white/50 rounded-tl-sm -translate-x-[1px] -translate-y-[1px]" />
            <div className="absolute top-0 right-0 w-2.5 h-2.5 border-t-2 border-r-2 border-white/50 rounded-tr-sm translate-x-[1px] -translate-y-[1px]" />
            <div className="absolute bottom-0 left-0 w-2.5 h-2.5 border-b-2 border-l-2 border-white/50 rounded-bl-sm -translate-x-[1px] translate-y-[1px]" />
            <div className="absolute bottom-0 right-0 w-2.5 h-2.5 border-b-2 border-r-2 border-white/50 rounded-br-sm translate-x-[1px] translate-y-[1px]" />
          </div>
        </div>

        {/* Card Footer: Metadata and Interactive Trigger */}
        <div className="w-full z-20 space-y-3.5 border-t border-foreground/10 pt-4 bg-gradient-to-b from-transparent to-black/20 rounded-b-2xl">
          <div className="text-center space-y-1">
            <h3 className="text-base font-bold tracking-tight text-foreground line-clamp-1">
              {name}
            </h3>
            <p className="text-[11px] font-mono font-medium text-muted-foreground line-clamp-1">
              {title}
            </p>
          </div>

          {showUserInfo && (
            <button
              onClick={(e) => {
                e.stopPropagation()
                e.preventDefault()
                onContactClick?.()
              }}
              type="button"
              className="w-full flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-xs font-mono font-bold text-foreground bg-foreground/5 hover:bg-foreground/10 border border-foreground/10 hover:border-foreground/20 transition-all duration-200 cursor-pointer shadow-sm group/btn active:scale-95 animate-fade-in"
            >
              <span>{contactText}</span>
              <ArrowUpRight className="w-3.5 h-3.5 text-muted-foreground group-hover/btn:text-foreground group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5 transition-transform" />
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

export default React.memo(ProfileCard)
