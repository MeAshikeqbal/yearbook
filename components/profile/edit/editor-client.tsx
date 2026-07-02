"use client"

import React, { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { getCsrfToken } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Save, Terminal, Loader2, ArrowLeft, Folder, FileCode, Code2, Layers, User, Cpu } from "lucide-react"

// Import custom components locally
import { ConfigForm } from "./config-form"
import { MetricsEditor } from "./metrics-editor"
import { LiveSandbox } from "./live-sandbox"
import { BlockManager } from "./block-manager"
import { MatrixTransition } from "./matrix-transition"

import { AutocompleteTextarea } from "@/components/ui/autocomplete-textarea"

const DEFAULT_CSS_TEMPLATE = `/* ==========================================================================
   Default Profile Card & Page Custom CSS Override Template
   ========================================================================== */

/* Scoped target: The student profile container */
.student-profile-wrapper {
  /* background: radial-gradient(circle at top, rgba(124, 58, 237, 0.05) 0%, transparent 80%); */
}

/* Scoped target: The card container wrapper (holds the glow) */
.profile-card {
  /* Custom hover adjustments */
  /* transform: rotate(-0.5deg); */
}

/* Scoped target: The actual visible card body (glass box) */
.profile-card-inner {
  /* CSS Custom Variables overrides */
  /* --card-bg: linear-gradient(135deg, #1f1f2e, #2e1f3d); */
  /* --card-border-color: #ec4899; */
  /* --card-border-width: 2px; */
  /* --behind-glow-color: rgba(236, 72, 153, 0.35); */
  /* --behind-glow-size: 60%; */
}

/* Target name header inside card */
.profile-card h3 {
  /* letter-spacing: 0.05em; */
}

/* Target subtitle/role inside card */
.profile-card p {
  /* opacity: 0.85; */
}

/* Target action trigger button */
.profile-card button {
  /* border-radius: 6px; */
}
`;

interface StudentData {
  username: string
  name: string
  role: string
  bio: string
  avatarUrl: string
  github: string
  linkedin: string
  customCss: string
  stats: Record<string, any>
}

interface ProfileEditorClientProps {
  initialData: StudentData
}

interface StatItem {
  key: string
  val: string | number
}

type TabType = "identity" | "metrics" | "bento" | "style"

