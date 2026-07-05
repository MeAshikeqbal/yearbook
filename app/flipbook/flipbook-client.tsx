"use client"

import React, { useCallback, useEffect, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import {
  ChevronLeft,
  ChevronRight,
  Loader2,
  Maximize2,
  Minimize2,
  Monitor,
  X,
  Keyboard,
  Hand,
  Github,
  Linkedin,
  MapPin,
  Calendar,
} from "lucide-react"
import type { PageFlip } from "page-flip"

/* ─────────────────────────────────────────────
   Types
   ───────────────────────────────────────────── */

interface Student {
  username: string
  name: string
  role: string
  bio: string
  avatarUrl: string
  github: string | null
  linkedin: string | null
}

interface Memory {
  id: string
  imageUrl: string
  description: string
  date: string | Date
  uploaderName: string
  location: string | null
}

interface FlipbookClientProps {
  students: Student[]
  memories: Memory[]
}

/* ─────────────────────────────────────────────
   Design tokens
   ───────────────────────────────────────────── */

const COLORS = {
  cream: "#FDF8F0",
  creamDark: "#F5EDE0",
  parchment: "#FAF3E8",
  gold: "#C9A959",
  goldLight: "#D4BA6A",
  goldDim: "#8B7635",
  mahogany: "#2C1810",
  mahoganyLight: "#3D2518",
  mahoganyDark: "#1A0E08",
  espresso: "#1E1209",
  warmGray: "#6B5E52",
  warmGrayLight: "#9B8E82",
  inkBrown: "#3E2F24",
  borderTan: "#E0D4C3",
}

/* ─────────────────────────────────────────────
   Web Audio API paper-rustling sound
   ───────────────────────────────────────────── */

const playPageFlipSound = () => {
  if (typeof window === "undefined") return
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext
    if (!AudioCtx) return
    const ctx = new AudioCtx()

    const bufferSize = ctx.sampleRate * 0.35
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate)
    const data = buffer.getChannelData(0)
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1
    }

    const noise = ctx.createBufferSource()
    noise.buffer = buffer

    const filter = ctx.createBiquadFilter()
    filter.type = "bandpass"
    filter.frequency.setValueAtTime(900, ctx.currentTime)
    filter.Q.setValueAtTime(2.0, ctx.currentTime)
    filter.frequency.exponentialRampToValueAtTime(350, ctx.currentTime + 0.3)

    const gainNode = ctx.createGain()
    gainNode.gain.setValueAtTime(0, ctx.currentTime)
    gainNode.gain.linearRampToValueAtTime(0.06, ctx.currentTime + 0.04)
    gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3)

    noise.connect(filter)
    filter.connect(gainNode)
    gainNode.connect(ctx.destination)

    noise.start()
    noise.stop(ctx.currentTime + 0.35)
  } catch (e) {
    console.warn("Could not play flip sound:", e)
  }
}

/* ─────────────────────────────────────────────
   Decorative SVG ornament (CSS-only filigree)
   ───────────────────────────────────────────── */

function Ornament({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 200 20"
      className={`w-32 h-4 ${className}`}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M0 10 Q25 0 50 10 T100 10 T150 10 T200 10"
        stroke={COLORS.gold}
        strokeWidth="1"
        strokeOpacity="0.5"
        fill="none"
      />
      <circle cx="100" cy="10" r="3" fill={COLORS.gold} fillOpacity="0.4" />
      <circle cx="60" cy="10" r="1.5" fill={COLORS.gold} fillOpacity="0.3" />
      <circle cx="140" cy="10" r="1.5" fill={COLORS.gold} fillOpacity="0.3" />
    </svg>
  )
}

/* ─────────────────────────────────────────────
   Hard Cover wrapper (front & back)
   ───────────────────────────────────────────── */

