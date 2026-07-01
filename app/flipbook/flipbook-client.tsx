"use client"

import React, { useEffect, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { BookOpen, ChevronLeft, ChevronRight, Terminal, Loader2, RefreshCcw } from "lucide-react"

interface Student {
  username: string
  name: string
  role: string
  avatarUrl: string
}

interface Memory {
  id: string
  imageUrl: string
  description: string
}

interface FlipbookClientProps {
  students: Student[]
  memories: Memory[]
}

export default function FlipbookClient({ students, memories }: FlipbookClientProps) {
  const router = useRouter()
  const bookRef = useRef<HTMLDivElement>(null)
  const [loading, setLoading] = useState(true)
  const [pageFlipInstance, setPageFlipInstance] = useState<any>(null)
  const [currentPage, setCurrentPage] = useState(0)
  const [totalPages, setTotalPages] = useState(0)

  useEffect(() => {
    let instance: any = null

    const initFlipbook = async () => {
      try {
        if (!bookRef.current) return

        // Dynamically import page-flip library as it requires browser window
        const { PageFlip } = await import("page-flip")

        // Define dimensions based on viewport
        const isMobile = window.innerWidth < 768
        const width = isMobile ? 320 : 450
        const height = isMobile ? 460 : 600

        instance = new PageFlip(bookRef.current, {
          width: width,
          height: height,
          size: "stretch",
          minWidth: 280,
          maxWidth: 1000,
          minHeight: 380,
          maxHeight: 1200,
          drawShadow: true,
          flippingTime: 800,
          useMouseEvents: true,
          showCover: true,
          mobileScrollSupport: false,
        })

        // Load the HTML pages
        instance.loadFromHTML(bookRef.current.querySelectorAll(".my-page"))
        setPageFlipInstance(instance)
        setTotalPages(instance.getPageCount())
        setLoading(false)

        // Listen for page flip events
        instance.on("flip", (e: any) => {
          setCurrentPage(e.data)
        })
      } catch (err) {
        console.error("Flipbook initialization failed:", err)
        setLoading(false)
      }
    }

    // Small delay to ensure DOM is fully rendered
    const timer = setTimeout(() => {
      initFlipbook()
    }, 500)

    return () => {
      clearTimeout(timer)
      if (instance) {
        try {
          instance.destroy()
        } catch (_) {}
      }
    }
  }, [students, memories])

  // Split student directory into chunks of 4 students per page
  const chunkSize = 4
  const studentPages: Student[][] = []
  for (let i = 0; i < students.length; i += chunkSize) {
    studentPages.push(students.slice(i, i + chunkSize))
  }

  // Split memories into chunks of 2 memories per page
  const memoryChunkSize = 2
  const memoryPages: Memory[][] = []
  for (let i = 0; i < memories.length; i += memoryChunkSize) {
    memoryPages.push(memories.slice(i, i + memoryChunkSize))
  }

  return (
    <div className="min-h-svh bg-zinc-950 text-zinc-100 py-12 flex flex-col justify-between items-center select-none font-mono">
      <div className="container mx-auto max-w-5xl px-4 flex flex-col items-center gap-6">
        
        {/* Top bar info */}
        <div className="w-full flex justify-between items-center border-b border-zinc-800 pb-4">
          <div className="flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-primary" />
            <h1 className="text-sm font-semibold tracking-tight text-zinc-300">class_of_2026.bin // flipbook</h1>
          </div>
          <Button variant="ghost" size="sm" onClick={() => router.push("/browse")} className="text-xs text-zinc-400 hover:text-zinc-100 hover:bg-zinc-900 border border-zinc-850">
            [x] close_reader
          </Button>
        </div>

        {loading && (
          <div className="h-96 flex items-center justify-center">
            <div className="text-center space-y-3">
              <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
              <p className="text-xs text-zinc-400">Loading virtual binder...</p>
            </div>
          </div>
        )}

        {/* FLIPBOOK CONTAINER */}
        <div className={`relative ${loading ? "invisible h-0 overflow-hidden" : "visible"}`}>
          <div ref={bookRef} className="flipbook shadow-2xl rounded-sm overflow-hidden bg-zinc-900 border border-zinc-800">
            
            {/* PAGE 1: COVER PAGE */}
            <div className="my-page p-8 bg-zinc-900 border-r border-zinc-800 flex flex-col justify-between items-center text-center h-full relative" data-density="hard">
              <div className="border border-zinc-800 p-2 rounded-xs w-full text-2xs text-zinc-500 uppercase tracking-widest">
                Graduation Record Volume I
              </div>
              <div className="space-y-4">
                <h2 className="text-3xl font-extrabold tracking-widest text-zinc-100 mt-4 leading-relaxed">
                  CLASS OF
                  <br />
                  <span className="text-primary bg-primary/10 px-3 py-1 rounded-sm mt-2 inline-block">2026</span>
                </h2>
                <div className="w-12 h-[1px] bg-primary mx-auto" />
                <p className="text-2xs text-zinc-400 max-w-xs mx-auto uppercase tracking-wide leading-relaxed">
                  Computer Science & Engineering
                  <br />
                  Final Year Yearbook Portfolio
                </p>
              </div>
              <div className="text-3xs text-zinc-600 font-mono tracking-tighter">
                STATUS: COMPILING_SUCCESSFUL // PRESS KEY TO TURN
              </div>
            </div>

            {/* PAGE 2: FOREWORD */}
            <div className="my-page p-8 bg-zinc-900 border-l border-zinc-800 flex flex-col justify-between h-full">
              <div className="space-y-4">
                <span className="text-3xs text-primary font-mono">// 01_foreword.md</span>
                <h3 className="text-lg font-bold text-zinc-200">The Graduation Protocol</h3>
                <p className="text-xs text-zinc-400 leading-relaxed font-sans text-pretty">
                  Welcome to the digital archive of the CSE Class of 2026. This registry compiles the nodes (students), files (memories), and bugs (stories) that defined our four-year runtime at college. 
                </p>
                <div className="bg-zinc-950 p-4 border border-zinc-850 rounded-md font-mono text-2xs text-zinc-500 leading-relaxed">
                  <span className="text-emerald-500 font-semibold">import</span> &#123; memories &#125; <span className="text-emerald-500">from</span> <span className="text-amber-500">&apos;./batch-2026&apos;</span>;
                  <br />
                  <span className="text-emerald-500 font-semibold">const</span> compileYear = (memories) =&gt; &#123;
                  <br />
                  &nbsp;&nbsp;return memories.filter(bug =&gt; !resolved);
                  <br />
                  &#125;;
                </div>
              </div>
              <div className="text-3xs text-zinc-600 border-t border-zinc-850 pt-2 flex justify-between">
                <span>SECTOR_01</span>
                <span>PAGE_02</span>
              </div>
            </div>

            {/* PAGES 3+: STUDENT SPREADS */}
            {studentPages.length === 0 ? (
              <div className="my-page p-8 bg-zinc-900 flex items-center justify-center">
                <p className="text-xs text-zinc-500">Registry directory empty.</p>
              </div>
            ) : (
              studentPages.map((chunk, idx) => (
                <div key={idx} className="my-page p-8 bg-zinc-900 flex flex-col justify-between h-full border-x border-zinc-800">
                  <div className="space-y-4">
                    <span className="text-3xs text-primary font-mono">// 02_class_nodes_{idx + 1}.json</span>
                    <div className="grid grid-cols-2 gap-4">
                      {chunk.map((student) => (
                        <div key={student.username} className="p-3 bg-zinc-950 border border-zinc-850 rounded-sm flex flex-col items-center text-center space-y-2">
                          <div className="h-10 w-10 rounded-full overflow-hidden border border-zinc-800 bg-zinc-900 flex items-center justify-center">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src={student.avatarUrl} alt={student.name} className="h-full w-full object-cover" />
                          </div>
                          <div>
                            <span className="text-2xs font-semibold text-zinc-200 block truncate max-w-[140px]">{student.name}</span>
                            <span className="text-3xs text-zinc-500 font-mono block truncate max-w-[140px]">@{student.username}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="text-3xs text-zinc-600 border-t border-zinc-850 pt-2 flex justify-between">
                    <span>SECTOR_02_STUDENTS</span>
                    <span>PAGE_{idx + 3}</span>
                  </div>
                </div>
              ))
            )}

            {/* MEMORIES SPREADS */}
            {memoryPages.map((chunk, idx) => (
              <div key={idx} className="my-page p-8 bg-zinc-900 flex flex-col justify-between h-full border-x border-zinc-800">
                <div className="space-y-4">
                  <span className="text-3xs text-primary font-mono">// 03_snapshots_page_{idx + 1}.jpg</span>
                  <div className="space-y-4">
                    {chunk.map((memory) => (
                      <div key={memory.id} className="p-2 bg-zinc-950 border border-zinc-850 rounded-sm space-y-2">
                        <div className="h-28 rounded-xs overflow-hidden bg-zinc-900 flex items-center justify-center">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={memory.imageUrl} alt={memory.description} className="h-full w-full object-cover" />
                        </div>
                        <p className="text-3xs text-zinc-400 line-clamp-2 leading-relaxed">
                          {memory.description}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="text-3xs text-zinc-600 border-t border-zinc-850 pt-2 flex justify-between">
                  <span>SECTOR_03_MEMORIES</span>
                  <span>PAGE_{studentPages.length + idx + 3}</span>
                </div>
              </div>
            ))}

            {/* BACK COVER */}
            <div className="my-page p-8 bg-zinc-900 border-l border-zinc-800 flex flex-col justify-between items-center text-center h-full" data-density="hard">
              <div className="border border-zinc-800 p-2 rounded-xs w-full text-2xs text-zinc-500 uppercase tracking-widest">
                Compilation Terminates
              </div>
              <div className="space-y-3">
                <h3 className="text-xl font-bold tracking-widest text-zinc-200">SYSTEM.EXIT(0);</h3>
                <div className="w-8 h-[1px] bg-zinc-700 mx-auto" />
                <p className="text-3xs text-zinc-500 uppercase tracking-wide leading-relaxed max-w-xs mx-auto">
                  All systems closed.
                  <br />
                  Graduation complete.
                  <br />
                  Class of 2026 signed off.
                </p>
              </div>
              <div className="text-3xs text-zinc-700 font-mono tracking-tighter">
                &copy; CSE class of 2026 // all rights compiled.
              </div>
            </div>

          </div>
        </div>

        {/* NAVIGATION CONTROLS */}
        {!loading && (
          <div className="flex items-center gap-6 border-t border-zinc-850 pt-4 w-full justify-center">
            <Button
              variant="outline"
              size="sm"
              disabled={currentPage === 0}
              className="h-8 w-8 p-0 bg-zinc-900 border-zinc-800 text-zinc-300 hover:bg-zinc-800"
              onClick={() => pageFlipInstance?.flipPrev()}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            
            <div className="text-xs text-zinc-400 font-mono">
              [ {currentPage + 1} / {totalPages} ]
            </div>

            <Button
              variant="outline"
              size="sm"
              disabled={currentPage === totalPages - 1}
              className="h-8 w-8 p-0 bg-zinc-900 border-zinc-800 text-zinc-300 hover:bg-zinc-800"
              onClick={() => pageFlipInstance?.flipNext()}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        )}

      </div>
    </div>
  )
}
