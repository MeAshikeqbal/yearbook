import React, { useEffect } from "react"
import { Eye, Terminal, Cpu, Bug, Coffee, Calendar, Layers, Code2 } from "lucide-react"
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
      <div className="space-y-6 lg:sticky lg:top-20 w-full">
        {/* Title */}
        <div className="flex items-center gap-2 border-b border-border pb-3">
          <Eye className="h-4 w-4 text-primary" />
          <h3 className="font-mono text-xs font-semibold text-foreground">Live Sandbox Compilation (Advanced Mode)</h3>
        </div>

        {/* Sandbox container with raw HTML rendered directly into flow */}
        <div className="preview-card-wrapper p-6 border border-border bg-background rounded-xl relative overflow-auto max-h-[600px] w-full text-left">
          <div dangerouslySetInnerHTML={{ __html: customHtml || "<p className='font-mono text-xs text-muted-foreground'>Compile index.html to view output.</p>" }} />
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 lg:sticky lg:top-20">
      
      {/* Title */}
      <div className="flex items-center gap-2 border-b border-border pb-3">
        <Eye className="h-4 w-4 text-primary" />
        <h3 className="font-mono text-xs font-semibold text-foreground">Live Sandbox Compilation</h3>
      </div>

      {/* Simulated profile view rendering the card */}
      <div className="preview-card-wrapper p-6 border border-border bg-background rounded-xl flex flex-col items-center justify-center space-y-6">
        
        {/* Profile Card Mock */}
        <div className="profile-card w-full max-w-[280px]">
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
            behindGlowColor="rgba(124, 58, 237, 0.25)"
            behindGlowSize="50%"
          />
        </div>

        {/* Bento Grid preview in Sandbox */}
        <div className="w-full grid grid-cols-1 sm:grid-cols-2 gap-4 border-t border-border/40 pt-6">
          {blocks.map((block: any) => {
            const spanClass = block.colSpan === 3 || block.colSpan === 2
              ? "sm:col-span-2"
              : "sm:col-span-1"

            let HeaderIcon = Terminal
            if (block.type === "skills") HeaderIcon = Cpu
            else if (block.type === "projects") HeaderIcon = Layers
            else if (block.type === "timeline") HeaderIcon = Calendar
            else if (block.type === "metrics") HeaderIcon = Cpu
            else if (block.type === "code") HeaderIcon = Code2

            return (
              <Card key={block.id} className={`${spanClass} border-border bg-card text-left`}>
                <CardHeader className="border-b border-border/50 py-2.5 px-4 flex flex-row items-center gap-1.5">
                  <HeaderIcon className="h-3.5 w-3.5 text-primary" />
                  <CardTitle className="text-[10px] font-bold font-mono uppercase tracking-wider">
                    {block.title || "block_section"}
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4 font-mono text-[11px] leading-normal">
                  {block.type === "markdown" && (
                    <ShortcodeParser text={block.content || ""} />
                  )}

                  {block.type === "code" && (
                    <div className="w-full h-full min-h-[180px] rounded-md overflow-hidden border border-border bg-black/40 relative">
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
                        className="w-full h-full min-h-[180px] border-0"
                        loading="lazy"
                      />
                    </div>
                  )}

                  {block.type === "skills" && block.skills && (
                    <div className="flex flex-wrap gap-1.5 pt-0.5">
                      {block.skills.map((skill: string, sIdx: number) => (
                        <span
                          key={sIdx}
                          className="px-1.5 py-0.5 bg-primary/10 border border-primary/20 text-primary rounded-md text-[9px] font-mono"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  )}

                  {block.type === "projects" && block.projects && (
                    <div className="grid grid-cols-1 gap-2 pt-0.5">
                      {block.projects.map((proj: any, pIdx: number) => (
                        <div
                          key={pIdx}
                          className="p-2 border border-border bg-background/50 rounded-md flex flex-col justify-between"
                        >
                          <div className="flex justify-between items-center">
                            <span className="font-bold text-[10px] text-foreground font-sans">
                              {proj.title}
                            </span>
                          </div>
                          <p className="text-[9px] text-muted-foreground mt-0.5 leading-snug">
                            {proj.description}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}

                  {block.type === "timeline" && block.items && (
                    <div className="space-y-2.5 pt-0.5 pl-0.5">
                      {block.items.map((item: any, tIdx: number) => (
                        <div
                          key={tIdx}
                          className="flex gap-2 text-[10px] border-l border-border pl-2 ml-0.5 relative last:pb-0 pb-1"
                        >
                          <div className="absolute -left-[3.5px] top-1 h-1.5 w-1.5 rounded-full bg-primary" />
                          <div>
                            <span className="text-[8px] text-muted-foreground block font-mono">
                              {item.date}
                            </span>
                            <span className="font-semibold text-foreground text-[10px] font-sans">
                              {item.title}
                            </span>
                            <span className="text-muted-foreground text-[9px] block mt-0.5 leading-snug">
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
                        <p className="text-[9px] text-muted-foreground">No diagnostics compiled.</p>
                      ) : (
                        <div className="grid grid-cols-2 gap-2">
                          {Object.entries(statsObj).map(([key, val]) => {
                            let Icon = Cpu
                            let color = "text-primary"
                            if (key.toLowerCase().includes("bug")) {
                              Icon = Bug
                              color = "text-destructive"
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
                                className="p-2 rounded-md border border-border bg-background/50 flex flex-col justify-between h-14 shadow-3xs"
                              >
                                <span
                                  className="text-[8px] text-muted-foreground uppercase tracking-wider truncate"
                                  title={key}
                                >
                                  {key.replace(/([A-Z])/g, " $1").trim()}
                                </span>
                                <div className="flex items-end justify-between mt-0.5">
                                  <span className="text-xs font-bold text-foreground truncate max-w-[75%]">
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
      </div>
    </div>
  )
}