function HardCover({
  isBack = false,
  children,
}: {
  isBack?: boolean
  children: React.ReactNode
}) {
  return (
    <div
      className="my-page flipbook-cover"
      data-density="hard"
      style={{
        background: `linear-gradient(135deg, ${COLORS.mahogany} 0%, ${COLORS.mahoganyDark} 40%, ${COLORS.espresso} 100%)`,
        padding: "1.5rem",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        alignItems: "center",
        textAlign: "center",
        height: "100%",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Leather grain texture overlay */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          opacity: 0.06,
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg width='6' height='6' viewBox='0 0 6 6' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M5 0h1L0 6V5zM6 5v1H5z'/%3E%3C/g%3E%3C/svg%3E\")",
          pointerEvents: "none",
        }}
      />

      {/* Gold border frame */}
      <div
        style={{
          position: "absolute",
          inset: "12px",
          border: `1px solid ${COLORS.gold}40`,
          borderRadius: "2px",
          pointerEvents: "none",
        }}
      />

      {/* Inner double border */}
      <div
        style={{
          position: "absolute",
          inset: "16px",
          border: `1px solid ${COLORS.gold}20`,
          borderRadius: "1px",
          pointerEvents: "none",
        }}
      />

      {/* Gold corner flourishes */}
      {[
        { top: 8, left: 8 },
        { top: 8, right: 8 },
        { bottom: 8, left: 8 },
        { bottom: 8, right: 8 },
      ].map((pos, i) => (
        <div
          key={i}
          style={{
            position: "absolute",
            ...pos,
            width: 20,
            height: 20,
            borderTop: i < 2 ? `2px solid ${COLORS.gold}50` : "none",
            borderBottom: i >= 2 ? `2px solid ${COLORS.gold}50` : "none",
            borderLeft: i % 2 === 0 ? `2px solid ${COLORS.gold}50` : "none",
            borderRight: i % 2 === 1 ? `2px solid ${COLORS.gold}50` : "none",
            pointerEvents: "none",
          }}
        />
      ))}

      {/* Spine shadow */}
      {!isBack ? (
        <div
          style={{
            position: "absolute",
            right: 0,
            top: 0,
            bottom: 0,
            width: 20,
            background:
              "linear-gradient(to right, transparent, rgba(0,0,0,0.5))",
            pointerEvents: "none",
          }}
        />
      ) : (
        <div
          style={{
            position: "absolute",
            left: 0,
            top: 0,
            bottom: 0,
            width: 20,
            background:
              "linear-gradient(to right, rgba(0,0,0,0.5), transparent)",
            pointerEvents: "none",
          }}
        />
      )}

      {/* Content */}
      <div
        style={{
          position: "relative",
          zIndex: 10,
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        {children}
      </div>
    </div>
  )
}

/* ─────────────────────────────────────────────
   Inner Page wrapper (cream parchment)
   ───────────────────────────────────────────── */

function InnerPage({
  pageIndex,
  children,
}: {
  pageIndex: number
  children: React.ReactNode
}) {
  const isLeftPage = pageIndex % 2 !== 0

  return (
    <div
      className="my-page flipbook-page"
      style={{
        background: `linear-gradient(160deg, ${COLORS.cream} 0%, ${COLORS.parchment} 50%, ${COLORS.creamDark} 100%)`,
        padding: "1.5rem 1.75rem",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        height: "100%",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Paper fibre texture */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          opacity: 0.03,
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='4' height='4'%3E%3Crect width='4' height='4' fill='%23000000'/%3E%3Crect width='2' height='2' fill='%23111111'/%3E%3C/svg%3E\")",
          backgroundSize: "4px 4px",
          pointerEvents: "none",
        }}
      />

      {/* Warm top light */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "linear-gradient(to bottom, rgba(255,248,230,0.12) 0%, transparent 40%)",
          pointerEvents: "none",
        }}
      />

      {/* Spine crease shadow */}
      {isLeftPage ? (
        <div
          style={{
            position: "absolute",
            right: 0,
            top: 0,
            bottom: 0,
            width: 18,
            background:
              "linear-gradient(to right, transparent, rgba(60,40,20,0.18))",
            pointerEvents: "none",
          }}
        />
      ) : (
        <div
          style={{
            position: "absolute",
            left: 0,
            top: 0,
            bottom: 0,
            width: 18,
            background:
              "linear-gradient(to right, rgba(60,40,20,0.18), transparent)",
            pointerEvents: "none",
          }}
        />
      )}

      {/* Outer page edge shadow */}
      {isLeftPage ? (
        <div
          style={{
            position: "absolute",
            left: 0,
            top: 0,
            bottom: 0,
            width: 6,
            background:
              "linear-gradient(to right, rgba(60,40,20,0.08), transparent)",
            pointerEvents: "none",
          }}
        />
      ) : (
        <div
          style={{
            position: "absolute",
            right: 0,
            top: 0,
            bottom: 0,
            width: 6,
            background:
              "linear-gradient(to left, rgba(60,40,20,0.08), transparent)",
            pointerEvents: "none",
          }}
        />
      )}

      {/* Content */}
      <div
        style={{
          position: "relative",
          zIndex: 10,
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          overflow: "hidden",
        }}
      >
        {children}
      </div>
    </div>
  )
}

/* ─────────────────────────────────────────────
   Page number footer
   ───────────────────────────────────────────── */

function PageNumber({
  section,
  pageNum,
}: {
  section: string
  pageNum: number
}) {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        borderTop: `1px solid ${COLORS.borderTan}`,
        paddingTop: "0.4rem",
        marginTop: "auto",
        flexShrink: 0,
        fontFamily: "'Georgia', 'Times New Roman', serif",
        fontSize: "9px",
        color: COLORS.warmGrayLight,
        letterSpacing: "0.05em",
      }}
    >
      <span style={{ fontStyle: "italic" }}>{section}</span>
      <span>{pageNum}</span>
    </div>
  )
}

/* ─────────────────────────────────────────────
   Table of Contents Entry
   ───────────────────────────────────────────── */

function TocEntry({
  label,
  page,
  range,
  active,
}: {
  label: string
  page: number
  range?: number
  active?: boolean
}) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: "0.5rem",
        color: active ? COLORS.gold : COLORS.inkBrown,
        fontFamily: "'Georgia', 'Times New Roman', serif",
        fontSize: "11px",
      }}
    >
      <span style={{ flex: "0 1 auto", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
        {label}
      </span>
      <span
        style={{
          flex: 1,
          borderBottom: `1px dotted ${COLORS.borderTan}`,
          minWidth: "1rem",
        }}
      />
      <span
        style={{
          fontSize: "10px",
          color: COLORS.warmGray,
          fontVariantNumeric: "tabular-nums",
          flexShrink: 0,
        }}
      >
        {range
          ? `${String(page).padStart(2, "0")}–${String(range).padStart(2, "0")}`
          : String(page).padStart(2, "0")}
      </span>
    </div>
  )
}

/* ─────────────────────────────────────────────
   Student Card (used in profile pages)
   ───────────────────────────────────────────── */

