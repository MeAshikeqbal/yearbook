import React, { useEffect, useState } from "react"
import { Eye, Terminal, Cpu, Bug, Coffee, Calendar, Layers, Code2, Monitor, Smartphone } from "lucide-react"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import ProfileCard from "@/components/ui/ProfileCard"
import { ShortcodeParser } from "@/components/profile/shortcode-parser"

interface StatItem {
  key: string
  val: string | number
}

interface LiveSandboxProps {
  username: string
  name: string
  role: string
  bio: string
  avatarUrl: string
  stats: StatItem[]
  blocks: any[]
  advanceMode: boolean
  customHtml: string
  customJs: string
}

export function LiveSandbox({
  username,
  name,
  role,
  bio,
  avatarUrl,
  stats,
  blocks,
  advanceMode,
  customHtml,
  customJs,
}: LiveSandboxProps) {
  const [viewport, setViewport] = useState<"desktop" | "mobile">("desktop")

  const bugsFixed = stats.find((s) => s.key.toLowerCase().includes("bug"))?.val ?? 0
  const coffeeConsumed = stats.find((s) => s.key.toLowerCase().includes("coffee") || s.key.toLowerCase().includes("chai"))?.val ?? 0

  // Evaluate customJs script tag dynamically for the editor live preview
  useEffect(() => {
    if (!advanceMode || !customJs) return

    const scriptId = "sandbox-preview-script"
    const existing = document.getElementById(scriptId)
    if (existing) existing.remove()

    const script = document.createElement("script")
    script.id = scriptId
    script.type = "text/javascript"
    script.textContent = `
      (function() {
        try {
          ${customJs}
        } catch (err) {
          console.error("[SANDBOX_JS_ERROR]:", err);
        }
      })();
    `
    document.body.appendChild(script)

    return () => {
      const scriptToRemove = document.getElementById(scriptId)
      if (scriptToRemove) scriptToRemove.remove()
    }
  }, [advanceMode, customJs])

  // Build standard JSON stats object for metrics block preview
  const statsObj: Record<string, string | number> = {}
  stats.forEach((s) => {
    statsObj[s.key] = s.val
  })

  if (advanceMode) {
    return (
      <div className="space-y-4 lg:sticky lg:top-24 w-full animate-in fade-in-50 duration-300">
        {/* Title */}
        <div className="flex items-center justify-between border-b border-white/5 pb-3">
          <div className="flex items-center gap-2">
            <Eye className="h-4 w-4 text-primary animate-pulse" />
            <h3 className="font-mono text-xs font-semibold text-foreground">live_telemetry_compiler</h3>
          </div>
          <span className="text-[9px] font-mono bg-purple-500/10 border border-purple-500/20 text-purple-400 px-2 py-0.5 rounded-md font-bold">
            INDEX.HTML PREVIEW
          </span>
        </div>

        {/* Sandbox container with raw HTML rendered directly into flow */}
        <div className="preview-card-wrapper border border-white/10 bg-black/60 rounded-xl overflow-hidden shadow-2xl relative">
          {/* Simulated Browser Header */}
          <div className="bg-[#121212] border-b border-white/5 h-8 flex items-center px-4 justify-between">
            <div className="flex gap-1.5 shrink-0">
              <span className="w-2.5 h-2.5 rounded-full bg-red-500/80" />
              <span className="w-2.5 h-2.5 rounded-full bg-yellow-500/80" />
              <span className="w-2.5 h-2.5 rounded-full bg-green-500/80" />
            </div>
            <div className="bg-black/40 rounded-md px-3 py-0.5 text-[9px] text-neutral-500 font-mono flex items-center gap-1.5 w-60 max-w-sm truncate justify-center">
              <span>🔒 localhost:3000/{username}/sandbox</span>
            </div>
            <div className="w-12 shrink-0" />
          </div>
          
          <div className="p-6 overflow-auto max-h-[500px] w-full text-left min-h-[300px]">
            <div dangerouslySetInnerHTML={{ __html: customHtml || "<p className='font-mono text-xs text-muted-foreground'>Compile index.html to view output.</p>" }} />
          </div>
        </div>
      </div>
    )
  }

  const renderBentoGrid = (isMobileView = false) => {
    return (
      <div className={`w-full grid gap-4 pt-6 ${isMobileView ? "grid-cols-1" : "grid-cols-1 sm:grid-cols-2"}`}>
        {blocks.map((block: any) => {
          const spanClass = !isMobileView && (block.colSpan === 3 || block.colSpan === 2)
            ? "sm:col-span-2"
            : "sm:col-span-1"

          let HeaderIcon = Terminal
          if (block.type === "skills") HeaderIcon = Cpu
          else if (block.type === "projects") HeaderIcon = Layers
          else if (block.type === "timeline") HeaderIcon = Calendar
          else if (block.type === "metrics") HeaderIcon = Cpu
          else if (block.type === "code") HeaderIcon = Code2

          return (
            <Card key={block.id} className={`${spanClass} border-white/5 bg-neutral-900/40 text-left backdrop-blur-md overflow-hidden relative group`}>
              <CardHeader className="border-b border-white/5 py-2.5 px-4 flex flex-row items-center gap-2">
                <HeaderIcon className="h-3.5 w-3.5 text-primary" />
                <CardTitle className="text-[10px] font-bold font-mono uppercase tracking-wider text-neutral-300">
                  {block.title || "block_section"}
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 font-mono text-[11px] leading-normal text-neutral-300">
                {block.type === "markdown" && (
                  <ShortcodeParser text={block.content || ""} />
                )}

                {block.type === "code" && (
                  <div className="w-full h-full min-h-[160px] rounded-lg overflow-hidden border border-white/5 bg-black/40 relative">
                    <iframe
                      srcDoc={`
                        <!DOCTYPE html>
                        <html>
                          <head>
                            <meta charset="utf-8">
                            <style>
                              body {
                                margin: 0;
                                padding: 12px;
                                color: #f3f4f6;
                                font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
                                font-size: 11px;
                                background: transparent;
                                line-height: 1.4;
                              }
                              ${block.css || ""}
                            </style>
                          </head>
                          <body>
                            ${block.html || ""}
                          </body>
                        </html>
                      `}
                      sandbox="allow-scripts"
                      className="w-full h-full min-h-[160px] border-0"
                      loading="lazy"
                    />
                  </div>
                )}

                {block.type === "skills" && block.skills && (
                  <div className="flex flex-wrap gap-1.5 pt-0.5">
                    {block.skills.map((skill: string, sIdx: number) => (
                      <span
                        key={sIdx}
                        className="px-2 py-0.5 bg-primary/10 border border-primary/20 text-primary rounded-md text-[9px] font-mono font-semibold"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                )}

                {block.type === "projects" && block.projects && (
                  <div className="grid grid-cols-1 gap-2.5 pt-0.5">
                    {block.projects.map((proj: any, pIdx: number) => (
                      <div
                        key={pIdx}
                        className="p-2.5 border border-white/5 bg-black/20 rounded-lg flex flex-col justify-between"
                      >
                        <span className="font-bold text-[10px] text-neutral-200 font-sans">
                          {proj.title}
                        </span>
                        <p className="text-[9px] text-neutral-500 mt-1 leading-snug">
                          {proj.description}
                        </p>
                      </div>
                    ))}
                  </div>
                )}

                {block.type === "timeline" && block.items && (
                  <div className="space-y-3 pt-0.5 pl-0.5">
                    {block.items.map((item: any, tIdx: number) => (
                      <div
                        key={tIdx}
                        className="flex gap-2.5 text-[10px] border-l border-white/10 pl-2.5 ml-0.5 relative last:pb-0 pb-1"
                      >
                        <div className="absolute -left-[3.5px] top-1.5 h-1.5 w-1.5 rounded-full bg-primary" />
                        <div>
                          <span className="text-[8px] text-neutral-500 block font-mono">
                            {item.date}
                          </span>
                          <span className="font-semibold text-neutral-200 text-[10px] font-sans">
                            {item.title}
                          </span>
                          <span className="text-neutral-500 text-[9px] block mt-0.5 leading-snug">
                            {item.description}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {block.type === "metrics" && (
                  <div className="pt-0.5">
                    {Object.keys(statsObj).length === 0 ? (
                      <p className="text-[9px] text-neutral-500">No telemetry compiled.</p>
                    ) : (
                      <div className="grid grid-cols-2 gap-2">
                        {Object.entries(statsObj).map(([key, val]) => {
                          let Icon = Cpu
                          let color = "text-primary"
                          if (key.toLowerCase().includes("bug")) {
                            Icon = Bug
                            color = "text-red-400"
                          } else if (
                            key.toLowerCase().includes("coffee") ||
                            key.toLowerCase().includes("chai")
                          ) {
                            Icon = Coffee
                            color = "text-amber-500"
                          }

                          return (
                            <div
                              key={key}
                              className="p-2 bg-black/20 rounded-lg border border-white/5 flex flex-col justify-between h-14"
                            >
                              <span
                                className="text-[8px] text-neutral-500 uppercase tracking-wider truncate"
                                title={key}
                              >
                                {key.replace(/([A-Z])/g, " $1").trim()}
                              </span>
                              <div className="flex items-end justify-between mt-0.5">
                                <span className="text-xs font-bold text-neutral-200 truncate max-w-[70%]">
                                  {val as React.ReactNode}
                                </span>
                                <Icon className={`h-3 w-3 ${color}`} />
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          )
        })}
      </div>
    )
  }

  return (
    <div className="space-y-4 lg:sticky lg:top-24 w-full animate-in fade-in-50 duration-300">
      
      {/* Viewport Control Header */}
      <div className="flex items-center justify-between border-b border-white/5 pb-3">
        <div className="flex items-center gap-2">
          <Eye className="h-4 w-4 text-primary animate-pulse" />
          <h3 className="font-mono text-xs font-semibold text-foreground">live_telemetry_compiler</h3>
        </div>
        
        {/* Toggle Switches for Viewport */}
        <div className="flex items-center bg-neutral-900/80 border border-white/5 rounded-lg p-0.5 select-none">
          <button
            type="button"
            onClick={() => setViewport("desktop")}
            className={`flex items-center gap-1 px-2.5 py-1 text-[10px] font-mono rounded-md transition-all cursor-pointer ${
              viewport === "desktop"
                ? "bg-primary text-primary-foreground font-bold shadow-xs"
                : "text-neutral-500 hover:text-neutral-200"
            }`}
          >
            <Monitor className="h-3 w-3" /> Desktop
          </button>
          <button
            type="button"
            onClick={() => setViewport("mobile")}
            className={`flex items-center gap-1 px-2.5 py-1 text-[10px] font-mono rounded-md transition-all cursor-pointer ${
              viewport === "mobile"
                ? "bg-primary text-primary-foreground font-bold shadow-xs"
                : "text-neutral-500 hover:text-neutral-200"
            }`}
          >
            <Smartphone className="h-3 w-3" /> Mobile
          </button>
        </div>
      </div>

      {/* Interactive Device Sandbox Frame */}
      {viewport === "desktop" ? (
        /* Desktop View: Side by Side Grid Layout */
        <div className="w-full border border-white/10 bg-neutral-950/40 rounded-2xl p-6 shadow-2xl relative overflow-hidden flex flex-col items-center min-h-[400px]">
          {/* Visual grid background */}
          <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.015)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.015)_1px,transparent_1px)] bg-[size:16px_16px] pointer-events-none" />
          
          <div className="relative z-10 w-full flex flex-col md:flex-row gap-6 items-start justify-center">
            {/* Profile Card Mock */}
            <div className="profile-card w-full md:w-[250px] md:sticky md:top-2 shrink-0">
              <ProfileCard
                name={name || "Your Name"}
                title={role || "CSE Student"}
                handle={username}
                status={`🐛 ${bugsFixed} / ☕ ${coffeeConsumed}`}
                contactText="GitHub Profile"
                avatarUrl={avatarUrl || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=400&h=400&fit=crop"}
                showUserInfo={true}
                enableTilt={true}
                behindGlowEnabled={true}
                behindGlowColor="rgba(124, 58, 237, 0.2)"
                behindGlowSize="50%"
              />
            </div>

            {/* Bento Grid Preview */}
            <div className="flex-1 w-full -mt-6">
              {renderBentoGrid(false)}
            </div>
          </div>
        </div>
      ) : (
        /* Mobile View: Smartphone Device Mock frame */
        <div className="w-full flex justify-center py-4">
          <div className="relative w-[340px] border-4 border-neutral-800 bg-[#0d0d0d] rounded-[32px] shadow-2xl overflow-hidden aspect-[9/18] flex flex-col">
            {/* Camera notch */}
            <div className="absolute top-2 left-1/2 -translate-x-1/2 w-28 h-4 bg-neutral-800 rounded-full z-20 flex items-center justify-center">
              <span className="w-1.5 h-1.5 bg-neutral-900 rounded-full mr-2" />
              <span className="w-6 h-1 bg-neutral-900 rounded-full" />
            </div>
            
            {/* Screen Content Wrapper */}
            <div className="flex-1 overflow-y-auto overflow-x-hidden p-4 pt-8 text-center scrollbar-none flex flex-col items-center relative">
              {/* Visual grid background */}
              <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.01)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.01)_1px,transparent_1px)] bg-[size:16px_16px] pointer-events-none" />
              
              <div className="relative z-10 w-full flex flex-col items-center">
                <div className="profile-card w-full max-w-[250px]">
                  <ProfileCard
                    name={name || "Your Name"}
                    title={role || "CSE Student"}
                    handle={username}
                    status={`🐛 ${bugsFixed} / ☕ ${coffeeConsumed}`}
                    contactText="GitHub Profile"
                    avatarUrl={avatarUrl || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=400&h=400&fit=crop"}
                    showUserInfo={true}
                    enableTilt={false}
                    behindGlowEnabled={true}
                    behindGlowColor="rgba(124, 58, 237, 0.15)"
                    behindGlowSize="45%"
                  />
                </div>
                
                {renderBentoGrid(true)}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
