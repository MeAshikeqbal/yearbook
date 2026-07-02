"use client"

import React, { useState } from "react"
import Link from "next/link"
import { Terminal, Cpu, Code2, ShieldAlert, ArrowLeft, Copy, Check, BookOpen, Layers, Network } from "lucide-react"

export default function DocsPage() {
  const [activeTab, setActiveTab] = useState<"api" | "css">("api")
  const [copiedTextId, setCopiedTextId] = useState<string | null>(null)

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text)
    setCopiedTextId(id)
    setTimeout(() => setCopiedTextId(null), 2000)
  }

  const curlExample = `curl -H "Accept: text/plain" http://localhost:3000/api/students/admin`
  
  const cssExamples = [
    {
      id: "css-neon",
      title: "1. Cyber Neon Pink Theme",
      description: "Applies a neon pink/purple design using CSS variable overrides on the card wrapper.",
      code: `.profile-card {
  /* Override variables */
  --card-bg: linear-gradient(135deg, #180b24 0%, #3a1c54 100%);
  --card-border-color: #ec4899;
  --card-border-width: 2px;
  --behind-glow-color: rgba(236, 72, 153, 0.4);
  --behind-glow-size: 60%;
}

/* Add custom neon glow to the header */
.profile-card h3 {
  text-shadow: 0 0 8px #ec4899;
}`
    },
    {
      id: "css-terminal",
      title: "2. Retro Green Terminal",
      description: "Transforms the card into a classic matrix terminal box.",
      code: `.profile-card {
  /* Override variables */
  --card-bg: #050505;
  --card-border-color: #22c55e;
  --card-border-width: 2px;
  --behind-glow-color: rgba(34, 197, 94, 0.2);
}

/* Custom monospace text overrides */
.profile-card h3 {
  font-family: monospace;
  color: #22c55e !important;
  text-shadow: 0 0 5px #22c55e;
}

.profile-card p {
  color: #15803d !important;
}

.profile-card button {
  background: #14532d !important;
  border-color: #22c55e !important;
  color: #22c55e !important;
}`
    },
    {
      id: "css-bg",
      title: "3. Page Background Grid & Pill Button",
      description: "Styles the whole page container with a dark cyber background grid and styles the button to be a pill.",
      code: `/* Style the entire page container */
.student-profile-wrapper {
  background-image: 
    radial-gradient(circle at 50% 20%, rgba(139, 92, 246, 0.08) 0%, transparent 60%),
    linear-gradient(to right, rgba(255, 255, 255, 0.03) 1px, transparent 1px),
    linear-gradient(to bottom, rgba(255, 255, 255, 0.03) 1px, transparent 1px);
  background-size: 100% 100%, 20px 20px, 20px 20px;
}

/* Style card button as a rounded pill */
.profile-card button {
  border-radius: 9999px !important;
  background-color: var(--primary) !important;
  color: var(--primary-foreground) !important;
}`
    }
  ]

  const apiEndpoints = [
    {
      method: "GET",
      path: "/api/students/[username]",
      description: "Retrieves student profile card data. Supports JSON response or formatted plain text ASCII art for terminals.",
      auth: "None",
      headers: [
        { name: "Accept", val: "text/plain (forces ASCII art terminal card)", required: false },
      ],
      params: [
        { name: "format", val: "Set to 'text' to output ASCII art", required: false },
        { name: "cli", val: "Set to 'true' to output ASCII art", required: false },
      ],
      response: `{
  "username": "admin",
  "name": "Class Admin",
  "role": "Super User / Site Overseer",
  "bio": "DevOps Architect & System Administrator",
  "avatarUrl": "https://r2.yearbook.site/avatars/admin.png",
  "socials": {
    "github": "https://github.com/admin",
    "linkedin": "https://linkedin.com/in/admin"
  },
  "stats": {
    "bugsFixed": 312,
    "coffeeConsumed": 142
  }
}`
    },
    {
      method: "POST",
      path: "/api/profile/save",
      description: "Saves profile details, custom statistics metrics, and custom stylesheet code. Revalidates Next.js router cache automatically.",
      auth: "Owner of profile OR Admin role",
      headers: [
        { name: "Content-Type", val: "application/json", required: true },
      ],
      payload: `{
  "username": "johndoe",
  "name": "John Doe",
  "role": "Fullstack Developer",
  "bio": "Building scalable web products...",
  "avatarUrl": "https://r2.yearbook.site/avatars/john.png",
  "github": "https://github.com/johndoe",
  "linkedin": "https://linkedin.com/in/johndoe",
  "customCss": ".profile-card { border-color: red; }",
  "stats": {
    "bugsFixed": 42,
    "coffeeConsumed": 150
  }
}`,
      response: `{
  "success": true,
  "message": "Profile updated successfully"
}`
    },
    {
      method: "POST",
      path: "/api/upload-url",
      description: "Generates a secure, temporary pre-signed PUT URL to upload assets directly to Cloudflare R2 object storage.",
      auth: "Approved Student OR Admin",
      payload: `{
  "filename": "myphoto.png",
  "contentType": "image/png",
  "folder": "avatars"
}`,
      response: `{
  "uploadUrl": "https://yearbook.r2.cloudflarestorage.com/avatars/myphoto.png?X-Amz-Signature=...",
  "publicUrl": "https://r2.yearbook.site/avatars/admin-1782897.png",
  "key": "avatars/admin-1782897.png"
}`
    },
    {
      method: "GET / POST",
      path: "/api/memories",
      description: "GET retrieves all shared yearbook memories in chronological order. POST creates a new memory album entry (requires Approved/Admin session).",
      auth: "GET: None | POST: Approved Student OR Admin",
      payload: `// POST Request Body
{
  "imageUrl": "https://r2.yearbook.site/memories/photo.png",
  "description": "Graduation ceremony class picture!",
  "date": "2026-06-30T10:00:00.000Z",
  "location": "Main Campus Quad"
}`,
      response: `// POST 201 Response
{
  "success": true,
  "memory": {
    "id": "cm475...",
    "imageUrl": "https://r2.yearbook.site/memories/photo.png",
    "description": "Graduation ceremony...",
    "uploadedBy": "usr-9382",
    "uploaderName": "John Doe",
    "createdAt": "2026-07-01T09:21:00Z"
  }
}`
    }
  ]

  return (
    <div className="min-h-svh bg-background text-foreground py-8 md:py-16 font-mono text-sm leading-relaxed relative">
      
      {/* Background glowing rings */}
      <div className="absolute top-20 left-1/3 w-96 h-96 bg-primary/10 rounded-full blur-3xl pointer-events-none z-0" />
      <div className="absolute bottom-20 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl pointer-events-none z-0" />

      <div className="container mx-auto max-w-5xl px-4 md:px-6 space-y-8 relative z-10">
        
        {/* Navigation Header */}
        <div className="flex justify-between items-center border-b border-border pb-4">
          <Link href="/browse" className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="h-4 w-4" /> ../directory
          </Link>
          <div className="flex items-center gap-2 text-primary">
            <BookOpen className="h-4 w-4" />
            <span className="text-xs font-semibold">docs_portal_v1.0</span>
          </div>
        </div>

        {/* Dashboard Title Banner */}
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight text-foreground font-sans">system_specifications</h1>
          <p className="text-muted-foreground text-sm max-w-2xl font-mono">
            Documentation regarding the Yearbook Class Portal API endpoints, database structures, and cascading CSS styling hooks.
          </p>
        </div>

        {/* Toggle Tabs */}
        <div className="flex gap-2 border-b border-border/60 pb-px">
          <button
            onClick={() => setActiveTab("api")}
            className={`flex items-center gap-2 px-4 py-2 border-b-2 text-xs font-semibold transition-all -mb-px ${
              activeTab === "api"
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            <Network className="h-4 w-4" /> API Endpoints Reference
          </button>
          <button
            onClick={() => setActiveTab("css")}
            className={`flex items-center gap-2 px-4 py-2 border-b-2 text-xs font-semibold transition-all -mb-px ${
              activeTab === "css"
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            <Layers className="h-4 w-4" /> CSS Customization Engine
          </button>
        </div>

        {/* TAB CONTENTS */}
        {activeTab === "api" ? (
          <div className="space-y-8">
            
            {/* Terminal Command Callout */}
            <div className="bg-black/50 border border-primary/20 rounded-lg p-5 space-y-3 relative overflow-hidden backdrop-blur-md">
              <div className="absolute top-0 right-0 p-2 bg-primary/10 border-l border-b border-primary/20 text-3xs text-primary font-bold">
                CLI INTERACTIVE MODE
              </div>
              <div className="flex items-center gap-2 text-primary">
                <Terminal className="h-4 w-4 animate-pulse" />
                <span className="font-bold text-xs">Try retrieving profiles from your local shell:</span>
              </div>
              <div className="flex items-center justify-between bg-black/70 border border-border p-3 rounded-md">
                <code className="text-xs text-emerald-400 select-all">{curlExample}</code>
                <button
                  onClick={() => handleCopy(curlExample, "curl")}
                  className="text-muted-foreground hover:text-foreground p-1 transition-colors"
                >
                  {copiedTextId === "curl" ? <Check className="h-4 w-4 text-emerald-400" /> : <Copy className="h-4 w-4" />}
                </button>
              </div>
              <p className="text-3xs text-muted-foreground">
                Passing <code className="text-primary font-bold">Accept: text/plain</code> or parameter <code className="text-primary font-bold">?cli=true</code> bypasses JSON responses to output an ASCII-art rendering of the student's profile directly to standard output.
              </p>
            </div>

            {/* List of APIs */}
            <div className="space-y-6">
              {apiEndpoints.map((endpoint, idx) => (
                <div key={idx} className="bg-card border border-border rounded-lg overflow-hidden">
                  
                  {/* Method Header Bar */}
                  <div className="border-b border-border/50 py-3 px-5 flex items-center justify-between bg-muted/30">
                    <div className="flex items-center gap-3">
                      <span className={`px-2 py-0.5 rounded-sm text-3xs font-extrabold select-none ${
                        endpoint.method.startsWith("GET") ? "bg-primary/20 text-primary border border-primary/30" : "bg-purple-500/20 text-purple-400 border border-purple-500/30"
                      }`}>
                        {endpoint.method}
                      </span>
                      <span className="font-bold text-xs text-foreground">{endpoint.path}</span>
                    </div>
                    <span className="flex items-center gap-1 text-3xs text-muted-foreground bg-black/40 px-2 py-1 rounded-sm">
                      <ShieldAlert className="h-3.5 w-3.5 text-amber-500" /> Auth: {endpoint.auth}
                    </span>
                  </div>

                  {/* Body Specs */}
                  <div className="p-5 space-y-4">
                    <p className="text-xs text-muted-foreground leading-relaxed">{endpoint.description}</p>

                    {/* Headers & Params table */}
                    {((endpoint.headers && endpoint.headers.length > 0) || (endpoint.params && endpoint.params.length > 0)) && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {endpoint.headers && (
                          <div className="space-y-1.5">
                            <span className="text-3xs font-bold text-muted-foreground uppercase tracking-wide">Request Headers</span>
                            <div className="border border-border rounded-md overflow-hidden text-3xs">
                              {endpoint.headers.map((h, i) => (
                                <div key={i} className="flex justify-between bg-black/30 p-2 border-b border-border last:border-b-0">
                                  <span className="font-bold">{h.name}</span>
                                  <span className="text-muted-foreground">{h.val}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {endpoint.params && (
                          <div className="space-y-1.5">
                            <span className="text-3xs font-bold text-muted-foreground uppercase tracking-wide">Query Parameters</span>
                            <div className="border border-border rounded-md overflow-hidden text-3xs">
                              {endpoint.params.map((p, i) => (
                                <div key={i} className="flex justify-between bg-black/30 p-2 border-b border-border last:border-b-0">
                                  <span className="font-bold">?{p.name}</span>
                                  <span className="text-muted-foreground">{p.val}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Payloads tabs */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      
                      {/* Body Payload (if any) */}
                      {endpoint.payload && (
                        <div className="space-y-1.5">
                          <span className="text-3xs font-bold text-muted-foreground uppercase tracking-wide">Request Body (JSON)</span>
                          <div className="relative">
                            <pre className="bg-black/60 border border-border/80 rounded-md p-3 text-3xs text-emerald-400 overflow-x-auto max-h-60 leading-normal">
                              {endpoint.payload}
                            </pre>
                            <button
                              onClick={() => handleCopy(endpoint.payload || "", `req-${idx}`)}
                              className="absolute top-2 right-2 text-muted-foreground hover:text-foreground p-1 bg-black/80 rounded-sm border border-border/40 transition-all"
                            >
                              {copiedTextId === `req-${idx}` ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
                            </button>
                          </div>
                        </div>
                      )}

                      {/* Response Payload */}
                      <div className={`space-y-1.5 ${!endpoint.payload ? "md:col-span-2" : ""}`}>
                        <span className="text-3xs font-bold text-muted-foreground uppercase tracking-wide">Response Payload (200 OK)</span>
                        <div className="relative">
                          <pre className="bg-black/60 border border-border/80 rounded-md p-3 text-3xs text-sky-400 overflow-x-auto max-h-60 leading-normal">
                            {endpoint.response}
                          </pre>
                          <button
                            onClick={() => handleCopy(endpoint.response, `res-${idx}`)}
                            className="absolute top-2 right-2 text-muted-foreground hover:text-foreground p-1 bg-black/80 rounded-sm border border-border/40 transition-all"
                          >
                            {copiedTextId === `res-${idx}` ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
                          </button>
                        </div>
                      </div>

                    </div>
                  </div>
                </div>
              ))}
            </div>

          </div>
        ) : (
          <div className="space-y-8">
            
            {/* CSS Override Callout */}
            <div className="bg-card border border-border rounded-lg p-5 space-y-4">
              <div className="flex items-center gap-2 text-primary">
                <Layers className="h-4 w-4 text-purple-400" />
                <span className="font-bold text-sm">Cascading Custom Styles Engine</span>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Students can inject custom stylesheet CSS in their profile configurator to completely override their card design. Since the card renders on a 3D perspective viewport, custom CSS rules cascade from a parent wrapper called <code className="text-primary font-bold">.profile-card</code> down through the standard component layout.
              </p>
            </div>

            {/* Selector Guide Table */}
            <div className="bg-card border border-border rounded-lg overflow-hidden">
              <div className="border-b border-border/50 py-3 px-5 bg-muted/30">
                <span className="text-xs font-bold font-mono">Available CSS Selectors & Variables Reference</span>
              </div>
              <div className="p-0 overflow-x-auto">
                <table className="w-full text-left text-xs font-mono border-collapse">
                  <thead>
                    <tr className="border-b border-border bg-black/40 text-muted-foreground text-3xs uppercase tracking-wider">
                      <th className="p-3 pl-5">Selector / Variable</th>
                      <th className="p-3">Targets Component Element</th>
                      <th className="p-3 pr-5">Overridable Properties</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b border-border bg-black/10">
                      <td className="p-3 pl-5 font-bold text-primary">.profile-card</td>
                      <td className="p-3">Outer card shell container wrapper (holds background glow)</td>
                      <td className="p-3 pr-5 text-muted-foreground">transform, margin, transition speed, variables definition</td>
                    </tr>
                    <tr className="border-b border-border">
                      <td className="p-3 pl-5 font-bold text-purple-400">.profile-card-inner</td>
                      <td className="p-3">Inner visible card body (glass box)</td>
                      <td className="p-3 pr-5 text-muted-foreground">background, border-color, border-width, border-style, box-shadow</td>
                    </tr>
                    <tr className="border-b border-border bg-black/10">
                      <td className="p-3 pl-5 font-bold text-sky-400">.student-profile-wrapper</td>
                      <td className="p-3">Profile page root viewport container</td>
                      <td className="p-3 pr-5 text-muted-foreground">background, background-image, scrollbar-width, font-family</td>
                    </tr>
                    <tr className="border-b border-border">
                      <td className="p-3 pl-5 font-bold text-emerald-400">.profile-card h3</td>
                      <td className="p-3">Main profile name heading text</td>
                      <td className="p-3 pr-5 text-muted-foreground">font-size, color, text-shadow, text-transform, letter-spacing</td>
                    </tr>
                    <tr className="border-b border-border bg-black/10">
                      <td className="p-3 pl-5 font-bold text-amber-500">.profile-card p</td>
                      <td className="p-3">Tagline / Role text label</td>
                      <td className="p-3 pr-5 text-muted-foreground">color, font-family, font-weight, opacity</td>
                    </tr>
                    <tr className="border-b border-border">
                      <td className="p-3 pl-5 font-bold text-pink-400">.profile-card img</td>
                      <td className="p-3">Main centered avatar profile image</td>
                      <td className="p-3 pr-5 text-muted-foreground">border-radius, border, filter (e.g. sepia, saturate, blur)</td>
                    </tr>
                    <tr className="border-b border-border bg-black/10">
                      <td className="p-3 pl-5 font-bold text-indigo-400">.profile-card button</td>
                      <td className="p-3">Action button (e.g. GitHub link button)</td>
                      <td className="p-3 pr-5 text-muted-foreground">border-color, background, font-size, border-radius</td>
                    </tr>
                    <tr className="border-b border-border bg-black/20">
                      <td className="p-3 pl-5 font-semibold text-emerald-500">--card-bg</td>
                      <td className="p-3">Inner CSS custom variable for background</td>
                      <td className="p-3 pr-5 text-muted-foreground">Supports solid hex color or linear-gradient</td>
                    </tr>
                    <tr className="border-b border-border">
                      <td className="p-3 pl-5 font-semibold text-sky-400">--card-border-color</td>
                      <td className="p-3">Inner CSS custom variable for border</td>
                      <td className="p-3 pr-5 text-muted-foreground">Hex color, rgb, hsl, or transparent</td>
                    </tr>
                    <tr className="border-b border-border bg-black/20">
                      <td className="p-3 pl-5 font-semibold text-purple-400">--card-border-width</td>
                      <td className="p-3">Inner CSS custom variable for border thickness</td>
                      <td className="p-3 pr-5 text-muted-foreground">e.g. 1px, 2px, 0px</td>
                    </tr>
                    <tr className="border-b border-border">
                      <td className="p-3 pl-5 font-semibold text-pink-500">--behind-glow-color</td>
                      <td className="p-3">Inner CSS custom variable for ambient glow</td>
                      <td className="p-3 pr-5 text-muted-foreground">rgba color with opacity to look glowing</td>
                    </tr>
                    <tr className="bg-black/10">
                      <td className="p-3 pl-5 font-semibold text-amber-500">--behind-glow-size</td>
                      <td className="p-3">Inner CSS custom variable for ambient glow size</td>
                      <td className="p-3 pr-5 text-muted-foreground">e.g. 40%, 50%, 65%</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* CSS Live Code CodeBlocks */}
            <div className="space-y-6">
              <span className="text-3xs font-bold text-muted-foreground uppercase tracking-wide">CSS Override Implementation Examples</span>
              
              {cssExamples.map((ex) => (
                <div key={ex.id} className="space-y-2 border border-border/40 p-4 rounded-lg bg-black/10">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                    <span className="text-xs font-bold text-foreground font-sans">{ex.title}</span>
                    <span className="text-3xs text-muted-foreground">{ex.description}</span>
                  </div>
                  <div className="relative">
                    <pre className="bg-black/60 border border-border/80 rounded-md p-4 text-xs text-purple-300 overflow-x-auto leading-normal">
                      {ex.code}
                    </pre>
                    <button
                      onClick={() => handleCopy(ex.code, ex.id)}
                      className="absolute top-2 right-2 text-muted-foreground hover:text-foreground p-1 bg-black/80 rounded-sm border border-border/40 transition-all cursor-pointer hover:border-border"
                      title="Copy code example"
                    >
                      {copiedTextId === ex.id ? (
                        <Check className="h-3.5 w-3.5 text-emerald-400 animate-fade-in" />
                      ) : (
                        <Copy className="h-3.5 w-3.5" />
                      )}
                    </button>
                  </div>
                </div>
              ))}
            </div>

          </div>
        )}

      </div>
    </div>
  )
}