export default function ProfileEditorClient({ initialData }: ProfileEditorClientProps) {
  const router = useRouter()
  
  // Shared States
  const [name, setName] = useState<string>(initialData.name)
  const [role, setRole] = useState<string>(initialData.role)
  const [bio, setBio] = useState<string>(initialData.bio)
  const [avatarUrl, setAvatarUrl] = useState<string>(initialData.avatarUrl)
  const [github, setGithub] = useState<string>(initialData.github)
  const [linkedin, setLinkedin] = useState<string>(initialData.linkedin)
  const [customCss, setCustomCss] = useState<string>(initialData.customCss || DEFAULT_CSS_TEMPLATE)

  const initialBlocks = initialData.stats.blocks || [
    {
      id: "default-bio",
      type: "markdown",
      title: "system.bio",
      content: initialData.bio || "No biography provided yet.",
      colSpan: 2,
    },
    {
      id: "default-stats",
      type: "metrics",
      title: "compilation_metrics",
      colSpan: 1,
    }
  ]
  const [blocks, setBlocks] = useState<any[]>(initialBlocks)

  const [advanceMode, setAdvanceMode] = useState<boolean>(initialData.stats.advanceMode || false)
  const [customHtml, setCustomHtml] = useState<string>(
    initialData.stats.customHtml || 
    `<div class="p-8 font-mono text-center max-w-xl mx-auto border border-white/10 bg-black/40 rounded-xl mt-12 shadow-2xl">
  <h1 class="text-3xl font-bold text-sky-400 mb-2">Welcome to my profile</h1>
  <p class="text-gray-400 text-sm">This is my custom-built portfolio page.</p>
</div>`
  )
  const [customJs, setCustomJs] = useState<string>(
    initialData.stats.customJs || 
    `console.log("Welcome to my custom yearbook page!");`
  )
  const [activeFile, setActiveFile] = useState<"html" | "css" | "js">("html")

  const initialStats = Object.entries(initialData.stats)
    .filter(([k]) => k !== "blocks" && k !== "advanceMode" && k !== "customHtml" && k !== "customJs")
    .map(([k, v]) => ({ key: k, val: v as string | number }))
  const [stats, setStats] = useState<StatItem[]>(initialStats)

  // Redesigned local state
  const [activeTab, setActiveTab] = useState<TabType>("identity")
  const [showMatrixTransition, setShowMatrixTransition] = useState<boolean>(false)

  const handleToggleAdvanceMode = () => {
    if (!advanceMode) {
      setShowMatrixTransition(true)
      setAdvanceMode(true)
    } else {
      setAdvanceMode(false)
    }
  }

  // Script evaluator side effect inside the editor-client for Advanced Mode JS execution
  useEffect(() => {
    if (!advanceMode || !customJs) return

    const scriptId = "sandbox-fullscreen-script"
    // Remove previous script
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

  // Status States
  const [saving, setSaving] = useState<boolean>(false)
  const [uploading, setUploading] = useState<boolean>(false)
  const [error, setError] = useState<string>("")

  const handleSave = async (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    setSaving(true)
    setError("")

    // Convert stats array back to JSON object
    const statsObj: Record<string, any> = {}
    stats.forEach((s) => {
      const isNumber = /^\d+$/.test(s.val.toString())
      statsObj[s.key] = isNumber ? parseInt(s.val.toString(), 10) : s.val
    })
    statsObj["blocks"] = blocks
    statsObj["advanceMode"] = advanceMode
    statsObj["customHtml"] = customHtml
    statsObj["customJs"] = customJs

    try {
      const csrfToken = await getCsrfToken();
      const res = await fetch("/api/profile/save", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "x-csrf-token": csrfToken || "",
        },
        body: JSON.stringify({
          username: initialData.username,
          name,
          role,
          bio,
          avatarUrl,
          github,
          linkedin,
          customCss,
          stats: statsObj,
        }),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || "Failed to update profile.")
      }

      router.push(`/profile/${initialData.username}`)
      router.refresh()
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to save profile changes.")
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="relative min-h-svh bg-background text-foreground py-8 md:py-12 overflow-x-hidden">
      
      {/* Background gradients */}
      <div className="absolute top-1/4 left-10 w-96 h-96 bg-primary/5 rounded-full blur-3xl -z-10 pointer-events-none" />
      <div className="absolute bottom-1/4 right-10 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl -z-10 pointer-events-none" />

      {/* Raw CSS injection for live preview */}
      {customCss && (
        <style
          dangerouslySetInnerHTML={{
            __html: customCss,
          }}
        />
      )}

      {/* MATRIX ANIMATION OVERLAY PORTAL */}
      {showMatrixTransition && (
        <MatrixTransition onComplete={() => setShowMatrixTransition(false)} />
      )}

      {/* FULL SCREEN ADVANCED IDE LAYOUT */}
      {advanceMode && !showMatrixTransition && (
        <div className="fixed inset-0 z-50 bg-[#1e1e1e] flex flex-col text-gray-300 font-mono select-none">
          
          {/* Header Bar */}
          <div className="bg-[#2d2d2d] border-b border-[#1e1e1e] h-12 flex items-center justify-between px-4">
            <div className="flex items-center gap-3">
              <span className="text-xs font-bold text-gray-400">workspace: yearbook</span>
              <span className="text-gray-600">/</span>
              <span className="text-xs text-purple-400 font-bold bg-purple-500/10 px-2 py-0.5 border border-purple-500/20 rounded-md">
                ADVANCED IDE
              </span>
            </div>

            <div className="flex items-center gap-3">
              {/* Premium Toggle Switch in IDE */}
              <div className="flex items-center gap-2 bg-[#1c1c1c] border border-neutral-800 px-3 py-1 rounded-md">
                <span className="text-[10px] text-neutral-400 font-mono">Advanced Mode</span>
                <button
                  type="button"
                  onClick={handleToggleAdvanceMode}
                  className={`relative inline-flex h-4.5 w-8.5 shrink-0 cursor-pointer rounded-full border border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                    advanceMode ? "bg-[#22c55e]" : "bg-neutral-800"
                  }`}
                >
                  <span
                    className={`pointer-events-none inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                      advanceMode ? "translate-x-3.5" : "translate-x-0"
                    }`}
                  />
                </button>
              </div>
              <span className="text-gray-700">|</span>
              <Button
                type="button"
                onClick={() => handleSave()}
                className="bg-purple-600 hover:bg-purple-700 text-white font-mono text-xs h-8 px-4"
                disabled={saving || uploading}
              >
                {saving ? (
                  <>
                    <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" /> saving...
                  </>
                ) : (
                  <>
                    <Save className="mr-1.5 h-3.5 w-3.5" /> Save changes
                  </>
                )}
              </Button>
              <Button
                type="button"
                variant="ghost"
                className="font-mono text-xs h-8 text-gray-400 hover:text-white hover:bg-white/5"
                onClick={() => router.back()}
              >
                Cancel
              </Button>
            </div>
          </div>

          {/* Workspace Panels Split Layout */}
          <div className="flex-1 flex overflow-hidden">
            
            {/* Left Panel: VS Code IDE Editor (50% Width) */}
            <div className="w-1/2 flex flex-col border-r border-[#1e1e1e] bg-[#181818] overflow-hidden min-w-0">
              {/* Tabs Header */}
              <div className="bg-[#2d2d2d] flex items-center justify-between border-b border-[#1e1e1e] h-9">
                <div className="flex overflow-x-auto scrollbar-none">
                  <button
                    type="button"
                    onClick={() => setActiveFile("html")}
                    className={`flex items-center gap-1.5 px-4 h-9 text-xs border-r border-[#1e1e1e] transition-colors ${
                      activeFile === "html"
                        ? "bg-[#1e1e1e] text-white border-t-2 border-purple-500 font-semibold"
                        : "bg-[#2d2d2d] text-gray-400 hover:bg-[#2a2a2a] hover:text-gray-200"
                    }`}
                  >
                    <Code2 className="h-3.5 w-3.5 text-orange-400" />
                    index.html
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveFile("css")}
                    className={`flex items-center gap-1.5 px-4 h-9 text-xs border-r border-[#1e1e1e] transition-colors ${
                      activeFile === "css"
                        ? "bg-[#1e1e1e] text-white border-t-2 border-purple-500 font-semibold"
                        : "bg-[#2d2d2d] text-gray-400 hover:bg-[#2a2a2a] hover:text-gray-200"
                    }`}
                  >
                    <Terminal className="h-3.5 w-3.5 text-blue-400" />
                    style.css
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveFile("js")}
                    className={`flex items-center gap-1.5 px-4 h-9 text-xs border-r border-[#1e1e1e] transition-colors ${
                      activeFile === "js"
                        ? "bg-[#1e1e1e] text-white border-t-2 border-purple-500 font-semibold"
                        : "bg-[#2d2d2d] text-gray-400 hover:bg-[#2a2a2a] hover:text-gray-200"
                    }`}
                  >
                    <FileCode className="h-3.5 w-3.5 text-yellow-400" />
                    script.js
                  </button>
                </div>
              </div>

              {/* Sidebar + Editor Split */}
              <div className="flex-1 flex overflow-hidden min-h-0">
                
                {/* Explorer Sidebar */}
                <div className="w-44 bg-[#252526] border-r border-[#1e1e1e] hidden sm:flex flex-col text-[11px] p-2">
                  <span className="font-bold text-gray-500 uppercase tracking-wider text-[9px] block mb-2 px-2">
                    Explorer
                  </span>
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-1 text-gray-400 font-bold px-2 py-0.5">
                      <Folder className="h-3.5 w-3.5 text-purple-400 fill-purple-400/20" />
                      <span>profile-layout</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setActiveFile("html")}
                      className={`flex items-center gap-1.5 w-full text-left pl-6 pr-2 py-1 rounded-sm ${
                        activeFile === "html" ? "bg-[#37373d] text-white font-medium" : "text-gray-400 hover:bg-[#2a2d2e]"
                      }`}
                    >
                      <Code2 className="h-3.5 w-3.5 text-orange-400" />
                      <span>index.html</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveFile("css")}
                      className={`flex items-center gap-1.5 w-full text-left pl-6 pr-2 py-1 rounded-sm ${
                        activeFile === "css" ? "bg-[#37373d] text-white font-medium" : "text-gray-400 hover:bg-[#2a2d2e]"
                      }`}
                    >
                      <Terminal className="h-3.5 w-3.5 text-blue-400" />
                      <span>style.css</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveFile("js")}
                      className={`flex items-center gap-1.5 w-full text-left pl-6 pr-2 py-1 rounded-sm ${
                        activeFile === "js" ? "bg-[#37373d] text-white font-medium" : "text-gray-400 hover:bg-[#2a2d2e]"
                      }`}
                    >
                      <FileCode className="h-3.5 w-3.5 text-yellow-400" />
                      <span>script.js</span>
                    </button>
                  </div>
                </div>

                {/* Editor Code Textarea */}
                <div className="flex-1 flex flex-col bg-[#1e1e1e] relative min-w-0">
                  <div className="h-6 bg-[#1e1e1e] border-b border-[#2d2d2d] flex items-center px-4 text-[10px] text-gray-500 gap-1">
                    <span>profile-layout</span>
                    <span>&gt;</span>
                    <span className="text-gray-400">
                      {activeFile === "html" ? "index.html" : activeFile === "css" ? "style.css" : "script.js"}
                    </span>
                  </div>

                  <div className="flex-1 flex overflow-y-auto min-h-0 font-mono text-[11px] leading-[20px] pb-4">
                    {/* Line Gutter */}
                    <div className="select-none text-right pr-3 text-gray-600 border-r border-[#2d2d2d] text-[10px] font-mono leading-[20px] pt-1 pl-3 w-10 bg-[#1e1e1e]">
                      {(activeFile === "html" ? customHtml : activeFile === "css" ? customCss : customJs)
                        .split("\n")
                        .map((_, i) => (
                          <div key={i} className="h-5">{i + 1}</div>
                        ))}
                    </div>

                    {/* Code Area */}
                    {activeFile === "css" ? (
                      <AutocompleteTextarea
                        className="flex-1 bg-transparent text-gray-200 resize-none outline-none border-none font-mono leading-[20px] pt-1 px-4 text-[11px] focus:ring-0 overflow-x-auto select-text selection:bg-purple-500/30 w-full h-full"
                        value={customCss}
                        onChange={setCustomCss}
                      />
                    ) : (
                      <textarea
                        className="flex-1 bg-transparent text-gray-200 resize-none outline-none border-none font-mono leading-[20px] pt-1 px-4 text-[11px] focus:ring-0 overflow-x-auto select-text selection:bg-purple-500/30"
                        value={activeFile === "html" ? customHtml : customJs}
                        onChange={(e) => {
                          if (activeFile === "html") setCustomHtml(e.target.value)
                          else setCustomJs(e.target.value)
                        }}
                        spellCheck={false}
                      />
                    )}
                  </div>
                </div>

              </div>

              {/* Status Bar */}
              <div className="h-5 bg-purple-700 text-white flex items-center justify-between px-3 text-[10px]">
                <div className="flex items-center gap-2">
                  <span className="bg-purple-800 px-1.5 py-0.5 rounded-xs font-mono font-bold text-[8px]">IDE WORKSPACE</span>
                  <span>File Edited</span>
                </div>
                <div>
                  <span>LF</span>
                  <span className="ml-2">UTF-8</span>
                  <span className="ml-2">{activeFile.toUpperCase()}</span>
                </div>
              </div>
            </div>

            {/* Right Panel: Side-by-Side Live Preview with Web Browser Frame (50% Width) */}
            <div className="w-1/2 bg-[#121212] flex flex-col overflow-hidden min-w-0 border-l border-[#2d2d2d]">
              
              {/* Mock Web Browser Address Bar */}
              <div className="bg-[#2d2d2d] h-9 border-b border-[#1e1e1e] flex items-center px-4 justify-between select-none">
                <div className="flex gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-red-500" />
                  <span className="w-2.5 h-2.5 rounded-full bg-yellow-500" />
                  <span className="w-2.5 h-2.5 rounded-full bg-green-500" />
                </div>
                <div className="bg-[#1e1e1e] rounded-md px-4 py-0.5 text-[10px] text-gray-400 font-mono flex items-center gap-1.5 w-full max-w-sm mx-auto justify-center">
                  <span>🔒</span>
                  <span>https://yearbook.dev/profile/{initialData.username}</span>
                </div>
                <div className="w-12 text-right">
                  <span className="text-[10px] text-gray-500 uppercase tracking-wider font-bold">Preview</span>
                </div>
              </div>

              {/* Mock Viewport Browser Body */}
              <div className="flex-1 overflow-auto bg-[#1a1a1a] p-8 advanced-preview-viewport">
                <div dangerouslySetInnerHTML={{ __html: customHtml || "<p class='font-mono text-xs text-muted-foreground'>Compile index.html to view output.</p>" }} />
              </div>

            </div>

          </div>

        </div>
      )}

      {/* STANDARD NORMAL MODE LAYOUT */}
      {(!advanceMode || showMatrixTransition) && (
        <div className="container mx-auto max-w-7xl px-4 md:px-6 space-y-8 animate-in fade-in duration-500">
          
          {/* Navigation / Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-white/5 pb-5">
            <div>
              <div className="flex items-center gap-2 text-3xs font-mono text-neutral-500 uppercase tracking-widest">
                <span>~</span>
                <span>/</span>
                <span>yearbook</span>
                <span>/</span>
                <span>profile</span>
                <span>/</span>
                <span className="text-primary font-bold">edit</span>
              </div>
              <h1 className="text-2xl font-black tracking-tight font-mono mt-1 text-white flex items-center gap-2">
                ./edit_profile <span className="text-xs font-mono text-neutral-600 font-normal">v1.2.0</span>
              </h1>
            </div>
            
            <div className="flex items-center gap-3">
              {/* Premium Toggle Switch in Normal Layout */}
              <div className="flex items-center gap-2.5 bg-neutral-900/60 border border-white/5 px-3 py-1.5 rounded-xl select-none transition-all hover:border-white/10">
                <span className="text-xs font-mono text-neutral-400 font-semibold">Advanced Mode</span>
                <button
                  type="button"
                  onClick={handleToggleAdvanceMode}
                  className={`relative inline-flex h-5.5 w-9.5 shrink-0 cursor-pointer rounded-full border border-transparent transition-colors duration-300 ease-in-out focus:outline-none ${
                    advanceMode ? "bg-[#22c55e] shadow-[0_0_8px_rgba(34,197,94,0.4)]" : "bg-neutral-800"
                  }`}
                >
                  <span
                    className={`pointer-events-none inline-block h-4.5 w-4.5 transform rounded-full bg-white shadow-md ring-0 transition duration-300 ease-in-out ${
                      advanceMode ? "translate-x-4" : "translate-x-0"
                    }`}
                  />
                </button>
              </div>

              <Button variant="ghost" size="sm" className="font-mono text-xs gap-1.5 border border-white/5 bg-neutral-900/20 hover:bg-neutral-900/50 hover:text-white rounded-xl h-8.5 px-3 cursor-pointer" onClick={() => router.back()}>
                <ArrowLeft className="h-4 w-4" /> Back
              </Button>
            </div>
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl p-4 text-xs font-mono">
              [SYSTEM_FAILURE]: {error}
            </div>
          )}

          {/* MAIN GRID LAYOUT */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* LEFT COLUMN: TABBED COCKPIT WORKSPACE */}
            <div className="lg:col-span-7 border border-white/5 bg-[#0a0a0a]/30 backdrop-blur-md rounded-2xl shadow-2xl relative overflow-hidden flex flex-col md:flex-row min-h-[550px]">
              
              {/* Sidebar Navigation */}
              <div className="w-full md:w-48 border-b md:border-b-0 md:border-r border-white/5 p-4 flex flex-row md:flex-col gap-1.5 shrink-0 overflow-x-auto scrollbar-none select-none">
                <span className="hidden md:block text-[9px] font-bold text-neutral-500 uppercase tracking-widest font-mono mb-2 px-2.5">
                  Cockpit Nodes
                </span>
                
                <button
                  type="button"
                  onClick={() => setActiveTab("identity")}
                  className={`flex items-center gap-2 px-3 py-2 text-xs font-mono rounded-lg transition-all w-full text-left shrink-0 cursor-pointer ${
                    activeTab === "identity"
                      ? "bg-primary/10 border border-primary/20 text-primary font-bold"
                      : "text-neutral-400 hover:text-neutral-200 hover:bg-white/5 border border-transparent"
                  }`}
                >
                  <User className="h-4 w-4 shrink-0" />
                  <span>identity.cfg</span>
                </button>
                
                <button
                  type="button"
                  onClick={() => setActiveTab("metrics")}
                  className={`flex items-center gap-2 px-3 py-2 text-xs font-mono rounded-lg transition-all w-full text-left shrink-0 cursor-pointer ${
                    activeTab === "metrics"
                      ? "bg-primary/10 border border-primary/20 text-primary font-bold"
                      : "text-neutral-400 hover:text-neutral-200 hover:bg-white/5 border border-transparent"
                  }`}
                >
                  <Cpu className="h-4 w-4 shrink-0" />
                  <span>metrics.dat</span>
                </button>
                
                <button
                  type="button"
                  onClick={() => setActiveTab("bento")}
                  className={`flex items-center gap-2 px-3 py-2 text-xs font-mono rounded-lg transition-all w-full text-left shrink-0 cursor-pointer ${
                    activeTab === "bento"
                      ? "bg-primary/10 border border-primary/20 text-primary font-bold"
                      : "text-neutral-400 hover:text-neutral-200 hover:bg-white/5 border border-transparent"
                  }`}
                >
                  <Layers className="h-4 w-4 shrink-0" />
                  <span>bento_cards</span>
                </button>
                
                <button
                  type="button"
                  onClick={() => setActiveTab("style")}
                  className={`flex items-center gap-2 px-3 py-2 text-xs font-mono rounded-lg transition-all w-full text-left shrink-0 cursor-pointer ${
                    activeTab === "style"
                      ? "bg-primary/10 border border-primary/20 text-primary font-bold"
                      : "text-neutral-400 hover:text-neutral-200 hover:bg-white/5 border border-transparent"
                  }`}
                >
                  <Terminal className="h-4 w-4 shrink-0" />
                  <span>stylesheet.css</span>
                </button>
              </div>

              {/* Central Dynamic Form Panel */}
              <div className="flex-1 p-6 md:p-8 flex flex-col justify-between min-w-0">
                <div className="flex-1 pb-8">
                  {activeTab === "identity" && (
                    <ConfigForm
                      name={name}
                      setName={setName}
                      role={role}
                      setRole={setRole}
                      bio={bio}
                      setBio={setBio}
                      avatarUrl={avatarUrl}
                      setAvatarUrl={setAvatarUrl}
                      github={github}
                      setGithub={setGithub}
                      linkedin={linkedin}
                      setLinkedin={setLinkedin}
                      uploading={uploading}
                      setUploading={setUploading}
                      setError={setError}
                    />
                  )}

                  {activeTab === "metrics" && (
                    <MetricsEditor
                      stats={stats}
                      setStats={setStats}
                      setError={setError}
                    />
                  )}

                  {activeTab === "bento" && (
                    <BlockManager
                      blocks={blocks}
                      setBlocks={setBlocks}
                    />
                  )}

                  {activeTab === "style" && (
                    <div className="space-y-4 animate-in fade-in-50 duration-300">
                      <div>
                        <h3 className="text-base font-bold text-foreground font-mono">./stylesheet_override.css</h3>
                        <p className="text-xs text-muted-foreground font-mono mt-0.5">
                          Inject scoped CSS rules directly into your profile card and bento wrappers.
                        </p>
                      </div>

                      <div className="relative rounded-lg overflow-hidden border border-white/10 bg-[#121212]">
                        <div className="h-6 bg-[#181818] border-b border-white/5 flex items-center px-4 justify-between font-mono text-[9px] text-neutral-500">
                          <span>custom_rules.css</span>
                          <span>CSS EDITOR</span>
                        </div>
                        <AutocompleteTextarea
                          rows={14}
                          className="flex w-full bg-transparent p-4 text-xs font-mono text-emerald-400 focus:outline-none resize-none leading-relaxed border-none outline-none focus-visible:ring-0 focus-visible:ring-offset-0"
                          placeholder={
                            "/* Custom CSS overrides */\n.profile-card {\n  background: linear-gradient(135deg, #1f1f2e, #2e1f3d);\n  border-color: #ec4899;\n  transform: rotate(-1deg);\n}"
                          }
                          value={customCss}
                          onChange={setCustomCss}
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* Unified Bottom Action Pane */}
                <div className="border-t border-white/5 pt-5 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-1.5 text-[10px] text-neutral-500 font-mono">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    <span>status: standing_by</span>
                  </div>
                  
                  <div className="flex gap-3">
                    <Button 
                      type="button" 
                      onClick={() => handleSave()}
                      className="h-9 px-4 font-mono text-xs bg-primary hover:bg-primary/95 text-primary-foreground rounded-lg transition-all shadow-md flex items-center gap-1.5 cursor-pointer"
                      disabled={saving || uploading}
                    >
                      {saving ? (
                        <>
                          <Loader2 className="h-3.5 w-3.5 animate-spin" /> Saving Changes...
                        </>
                      ) : (
                        <>
                          <Save className="h-3.5 w-3.5" /> Save Configuration
                        </>
                      )}
                    </Button>
                  </div>
                </div>

              </div>

            </div>

            {/* RIGHT COLUMN: LIVE INTERACTIVE PREVIEW */}
            <div className="lg:col-span-5">
              <LiveSandbox
                username={initialData.username}
                name={name}
                role={role}
                bio={bio}
                avatarUrl={avatarUrl}
                stats={stats}
                blocks={blocks}
                advanceMode={advanceMode}
                customHtml={customHtml}
                customJs={customJs}
              />
            </div>
            
          </div>

        </div>
      )}

    </div>
  )
}