function StudentCard({ student }: { student: Student }) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        textAlign: "center",
        gap: "0.5rem",
        padding: "0.75rem 0.5rem",
        flex: 1,
      }}
    >
      {/* Avatar */}
      <div
        style={{
          width: 72,
          height: 72,
          borderRadius: "50%",
          overflow: "hidden",
          border: `3px solid ${COLORS.gold}50`,
          boxShadow: `0 4px 12px rgba(44,24,16,0.15)`,
          flexShrink: 0,
          background: COLORS.creamDark,
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={student.avatarUrl}
          alt={student.name}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
          }}
        />
      </div>

      {/* Name */}
      <h4
        style={{
          fontFamily: "'Georgia', 'Times New Roman', serif",
          fontSize: "13px",
          fontWeight: 700,
          color: COLORS.mahogany,
          margin: 0,
          lineHeight: 1.2,
        }}
      >
        {student.name}
      </h4>

      {/* Role */}
      <span
        style={{
          fontSize: "10px",
          color: COLORS.goldDim,
          fontStyle: "italic",
          fontFamily: "'Georgia', 'Times New Roman', serif",
          letterSpacing: "0.02em",
        }}
      >
        {student.role}
      </span>

      {/* Bio */}
      <p
        style={{
          fontSize: "9.5px",
          color: COLORS.warmGray,
          lineHeight: 1.5,
          margin: 0,
          maxWidth: "180px",
          display: "-webkit-box",
          WebkitLineClamp: 3,
          WebkitBoxOrient: "vertical",
          overflow: "hidden",
        }}
      >
        {student.bio}
      </p>

      {/* Social links */}
      {(student.github || student.linkedin) && (
        <div
          style={{
            display: "flex",
            gap: "0.5rem",
            alignItems: "center",
            marginTop: "0.15rem",
          }}
        >
          {student.github && (
            <Github
              size={12}
              style={{ color: COLORS.warmGray, opacity: 0.6 }}
            />
          )}
          {student.linkedin && (
            <Linkedin
              size={12}
              style={{ color: COLORS.warmGray, opacity: 0.6 }}
            />
          )}
        </div>
      )}
    </div>
  )
}

/* ═════════════════════════════════════════════
   MAIN FLIPBOOK COMPONENT
   ═════════════════════════════════════════════ */

