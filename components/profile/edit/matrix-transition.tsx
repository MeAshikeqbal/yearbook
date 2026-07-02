"use client"

import React, { useEffect, useRef, useState } from "react"

interface MatrixTransitionProps {
  onComplete?: () => void
}

export function MatrixTransition({ onComplete }: MatrixTransitionProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [visible, setVisible] = useState(true)
  const [fading, setFading] = useState(false)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Set canvas dimensions
    const resizeCanvas = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }
    resizeCanvas()
    window.addEventListener("resize", resizeCanvas)

    // Matrix characters
    const chars = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZMODULESYSTEMCOMPILEDEBUGGERERROR"
    const charArr = chars.split("")
    const fontSize = 14
    const columns = Math.ceil(canvas.width / fontSize)
    
    // Initialize drops
    const drops: number[] = []
    for (let i = 0; i < columns; i++) {
      drops[i] = Math.random() * -100 // staggered start
    }

    let animationFrameId: number

    const draw = () => {
      // Semi-transparent black background to create trail effect
      ctx.fillStyle = "rgba(5, 5, 5, 0.15)"
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      // Green code text
      ctx.font = `bold ${fontSize}px monospace`

      for (let i = 0; i < drops.length; i++) {
        const char = charArr[Math.floor(Math.random() * charArr.length)]
        
        // Vary color slightly for depth
        const depth = Math.random()
        if (depth > 0.8) {
          ctx.fillStyle = "#ffffff" // white glow for leading characters
        } else if (depth > 0.4) {
          ctx.fillStyle = "#4ade80" // green-400
        } else {
          ctx.fillStyle = "#15803d" // green-700
        }

        const x = i * fontSize
        const y = drops[i] * fontSize

        ctx.fillText(char, x, y)

        // Reset drop to top if it goes offscreen, or if random check triggers
        if (y > canvas.height && Math.random() > 0.975) {
          drops[i] = 0
        }

        // Speed of descent
        drops[i] += 1.5
      }

      animationFrameId = requestAnimationFrame(draw)
    }

    draw()

    // Timeline of transition:
    // 1. Run full screen animation.
    // 2. At 800ms, start fading out.
    // 3. At 1300ms, complete the transition.
    const fadeTimeout = setTimeout(() => {
      setFading(true)
    }, 800)

    const endTimeout = setTimeout(() => {
      setVisible(false)
      if (onComplete) onComplete()
    }, 1300)

    return () => {
      window.removeEventListener("resize", resizeCanvas)
      cancelAnimationFrame(animationFrameId)
      clearTimeout(fadeTimeout)
      clearTimeout(endTimeout)
    }
  }, [onComplete])

  if (!visible) return null

  return (
    <div
      className={`fixed inset-0 z-9999 bg-[#050505] transition-opacity duration-500 flex items-center justify-center ${
        fading ? "opacity-0 pointer-events-none" : "opacity-100"
      }`}
    >
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full block" />
      <div className="relative z-10 font-mono text-center select-none pointer-events-none">
        <h2 className="text-2xl font-bold tracking-[0.25em] text-[#22c55e] animate-pulse">
          INITIALIZING_PORTAL
        </h2>
        <p className="text-xs text-[#22c55e]/60 mt-2 font-mono">
          Redirecting to Advanced Matrix Workspace...
        </p>
      </div>
    </div>
  )
}