export default function FlipbookClient({
  students,
  memories,
}: FlipbookClientProps) {
  const router = useRouter()
  const bookRef = useRef<HTMLDivElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  const [loading, setLoading] = useState(true)
  const [pageFlipInstance, setPageFlipInstance] = useState<PageFlip | null>(null)
  const [currentPage, setCurrentPage] = useState(0)
  const [windowWidth, setWindowWidth] = useState(
    typeof window !== "undefined" ? window.innerWidth : 1200
  )

  // Listen to window resize for responsiveness
  useEffect(() => {
    if (typeof window === "undefined") return
    
    let timeoutId: NodeJS.Timeout
    const handleResize = () => {
      clearTimeout(timeoutId)
      timeoutId = setTimeout(() => {
        setWindowWidth(window.innerWidth)
      }, 150)
    }

    window.addEventListener("resize", handleResize)
    return () => {
      window.removeEventListener("resize", handleResize)
      clearTimeout(timeoutId)
    }
  }, [])
  const [totalPages, setTotalPages] = useState(0)
  const [isFullPage, setIsFullPage] = useState(false)
  const [isNativeFullscreen, setIsNativeFullscreen] = useState(false)
  const [showHint, setShowHint] = useState(true)

  const savedPageRef = useRef(0)
  const isInitializedRef = useRef(false)

  // Dismiss hint after 5s
  useEffect(() => {
    if (!showHint) return
    const timer = setTimeout(() => setShowHint(false), 5000)
    return () => clearTimeout(timer)
  }, [showHint])

  // Full-page toggle
  const toggleFullPage = useCallback(() => {
    setIsFullPage((prev) => !prev)
  }, [])

  // Native fullscreen toggle
  const toggleNativeFullscreen = useCallback(async () => {
    if (!containerRef.current) return
    try {
      if (!document.fullscreenElement) {
        await containerRef.current.requestFullscreen()
        setIsNativeFullscreen(true)
        setIsFullPage(true)
      } else {
        await document.exitFullscreen()
        setIsNativeFullscreen(false)
      }
    } catch (err) {
      console.error("Fullscreen toggle failed:", err)
    }
  }, [])

  // Handle fullscreen change events
  useEffect(() => {
    const handleFullscreenChange = () => {
      const isFull = !!document.fullscreenElement
      setIsNativeFullscreen(isFull)
      if (isFull) setIsFullPage(true)
    }
    document.addEventListener("fullscreenchange", handleFullscreenChange)
    return () =>
      document.removeEventListener("fullscreenchange", handleFullscreenChange)
  }, [])

  // Keyboard nav
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isFullPage) {
        setIsFullPage(false)
        if (document.fullscreenElement) {
          document.exitFullscreen().catch(() => {})
        }
      }
      if (e.key === "ArrowRight" && pageFlipInstance) pageFlipInstance.flipNext()
      if (e.key === "ArrowLeft" && pageFlipInstance) pageFlipInstance.flipPrev()
    }
    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [isFullPage, pageFlipInstance])

  // Initialize PageFlip
  useEffect(() => {
    let instance: PageFlip | null = null
    isInitializedRef.current = false

    const initFlipbook = async () => {
      try {
        if (!bookRef.current) return

        const { PageFlip: PageFlipClass } = await import("page-flip")

        const isMobile = window.innerWidth < 768
        const availableWidth = window.innerWidth - 64
        const availableHeight = window.innerHeight - 200

        let width = isMobile ? 300 : 420
        let height = isMobile ? 430 : 580

        if (isFullPage) {
          if (isMobile) {
            width = Math.round(Math.max(260, Math.min(availableWidth, 380)))
            height = Math.round(width / 0.7)
          } else {
            let targetHeight = availableHeight
            let targetWidth = targetHeight * 0.72

            if (targetWidth * 2 > availableWidth) {
              targetWidth = availableWidth / 2
              targetHeight = targetWidth / 0.72
            }

            width = Math.round(Math.max(320, Math.min(targetWidth, 560)))
            height = Math.round(Math.max(450, Math.min(targetHeight, 780)))
          }
        }

        instance = new PageFlipClass(bookRef.current, {
          width,
          height,
          size: "stretch",
          minWidth: 240,
          maxWidth: 1200,
          minHeight: 340,
          maxHeight: 1600,
          drawShadow: true,
          flippingTime: 800,
          useMouseEvents: true,
          showCover: true,
          mobileScrollSupport: false,
          startPage: 0,
          swipeDistance: 30,
          usePortrait: isMobile,
          startZIndex: 0,
          autoSize: true,
          clickEventForward: true,
          maxShadowOpacity: 0.5,
        })

        instance.loadFromHTML(bookRef.current.querySelectorAll(".my-page"))
        setPageFlipInstance(instance)
        setTotalPages(instance.getPageCount())
        setLoading(false)

        instance.on("flip", (e: { data: number }) => {
          setCurrentPage(e.data)
          savedPageRef.current = e.data
          setShowHint(false)
          if (isInitializedRef.current) {
            playPageFlipSound()
          }
        })

        if (savedPageRef.current > 0) {
          instance.turnToPage(savedPageRef.current)
        }

        setTimeout(() => {
          isInitializedRef.current = true
        }, 150)
      } catch (err) {
        console.error("Flipbook initialization failed:", err)
        setLoading(false)
      }
    }

    const timer = setTimeout(() => initFlipbook(), 350)
    return () => {
      clearTimeout(timer)
      if (instance) {
        try { instance.destroy() } catch { /* ignore */ }
      }
    }
  }, [students, memories, isFullPage, windowWidth])

  /* ──── Data pagination ──── */

  // 2 students per page for hero layout
  const studentsPerPage = 2
  const studentPages: Student[][] = []
  for (let i = 0; i < students.length; i += studentsPerPage) {
    studentPages.push(students.slice(i, i + studentsPerPage))
  }

  // 1 memory per page for full-bleed impact
  const memoryPages: Memory[][] = []
  for (let i = 0; i < memories.length; i += 1) {
    memoryPages.push([memories[i]])
  }

  /* ──── TOC page numbers ──── */
  const tocCoverPage = 1
  const tocForewordPage = 2
  const tocTocPage = 3
  const tocStudentsStart = 4
  const tocStudentsEnd = tocStudentsStart + studentPages.length - 1
  const tocMemoriesStart = tocStudentsEnd + 1
  const tocMemoriesEnd = tocMemoriesStart + memoryPages.length - 1
  const tocDedicationPage = tocMemoriesEnd + 1
  const tocBackCover = tocDedicationPage + 1

  /* ──── Page stack indicators ──── */
  const maxLayers = 5
  const leftLayers =
    totalPages > 0
      ? currentPage === 0
        ? 0
        : Math.max(
            1,
            Math.min(
              maxLayers,
              Math.ceil((currentPage / totalPages) * maxLayers)
            )
          )
      : 0
  const rightLayers =
    totalPages > 0
      ? currentPage === totalPages - 1
        ? 0
        : Math.max(
            1,
            Math.min(
              maxLayers,
              Math.ceil(
                ((totalPages - 1 - currentPage) / totalPages) * maxLayers
              )
            )
          )
      : 0

  /* ─────── RENDER ─────── */

  return (
    <div
      ref={containerRef}
      className={
        isFullPage
          ? "flipbook-container flipbook-container--fullpage"
          : "flipbook-container"
      }
    >
      {/* Background for full page mode */}
      {isFullPage && (
        <div className="flipbook-fullpage-bg">
          <div className="flipbook-fullpage-bg__vignette" />
        </div>
      )}

      <div className="flipbook-inner">
        {/* ─── Top Control Bar ─── */}
        <div className="flipbook-toolbar">
          <div className="flipbook-toolbar__title">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={COLORS.gold} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
              <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
            </svg>
            <h1
              style={{
                fontFamily: "'Georgia', 'Times New Roman', serif",
                fontSize: "14px",
                fontWeight: 600,
                color: COLORS.cream,
                letterSpacing: "0.04em",
                margin: 0,
              }}
            >
              Class of 2026 — Yearbook
            </h1>
          </div>

          <div className="flipbook-toolbar__actions">
            {/* Full Page Toggle */}
            <button
              onClick={toggleFullPage}
              className="flipbook-btn"
              title={isFullPage ? "Exit full page" : "Full page view"}
            >
              {isFullPage ? (
                <Minimize2 size={14} style={{ color: COLORS.gold }} />
              ) : (
                <Maximize2 size={14} />
              )}
              <span>{isFullPage ? "Exit" : "Expand"}</span>
            </button>

            {/* Native Fullscreen (desktop) */}
            <button
              onClick={toggleNativeFullscreen}
              className="flipbook-btn flipbook-btn--desktop"
              title={isNativeFullscreen ? "Exit fullscreen" : "Fullscreen"}
            >
              <Monitor size={14} />
              <span>{isNativeFullscreen ? "Windowed" : "Fullscreen"}</span>
            </button>

            {/* Close */}
            {!isFullPage ? (
              <button
                onClick={() => router.push("/browse")}
                className="flipbook-btn"
              >
                Close
              </button>
            ) : (
              <button
                onClick={() => {
                  setIsFullPage(false)
                  if (document.fullscreenElement) {
                    document.exitFullscreen().catch(() => {})
                  }
                }}
                className="flipbook-btn"
              >
                <X size={14} />
              </button>
            )}
          </div>
        </div>

        {/* ─── Loading State ─── */}
        {loading && (
          <div className="flipbook-loading">
            <Loader2
              size={32}
              style={{ color: COLORS.gold, animation: "spin 1s linear infinite" }}
            />
            <p
              style={{
                fontFamily: "'Georgia', 'Times New Roman', serif",
                fontSize: "13px",
                color: COLORS.warmGrayLight,
                fontStyle: "italic",
                marginTop: "0.75rem",
              }}
            >
              Preparing your yearbook…
            </p>
          </div>
        )}

        {/* ─── FLIPBOOK CONTAINER ─── */}
        <div
          className={`flipbook-book-area ${loading ? "flipbook-book-area--loading" : ""}`}
        >
          {/* Flip Hint Overlay */}
          {showHint && !loading && (
            <div className="flipbook-hint flipbook-hint-fade">
              <div className="flipbook-hint__inner">
                <Hand
                  size={16}
                  style={{ color: COLORS.gold, animation: "bounce 1s infinite" }}
                />
                <span
                  style={{
                    fontFamily: "'Georgia', 'Times New Roman', serif",
                    fontSize: "12px",
                    color: COLORS.cream,
                    fontStyle: "italic",
                  }}
                >
                  Drag or click page edges to turn
                </span>
                <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                  <Keyboard size={12} style={{ color: COLORS.warmGrayLight }} />
                  <span style={{ fontSize: "10px", color: COLORS.warmGrayLight }}>
                    ← →
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Book Wrapper (leather binding) */}
          <div className="flipbook-leather-wrapper">
            {/* Gold corner plates */}
            <div className="flipbook-corner flipbook-corner--tl" />
            <div className="flipbook-corner flipbook-corner--tr" />
            <div className="flipbook-corner flipbook-corner--bl" />
            <div className="flipbook-corner flipbook-corner--br" />

            {/* Left page stack */}
            {currentPage > 0 && currentPage < totalPages - 1 && (
              <div className="flipbook-page-stack flipbook-page-stack--left">
                {Array.from({ length: leftLayers }).map((_, i) => (
                  <div
                    key={`left-${i}`}
                    className="flipbook-page-stack__layer"
                    style={{
                      left: `${-(i + 1) * 2}px`,
                      transform: `scaleY(${1 - i * 0.006})`,
                      opacity: 0.9 - i * 0.1,
                      background: COLORS.creamDark,
                      borderLeft: `1px solid ${COLORS.borderTan}`,
                      borderTop: `1px solid ${COLORS.borderTan}`,
                      borderBottom: `1px solid ${COLORS.borderTan}`,
                    }}
                  />
                ))}
              </div>
            )}

            {/* Right page stack */}
            {currentPage > 0 && currentPage < totalPages - 1 && (
              <div className="flipbook-page-stack flipbook-page-stack--right">
                {Array.from({ length: rightLayers }).map((_, i) => (
                  <div
                    key={`right-${i}`}
                    className="flipbook-page-stack__layer flipbook-page-stack__layer--right"
                    style={{
                      right: `${-(i + 1) * 2}px`,
                      transform: `scaleY(${1 - i * 0.006})`,
                      opacity: 0.9 - i * 0.1,
                      background: COLORS.creamDark,
                      borderRight: `1px solid ${COLORS.borderTan}`,
                      borderTop: `1px solid ${COLORS.borderTan}`,
                      borderBottom: `1px solid ${COLORS.borderTan}`,
                    }}
                  />
                ))}
              </div>
            )}

            {/* ═══════ The Page Flip Element ═══════ */}
            <div ref={bookRef} className="flipbook group">
              {/* ═══ FRONT COVER ═══ */}
              <HardCover>
                <div
                  style={{
                    fontSize: "9px",
                    letterSpacing: "0.2em",
                    textTransform: "uppercase",
                    color: COLORS.goldLight,
                    fontFamily: "'Georgia', 'Times New Roman', serif",
                    padding: "0.35rem 0.75rem",
                    border: `1px solid ${COLORS.gold}30`,
                    borderRadius: "2px",
                    width: "100%",
                  }}
                >
                  Graduation Record · Volume I
                </div>

                <div
                  style={{
                    flex: 1,
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "0.75rem",
                  }}
                >
                  <Ornament />

                  <h2
                    style={{
                      fontFamily: "'Georgia', 'Times New Roman', serif",
                      fontSize: "15px",
                      fontWeight: 400,
                      color: COLORS.goldLight,
                      letterSpacing: "0.25em",
                      textTransform: "uppercase",
                      margin: 0,
                      lineHeight: 1.6,
                    }}
                  >
                    Class of
                  </h2>

                  {/* Year emblem */}
                  <div
                    style={{
                      width: 90,
                      height: 90,
                      borderRadius: "50%",
                      border: `2px solid ${COLORS.gold}70`,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      position: "relative",
                    }}
                  >
                    <div
                      style={{
                        width: 78,
                        height: 78,
                        borderRadius: "50%",
                        border: `1px solid ${COLORS.gold}40`,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <span
                        style={{
                          fontFamily: "'Georgia', 'Times New Roman', serif",
                          fontSize: "32px",
                          fontWeight: 700,
                          color: COLORS.gold,
                          letterSpacing: "0.08em",
                        }}
                      >
                        2026
                      </span>
                    </div>
                  </div>

                  <div
                    style={{
                      width: 48,
                      height: 1,
                      background: `linear-gradient(to right, transparent, ${COLORS.gold}60, transparent)`,
                    }}
                  />

                  <p
                    style={{
                      fontFamily: "'Georgia', 'Times New Roman', serif",
                      fontSize: "10px",
                      color: COLORS.goldLight,
                      letterSpacing: "0.12em",
                      textTransform: "uppercase",
                      textAlign: "center",
                      lineHeight: 1.8,
                      maxWidth: 220,
                      margin: 0,
                    }}
                  >
                    Computer Science & Engineering
                    <br />
                    Final Year Yearbook
                  </p>

                  <Ornament />
                </div>

                <p
                  style={{
                    fontFamily: "'Georgia', 'Times New Roman', serif",
                    fontSize: "8px",
                    color: COLORS.warmGray,
                    fontStyle: "italic",
                    letterSpacing: "0.06em",
                  }}
                >
                  Tap or drag to turn pages
                </p>
              </HardCover>

              {/* ═══ FOREWORD ═══ */}
              <InnerPage pageIndex={1}>
                <div style={{ flex: 1, textAlign: "left" }}>
                  <div style={{ marginBottom: "0.75rem" }}>
                    <span
                      style={{
                        fontFamily: "'Georgia', 'Times New Roman', serif",
                        fontSize: "9px",
                        color: COLORS.goldDim,
                        letterSpacing: "0.2em",
                        textTransform: "uppercase",
                      }}
                    >
                      Foreword
                    </span>
                  </div>

                  <h3
                    style={{
                      fontFamily: "'Georgia', 'Times New Roman', serif",
                      fontSize: "16px",
                      fontWeight: 700,
                      color: COLORS.mahogany,
                      margin: "0 0 0.75rem 0",
                      lineHeight: 1.3,
                    }}
                  >
                    The Journey Ends,
                    <br />
                    <span style={{ fontStyle: "italic", fontWeight: 400 }}>
                      the memories remain.
                    </span>
                  </h3>

                  <div
                    style={{
                      width: 32,
                      height: 1,
                      background: COLORS.gold,
                      opacity: 0.5,
                      marginBottom: "0.75rem",
                    }}
                  />

                  {/* Drop-cap paragraph */}
                  <p
                    style={{
                      fontSize: "11px",
                      color: COLORS.inkBrown,
                      lineHeight: 1.7,
                      margin: "0 0 0.5rem 0",
                      textAlign: "justify",
                    }}
                  >
                    <span
                      style={{
                        fontFamily: "'Georgia', 'Times New Roman', serif",
                        fontSize: "32px",
                        fontWeight: 700,
                        float: "left",
                        lineHeight: 0.85,
                        paddingRight: "0.25rem",
                        paddingTop: "0.15rem",
                        color: COLORS.gold,
                      }}
                    >
                      W
                    </span>
                    elcome to the digital archive of the CSE Class of 2026. Within
                    these pages lie the faces, stories, and shared moments of a
                    class that laughed together, learned together, and grew
                    together through four remarkable years.
                  </p>

                  <p
                    style={{
                      fontSize: "11px",
                      color: COLORS.inkBrown,
                      lineHeight: 1.7,
                      margin: "0 0 0.75rem 0",
                      textAlign: "justify",
                    }}
                  >
                    From the first nervous orientation day to the final triumphant
                    submission, every late-night debug session, every shared laugh
                    in the corridor, and every breakthrough moment has been a
                    thread in the tapestry of our collective story.
                  </p>

                  {/* Pull quote */}
                  <div
                    style={{
                      borderLeft: `3px solid ${COLORS.gold}60`,
                      paddingLeft: "0.75rem",
                      margin: "0.5rem 0",
                    }}
                  >
                    <p
                      style={{
                        fontFamily: "'Georgia', 'Times New Roman', serif",
                        fontSize: "12px",
                        color: COLORS.warmGray,
                        fontStyle: "italic",
                        lineHeight: 1.6,
                        margin: 0,
                      }}
                    >
                      &ldquo;The best code we ever wrote was the friendships we
                      compiled along the way.&rdquo;
                    </p>
                  </div>
                </div>

                <PageNumber section="Foreword" pageNum={2} />
              </InnerPage>

              {/* ═══ TABLE OF CONTENTS ═══ */}
              <InnerPage pageIndex={2}>
                <div style={{ flex: 1, textAlign: "left" }}>
                  <div style={{ marginBottom: "0.5rem" }}>
                    <span
                      style={{
                        fontFamily: "'Georgia', 'Times New Roman', serif",
                        fontSize: "9px",
                        color: COLORS.goldDim,
                        letterSpacing: "0.2em",
                        textTransform: "uppercase",
                      }}
                    >
                      Contents
                    </span>
                  </div>

                  <h3
                    style={{
                      fontFamily: "'Georgia', 'Times New Roman', serif",
                      fontSize: "16px",
                      fontWeight: 700,
                      color: COLORS.mahogany,
                      margin: "0 0 0.4rem 0",
                    }}
                  >
                    Table of Contents
                  </h3>

                  <Ornament className="mb-3" />

                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: "0.4rem",
                      marginTop: "0.75rem",
                    }}
                  >
                    <TocEntry label="Cover" page={tocCoverPage} />
                    <TocEntry label="Foreword" page={tocForewordPage} />
                    <TocEntry
                      label="Table of Contents"
                      page={tocTocPage}
                      active
                    />

                    <div style={{ height: 6 }} />

                    <TocEntry
                      label={`Student Profiles (${students.length})`}
                      page={tocStudentsStart}
                      range={
                        studentPages.length > 1 ? tocStudentsEnd : undefined
                      }
                    />
                    <TocEntry
                      label={`Memories & Moments (${memories.length})`}
                      page={tocMemoriesStart}
                      range={
                        memoryPages.length > 1 ? tocMemoriesEnd : undefined
                      }
                    />

                    <div style={{ height: 6 }} />

                    <TocEntry label="Dedication" page={tocDedicationPage} />
                    <TocEntry label="Back Cover" page={tocBackCover} />
                  </div>
                </div>

                <PageNumber section="Contents" pageNum={3} />
              </InnerPage>

              {/* ═══ STUDENT PROFILE PAGES ═══ */}
              {studentPages.length === 0 ? (
                <InnerPage pageIndex={3}>
                  <div
                    style={{
                      height: "100%",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontFamily: "'Georgia', 'Times New Roman', serif",
                    }}
                  >
                    <p
                      style={{
                        fontSize: "12px",
                        color: COLORS.warmGray,
                        fontStyle: "italic",
                      }}
                    >
                      No student profiles have been added yet.
                    </p>
                  </div>
                  <PageNumber section="Profiles" pageNum={4} />
                </InnerPage>
              ) : (
                studentPages.map((chunk, idx) => (
                  <InnerPage
                    key={`student-page-${idx}`}
                    pageIndex={3 + idx}
                  >
                    <div style={{ flex: 1, overflow: "hidden" }}>
                      {/* Section header */}
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          marginBottom: "0.35rem",
                        }}
                      >
                        <span
                          style={{
                            fontFamily: "'Georgia', 'Times New Roman', serif",
                            fontSize: "9px",
                            color: COLORS.goldDim,
                            letterSpacing: "0.2em",
                            textTransform: "uppercase",
                          }}
                        >
                          Student Profiles
                        </span>
                        <span
                          style={{
                            fontSize: "9px",
                            color: COLORS.warmGrayLight,
                            fontStyle: "italic",
                            fontFamily: "'Georgia', 'Times New Roman', serif",
                          }}
                        >
                          {idx * studentsPerPage + 1}–
                          {Math.min(
                            (idx + 1) * studentsPerPage,
                            students.length
                          )}{" "}
                          of {students.length}
                        </span>
                      </div>

                      <div
                        style={{
                          width: "100%",
                          height: 1,
                          background: `linear-gradient(to right, ${COLORS.gold}40, ${COLORS.borderTan}, ${COLORS.gold}40)`,
                          marginBottom: "0.5rem",
                        }}
                      />

                      {/* Student cards */}
                      <div
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          gap: "0.25rem",
                          alignItems: "center",
                        }}
                      >
                        {chunk.map((student, sIdx) => (
                          <React.Fragment key={student.username}>
                            <StudentCard student={student} />
                            {sIdx < chunk.length - 1 && (
                              <div
                                style={{
                                  width: 40,
                                  height: 1,
                                  background: `linear-gradient(to right, transparent, ${COLORS.borderTan}, transparent)`,
                                }}
                              />
                            )}
                          </React.Fragment>
                        ))}
                      </div>
                    </div>

                    <PageNumber
                      section="Profiles"
                      pageNum={tocStudentsStart + idx}
                    />
                  </InnerPage>
                ))
              )}

              {/* ═══ MEMORY PAGES ═══ */}
              {memoryPages.map((chunk, idx) => {
                const memory = chunk[0]
                const memDate =
                  memory.date instanceof Date
                    ? memory.date
                    : new Date(memory.date)
                const formattedDate = memDate.toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })

                return (
                  <InnerPage
                    key={`memory-page-${idx}`}
                    pageIndex={3 + studentPages.length + idx}
                  >
                    <div style={{ flex: 1, overflow: "hidden" }}>
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          marginBottom: "0.35rem",
                        }}
                      >
                        <span
                          style={{
                            fontFamily: "'Georgia', 'Times New Roman', serif",
                            fontSize: "9px",
                            color: COLORS.goldDim,
                            letterSpacing: "0.2em",
                            textTransform: "uppercase",
                          }}
                        >
                          Memories
                        </span>
                      </div>

                      {/* Photo frame */}
                      <div
                        style={{
                          position: "relative",
                          width: "100%",
                          flex: 1,
                          borderRadius: "4px",
                          overflow: "hidden",
                          border: `1px solid ${COLORS.borderTan}`,
                          boxShadow: "0 4px 16px rgba(44,24,16,0.12)",
                          marginBottom: "0.5rem",
                        }}
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={memory.imageUrl}
                          alt={memory.description}
                          style={{
                            width: "100%",
                            height: "100%",
                            minHeight: "180px",
                            maxHeight: "320px",
                            objectFit: "cover",
                            display: "block",
                          }}
                        />

                        {/* Caption overlay at bottom */}
                        <div
                          style={{
                            position: "absolute",
                            bottom: 0,
                            left: 0,
                            right: 0,
                            background:
                              "linear-gradient(to top, rgba(26,14,8,0.85) 0%, rgba(26,14,8,0.4) 70%, transparent 100%)",
                            padding: "1.5rem 0.75rem 0.5rem",
                          }}
                        >
                          <p
                            style={{
                              fontFamily: "'Georgia', 'Times New Roman', serif",
                              fontSize: "11px",
                              color: COLORS.cream,
                              lineHeight: 1.5,
                              margin: "0 0 0.25rem 0",
                              fontStyle: "italic",
                            }}
                          >
                            {memory.description}
                          </p>
                        </div>
                      </div>

                      {/* Memory metadata */}
                      <div
                        style={{
                          display: "flex",
                          gap: "0.75rem",
                          alignItems: "center",
                          fontSize: "9px",
                          color: COLORS.warmGray,
                          fontFamily: "'Georgia', 'Times New Roman', serif",
                        }}
                      >
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "0.25rem",
                          }}
                        >
                          <Calendar size={10} />
                          <span>{formattedDate}</span>
                        </div>
                        {memory.location && (
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: "0.25rem",
                            }}
                          >
                            <MapPin size={10} />
                            <span>{memory.location}</span>
                          </div>
                        )}
                        <span style={{ fontStyle: "italic", marginLeft: "auto" }}>
                          — {memory.uploaderName}
                        </span>
                      </div>
                    </div>

                    <PageNumber
                      section="Memories"
                      pageNum={tocMemoriesStart + idx}
                    />
                  </InnerPage>
                )
              })}

              {/* ═══ DEDICATION PAGE ═══ */}
              <InnerPage
                pageIndex={3 + studentPages.length + memoryPages.length}
              >
                <div
                  style={{
                    height: "100%",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    textAlign: "center",
                    gap: "0.75rem",
                    padding: "0 1rem",
                  }}
                >
                  <Ornament />

                  <p
                    style={{
                      fontFamily: "'Georgia', 'Times New Roman', serif",
                      fontSize: "13px",
                      color: COLORS.warmGray,
                      fontStyle: "italic",
                      lineHeight: 1.7,
                      maxWidth: 240,
                    }}
                  >
                    &ldquo;We do not remember days, we remember moments.&rdquo;
                  </p>

                  <span
                    style={{
                      fontFamily: "'Georgia', 'Times New Roman', serif",
                      fontSize: "10px",
                      color: COLORS.warmGrayLight,
                    }}
                  >
                    — Cesare Pavese
                  </span>

                  <div
                    style={{
                      width: 40,
                      height: 1,
                      background: `linear-gradient(to right, transparent, ${COLORS.gold}60, transparent)`,
                      margin: "0.25rem 0",
                    }}
                  />

                  <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}>
                    <p
                      style={{
                        fontFamily: "'Georgia', 'Times New Roman', serif",
                        fontSize: "10px",
                        color: COLORS.goldDim,
                        letterSpacing: "0.15em",
                        textTransform: "uppercase",
                        margin: 0,
                      }}
                    >
                      Dedicated to
                    </p>
                    <p
                      style={{
                        fontFamily: "'Georgia', 'Times New Roman', serif",
                        fontSize: "14px",
                        fontWeight: 700,
                        color: COLORS.mahogany,
                        margin: 0,
                      }}
                    >
                      The Class of 2026
                    </p>
                    <p
                      style={{
                        fontSize: "10px",
                        color: COLORS.warmGray,
                        lineHeight: 1.6,
                        maxWidth: 220,
                        margin: 0,
                      }}
                    >
                      For every late-night debug session, every shared laugh, and
                      every bug that became a feature.
                    </p>
                  </div>

                  <Ornament />
                </div>

                <PageNumber section="Dedication" pageNum={tocDedicationPage} />
              </InnerPage>

              {/* ═══ BACK COVER ═══ */}
              <HardCover isBack>
                <div
                  style={{
                    fontSize: "9px",
                    letterSpacing: "0.2em",
                    textTransform: "uppercase",
                    color: COLORS.goldLight,
                    fontFamily: "'Georgia', 'Times New Roman', serif",
                    padding: "0.35rem 0.75rem",
                    border: `1px solid ${COLORS.gold}30`,
                    borderRadius: "2px",
                    width: "100%",
                  }}
                >
                  End of Volume
                </div>

                <div
                  style={{
                    flex: 1,
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "0.75rem",
                  }}
                >
                  <Ornament />

                  {/* Crest / emblem */}
                  <div
                    style={{
                      width: 60,
                      height: 60,
                      borderRadius: "50%",
                      border: `1px solid ${COLORS.gold}50`,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <span
                      style={{
                        fontFamily: "'Georgia', 'Times New Roman', serif",
                        fontSize: "22px",
                        color: COLORS.gold,
                        fontWeight: 700,
                      }}
                    >
                      ❋
                    </span>
                  </div>

                  <h3
                    style={{
                      fontFamily: "'Georgia', 'Times New Roman', serif",
                      fontSize: "14px",
                      fontWeight: 700,
                      letterSpacing: "0.2em",
                      color: COLORS.goldLight,
                      textTransform: "uppercase",
                      margin: 0,
                    }}
                  >
                    Finis
                  </h3>

                  <div
                    style={{
                      width: 32,
                      height: 1,
                      background: `linear-gradient(to right, transparent, ${COLORS.gold}50, transparent)`,
                    }}
                  />

                  <p
                    style={{
                      fontFamily: "'Georgia', 'Times New Roman', serif",
                      fontSize: "10px",
                      color: COLORS.warmGray,
                      letterSpacing: "0.08em",
                      textAlign: "center",
                      lineHeight: 1.8,
                      maxWidth: 200,
                      margin: 0,
                    }}
                  >
                    All chapters closed.
                    <br />
                    Graduation complete.
                    <br />
                    Class of 2026, signed with love.
                  </p>

                  <Ornament />
                </div>

                <p
                  style={{
                    fontFamily: "'Georgia', 'Times New Roman', serif",
                    fontSize: "8px",
                    color: COLORS.warmGray,
                    fontStyle: "italic",
                  }}
                >
                  © CSE Class of 2026 · All rights reserved.
                </p>
              </HardCover>
            </div>

            {/* Spine Center Crease */}
            {currentPage > 0 && currentPage < totalPages - 1 && (
              <div
                style={{
                  position: "absolute",
                  top: 4,
                  bottom: 4,
                  left: "50%",
                  transform: "translateX(-50%)",
                  width: 6,
                  background:
                    "linear-gradient(to right, rgba(60,40,20,0.2), transparent, rgba(60,40,20,0.2))",
                  zIndex: 20,
                  pointerEvents: "none",
                }}
              />
            )}

            {/* Satin bookmark ribbon */}
            {currentPage > 0 && currentPage < totalPages - 1 && (
              <div
                className="flipbook-bookmark"
                style={{
                  position: "absolute",
                  right: 20,
                  top: 0,
                  height: "40%",
                  width: 5,
                  background: `linear-gradient(to bottom, ${COLORS.gold}, ${COLORS.goldDim})`,
                  boxShadow: "1px 1px 3px rgba(0,0,0,0.3)",
                  zIndex: 20,
                  borderRadius: "0 0 2px 2px",
                  pointerEvents: "none",
                  clipPath:
                    "polygon(0 0, 100% 0, 100% calc(100% - 5px), 50% 100%, 0 calc(100% - 5px))",
                  animation: "bookmark-float 6s ease-in-out infinite",
                }}
              />
            )}
          </div>
        </div>

        {/* ─── BOTTOM NAVIGATION ─── */}
        {!loading && (
          <div className="flipbook-nav">
            {/* Arrow buttons */}
            <div className="flipbook-nav__arrows">
              <button
                className="flipbook-nav-btn"
                disabled={currentPage === 0}
                onClick={() => pageFlipInstance?.flipPrev()}
                aria-label="Previous page"
              >
                <ChevronLeft size={16} />
              </button>

              <span className="flipbook-nav__counter">
                {currentPage + 1} / {totalPages}
              </span>

              <button
                className="flipbook-nav-btn"
                disabled={currentPage === totalPages - 1}
                onClick={() => pageFlipInstance?.flipNext()}
                aria-label="Next page"
              >
                <ChevronRight size={16} />
              </button>
            </div>

            {/* Slider + hint */}
            <div className="flipbook-nav__slider-area">
              <div className="flipbook-nav__kbd-hint">
                <Keyboard size={12} />
                <span>← → keys</span>
              </div>

              <div className="flipbook-nav__slider">
                <span className="flipbook-nav__slider-label">Jump:</span>
                <input
                  type="range"
                  min="0"
                  max={totalPages - 1}
                  value={currentPage}
                  onChange={(e) => {
                    const val = parseInt(e.target.value)
                    pageFlipInstance?.turnToPage(val)
                  }}
                  className="flipbook-range"
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
