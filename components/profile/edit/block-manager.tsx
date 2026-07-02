"use client"

import React, { useState } from "react"
import { Button } from "@/components/ui/button"
import { 
  Layers, Plus, Trash2, ArrowUp, ArrowDown, 
  ChevronDown, ChevronUp, Edit3, Settings, 
  Eye, Code2, Tag, Calendar, Terminal, Cpu, Link
} from "lucide-react"

interface BlockManagerProps {
  blocks: any[]
  setBlocks: React.Dispatch<React.SetStateAction<any[]>>
}

export function BlockManager({ blocks, setBlocks }: BlockManagerProps) {
  const [newType, setNewType] = useState<"markdown" | "skills" | "projects" | "timeline" | "metrics" | "code">("markdown")
  const [newTitle, setNewTitle] = useState("")
  const [expandedBlockId, setExpandedBlockId] = useState<string | null>(null)

  // Move block up in list
  const moveUp = (idx: number) => {
    if (idx === 0) return
    const newBlocks = [...blocks]
    const temp = newBlocks[idx]
    newBlocks[idx] = newBlocks[idx - 1]
    newBlocks[idx - 1] = temp
    setBlocks(newBlocks)
  }

  // Move block down in list
  const moveDown = (idx: number) => {
    if (idx === blocks.length - 1) return
    const newBlocks = [...blocks]
    const temp = newBlocks[idx]
    newBlocks[idx] = newBlocks[idx + 1]
    newBlocks[idx + 1] = temp
    setBlocks(newBlocks)
  }

  // Remove block
  const removeBlock = (id: string) => {
    setBlocks(blocks.filter((b) => b.id !== id))
    if (expandedBlockId === id) setExpandedBlockId(null)
  }

  // Add block
  const addBlock = () => {
    const title = newTitle.trim() || `New ${newType}`
    const id = `block-${Date.now()}`

    let blockData: any = {
      id,
      type: newType,
      title,
      colSpan: 1,
    }

    if (newType === "markdown") {
      blockData.content = "Write some markdown here... <TerminalPrompt command=\"hello\">Output</TerminalPrompt>"
    } else if (newType === "skills") {
      blockData.skills = ["HTML", "CSS", "Javascript"]
    } else if (newType === "projects") {
      blockData.projects = [
        { title: "Demo Project", description: "Built a custom database or layout...", link: "" },
      ]
    } else if (newType === "timeline") {
      blockData.items = [
        { title: "Graduation", date: "June 2026", description: "Completed Computer Science degree." },
      ]
    } else if (newType === "code") {
      blockData.html = "<h3>Interactive Custom Widget</h3>\n<p>Add your custom sandboxed HTML elements here!</p>"
      blockData.css = "h3 { color: #38bdf8; }\np { color: #9ca3af; }"
    }

    setBlocks([...blocks, blockData])
    setNewTitle("")
    setExpandedBlockId(id)
  }

  // Update specific block property
  const updateBlock = (id: string, updates: Partial<any>) => {
    setBlocks(
      blocks.map((b) => (b.id === id ? { ...b, ...updates } : b))
    )
  }

  const getBlockIcon = (type: string) => {
    switch (type) {
      case "markdown": return <Terminal className="h-3.5 w-3.5 text-emerald-400" />
      case "skills": return <Cpu className="h-3.5 w-3.5 text-sky-400" />
      case "projects": return <Layers className="h-3.5 w-3.5 text-violet-400" />
      case "timeline": return <Calendar className="h-3.5 w-3.5 text-amber-400" />
      case "code": return <Code2 className="h-3.5 w-3.5 text-pink-400" />
      case "metrics": return <Settings className="h-3.5 w-3.5 text-blue-400" />
      default: return <Tag className="h-3.5 w-3.5 text-white" />
    }
  }

  return (
    <div className="space-y-6 animate-in fade-in-50 duration-300">
      <div>
        <h3 className="text-base font-bold text-foreground font-mono">./bento_blocks_manager</h3>
        <p className="text-xs text-muted-foreground font-mono mt-0.5">
          Configure profile bento grid layout by adding, positioning, and editing cards.
        </p>
      </div>

      {/* Active Blocks List */}
      <div className="space-y-3">
        <span className="text-xs font-mono font-semibold text-muted-foreground flex items-center gap-1.5">
          <Layers className="h-3.5 w-3.5 text-primary" /> Active Layout Cards
        </span>

        {blocks.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-8 border border-dashed border-white/5 rounded-xl bg-black/10 text-center font-mono">
            <Layers className="h-8 w-8 text-neutral-600 animate-pulse mb-2" />
            <p className="text-3xs text-muted-foreground max-w-xs leading-relaxed">
              No Bento cards added to the layout. Add a card below to design your portfolio grid structure.
            </p>
          </div>
        ) : (
          <div className="space-y-2.5">
            {blocks.map((block, idx) => {
              const isExpanded = expandedBlockId === block.id

              return (
                <div 
                  key={block.id} 
                  className={`border transition-all duration-200 rounded-xl overflow-hidden bg-neutral-950/20 backdrop-blur-xs ${
                    isExpanded ? "border-primary/20 shadow-xs" : "border-white/5 hover:border-white/10"
                  }`}
                >
                  
                  {/* Header Row */}
                  <div className="flex items-center justify-between p-3.5 bg-neutral-900/10 font-mono text-xs select-none">
                    <div className="flex items-center gap-2.5 truncate flex-1 mr-2">
                      <button
                        type="button"
                        onClick={() => setExpandedBlockId(isExpanded ? null : block.id)}
                        className="text-neutral-500 hover:text-foreground p-0.5 rounded-md hover:bg-white/5 transition-all"
                      >
                        {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                      </button>
                      <div className="flex items-center gap-1.5 truncate">
                        {getBlockIcon(block.type)}
                        <span className="font-bold text-foreground truncate">{block.title}</span>
                      </div>
                      <span className="text-[9px] font-bold font-mono px-1.5 py-0.5 bg-neutral-800/60 border border-white/5 text-neutral-400 rounded-md uppercase shrink-0">
                        {block.type}
                      </span>
                    </div>

                    {/* Controls */}
                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        type="button"
                        disabled={idx === 0}
                        onClick={() => moveUp(idx)}
                        className="text-neutral-500 hover:text-white disabled:opacity-20 p-1.5 rounded-lg hover:bg-white/5 transition-all"
                        title="Move Card Up"
                      >
                        <ArrowUp className="h-3.5 w-3.5" />
                      </button>
                      <button
                        type="button"
                        disabled={idx === blocks.length - 1}
                        onClick={() => moveDown(idx)}
                        className="text-neutral-500 hover:text-white disabled:opacity-20 p-1.5 rounded-lg hover:bg-white/5 transition-all"
                        title="Move Card Down"
                      >
                        <ArrowDown className="h-3.5 w-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => removeBlock(block.id)}
                        className="text-neutral-500 hover:text-red-400 p-1.5 rounded-lg hover:bg-white/5 transition-all ml-1"
                        title="Delete Card"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Expandable Editor Pane */}
                  {isExpanded && (
                    <div className="p-5 space-y-4 border-t border-white/5 font-mono text-xs bg-neutral-900/10">
                      
                      {/* Title & Column Span */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                          <label className="text-3xs text-muted-foreground uppercase font-bold flex items-center gap-1">
                            <Edit3 className="h-3 w-3" /> Card Title
                          </label>
                          <input
                            type="text"
                            className="flex h-9 w-full rounded-lg border border-white/10 bg-black/20 hover:bg-black/35 px-3 py-1.5 text-xs text-foreground focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-primary focus-visible:border-primary transition-all"
                            value={block.title}
                            onChange={(e) => updateBlock(block.id, { title: e.target.value })}
                          />
                        </div>
                        
                        <div className="space-y-1.5">
                          <label className="text-3xs text-muted-foreground uppercase font-bold flex items-center gap-1">
                            <Layers className="h-3 w-3" /> Column Width Span
                          </label>
                          <select
                            className="flex h-9 w-full rounded-lg border border-white/10 bg-[#121212] px-3 py-1 text-xs text-foreground focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-primary focus-visible:border-primary transition-all cursor-pointer"
                            value={block.colSpan || 1}
                            onChange={(e) => updateBlock(block.id, { colSpan: parseInt(e.target.value, 10) })}
                          >
                            <option value={1}>1 Column (1/3 Width)</option>
                            <option value={2}>2 Columns (2/3 Width)</option>
                            <option value={3}>3 Columns (Full Width)</option>
                          </select>
                        </div>
                      </div>

                      {/* Block-Type Specific Editor Forms */}
                      
                      {/* MARKDOWN TYPE */}
                      {block.type === "markdown" && (
                        <div className="space-y-1.5">
                          <label className="text-3xs text-muted-foreground uppercase font-bold flex items-center gap-1">
                            <Terminal className="h-3 w-3" /> Markdown Content
                          </label>
                          <textarea
                            rows={6}
                            className="flex w-full rounded-lg border border-white/10 bg-black/20 hover:bg-black/35 p-3 text-xs text-foreground focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-primary focus-visible:border-primary transition-all font-mono leading-relaxed"
                            value={block.content || ""}
                            onChange={(e) => updateBlock(block.id, { content: e.target.value })}
                          />
                          <span className="text-[10px] text-muted-foreground block leading-normal mt-1.5">
                            💡 Use shortcodes like <code className="text-primary font-bold">&lt;Spotify id="trackId" /&gt;</code> or <code className="text-primary font-bold">&lt;TerminalPrompt command="cmd"&gt;output&lt;/TerminalPrompt&gt;</code> to load widgets.
                          </span>
                        </div>
                      )}

                      {/* SKILLS TYPE */}
                      {block.type === "skills" && (
                        <div className="space-y-1.5">
                          <label className="text-3xs text-muted-foreground uppercase font-bold flex items-center gap-1">
                            <Cpu className="h-3 w-3" /> Skills (Comma Separated)
                          </label>
                          <input
                            type="text"
                            placeholder="HTML, CSS, JavaScript, React"
                            className="flex h-9 w-full rounded-lg border border-white/10 bg-black/20 hover:bg-black/35 px-3 py-1.5 text-xs text-foreground focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-primary focus-visible:border-primary transition-all"
                            value={block.skills ? block.skills.join(", ") : ""}
                            onChange={(e) =>
                              updateBlock(block.id, {
                                skills: e.target.value.split(",").map((s) => s.trim()).filter(Boolean),
                              })
                            }
                          />
                        </div>
                      )}

                      {/* PROJECTS TYPE */}
                      {block.type === "projects" && (
                        <div className="space-y-3">
                          <div className="flex justify-between items-center">
                            <label className="text-3xs text-muted-foreground uppercase font-bold flex items-center gap-1">
                              <Layers className="h-3 w-3" /> Project Nodes
                            </label>
                            
                            <Button
                              type="button"
                              variant="outline"
                              className="h-7 px-2.5 gap-1 text-[10px] font-mono border-primary/20 hover:border-primary/40 hover:bg-primary/5 text-primary rounded-lg transition-all cursor-pointer"
                              onClick={() =>
                                updateBlock(block.id, {
                                  projects: [
                                    ...(block.projects || []),
                                    { title: "New Project", description: "Description here", link: "" },
                                  ],
                                })
                              }
                            >
                              <Plus className="h-3 w-3" /> Add Project
                            </Button>
                          </div>
                          
                          <div className="space-y-3">
                            {block.projects?.map((proj: any, pIdx: number) => (
                              <div key={pIdx} className="p-4 border border-white/5 bg-black/10 rounded-xl space-y-3 relative overflow-hidden group">
                                <div className="absolute left-0 top-0 bottom-0 w-[2px] bg-primary/20" />
                                
                                <button
                                  type="button"
                                  onClick={() =>
                                    updateBlock(block.id, {
                                      projects: block.projects.filter((_: any, idx: number) => idx !== pIdx),
                                    })
                                  }
                                  className="absolute top-2.5 right-2.5 text-neutral-500 hover:text-red-400 p-1 rounded-md hover:bg-white/5 transition-all"
                                  title="Delete Project"
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
                                </button>
                                
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pr-6">
                                  <div className="space-y-1">
                                    <span className="text-[9px] text-neutral-500 uppercase font-bold">Project Name</span>
                                    <input
                                      type="text"
                                      placeholder="Title"
                                      className="flex h-8 w-full rounded-lg border border-white/10 bg-black/20 hover:bg-black/35 px-3 py-1.5 text-xs text-foreground focus-visible:outline-hidden"
                                      value={proj.title}
                                      onChange={(e) => {
                                        const newProjs = [...block.projects]
                                        newProjs[pIdx].title = e.target.value
                                        updateBlock(block.id, { projects: newProjs })
                                      }}
                                    />
                                  </div>
                                  
                                  <div className="space-y-1">
                                    <span className="text-[9px] text-neutral-500 uppercase font-bold flex items-center gap-1">
                                      <Link className="h-2.5 w-2.5" /> URL Link
                                    </span>
                                    <input
                                      type="url"
                                      placeholder="https://..."
                                      className="flex h-8 w-full rounded-lg border border-white/10 bg-black/20 hover:bg-black/35 px-3 py-1.5 text-xs text-foreground focus-visible:outline-hidden"
                                      value={proj.link || ""}
                                      onChange={(e) => {
                                        const newProjs = [...block.projects]
                                        newProjs[pIdx].link = e.target.value
                                        updateBlock(block.id, { projects: newProjs })
                                      }}
                                    />
                                  </div>
                                </div>
                                
                                <div className="space-y-1">
                                  <span className="text-[9px] text-neutral-500 uppercase font-bold">Description</span>
                                  <textarea
                                    rows={2}
                                    placeholder="Brief technical description..."
                                    className="flex w-full rounded-lg border border-white/10 bg-black/20 hover:bg-black/35 p-2.5 text-xs text-foreground focus-visible:outline-hidden leading-relaxed"
                                    value={proj.description}
                                    onChange={(e) => {
                                      const newProjs = [...block.projects]
                                      newProjs[pIdx].description = e.target.value
                                      updateBlock(block.id, { projects: newProjs })
                                    }}
                                  />
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* TIMELINE TYPE */}
                      {block.type === "timeline" && (
                        <div className="space-y-3">
                          <div className="flex justify-between items-center">
                            <label className="text-3xs text-muted-foreground uppercase font-bold flex items-center gap-1">
                              <Calendar className="h-3 w-3" /> Timeline Milestones
                            </label>
                            
                            <Button
                              type="button"
                              variant="outline"
                              className="h-7 px-2.5 gap-1 text-[10px] font-mono border-primary/20 hover:border-primary/40 hover:bg-primary/5 text-primary rounded-lg transition-all cursor-pointer"
                              onClick={() =>
                                updateBlock(block.id, {
                                  items: [
                                    ...(block.items || []),
                                    { title: "New Milestone", date: "Date", description: "Details" },
                                  ],
                                })
                              }
                            >
                              <Plus className="h-3 w-3" /> Add Event
                            </Button>
                          </div>
                          
                          <div className="space-y-3">
                            {block.items?.map((item: any, tIdx: number) => (
                              <div key={tIdx} className="p-4 border border-white/5 bg-black/10 rounded-xl space-y-3 relative overflow-hidden group">
                                <div className="absolute left-0 top-0 bottom-0 w-[2px] bg-primary/20" />
                                
                                <button
                                  type="button"
                                  onClick={() =>
                                    updateBlock(block.id, {
                                      items: block.items.filter((_: any, idx: number) => idx !== tIdx),
                                    })
                                  }
                                  className="absolute top-2.5 right-2.5 text-neutral-500 hover:text-red-400 p-1 rounded-md hover:bg-white/5 transition-all"
                                  title="Delete Event"
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
                                </button>
                                
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pr-6">
                                  <div className="space-y-1">
                                    <span className="text-[9px] text-neutral-500 uppercase font-bold">Event Title</span>
                                    <input
                                      type="text"
                                      placeholder="e.g. Hackathon Winner"
                                      className="flex h-8 w-full rounded-lg border border-white/10 bg-black/20 hover:bg-black/35 px-3 py-1.5 text-xs text-foreground focus-visible:outline-hidden"
                                      value={item.title}
                                      onChange={(e) => {
                                        const newItems = [...block.items]
                                        newItems[tIdx].title = e.target.value
                                        updateBlock(block.id, { items: newItems })
                                      }}
                                    />
                                  </div>
                                  
                                  <div className="space-y-1">
                                    <span className="text-[9px] text-neutral-500 uppercase font-bold">Event Date</span>
                                    <input
                                      type="text"
                                      placeholder="e.g. Dec 2026"
                                      className="flex h-8 w-full rounded-lg border border-white/10 bg-black/20 hover:bg-black/35 px-3 py-1.5 text-xs text-foreground focus-visible:outline-hidden"
                                      value={item.date}
                                      onChange={(e) => {
                                        const newItems = [...block.items]
                                        newItems[tIdx].date = e.target.value
                                        updateBlock(block.id, { items: newItems })
                                      }}
                                    />
                                  </div>
                                </div>
                                
                                <div className="space-y-1">
                                  <span className="text-[9px] text-neutral-500 uppercase font-bold">Details</span>
                                  <input
                                    type="text"
                                    placeholder="Milestone description..."
                                    className="flex h-8 w-full rounded-lg border border-white/10 bg-black/20 hover:bg-black/35 px-3 py-1.5 text-xs text-foreground focus-visible:outline-hidden"
                                    value={item.description}
                                    onChange={(e) => {
                                      const newItems = [...block.items]
                                      newItems[tIdx].description = e.target.value
                                      updateBlock(block.id, { items: newItems })
                                    }}
                                  />
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* CODE TYPE */}
                      {block.type === "code" && (
                        <div className="space-y-4">
                          <div className="space-y-1.5">
                            <label className="text-3xs text-muted-foreground uppercase font-bold flex items-center gap-1">
                              <Code2 className="h-3 w-3 text-emerald-400" /> Custom HTML Markup
                            </label>
                            <textarea
                              rows={5}
                              className="flex w-full rounded-lg border border-white/10 bg-[#121212] p-3 text-xs text-emerald-400 focus-visible:outline-hidden font-mono leading-relaxed"
                              value={block.html || ""}
                              onChange={(e) => updateBlock(block.id, { html: e.target.value })}
                              placeholder="<h3>Hello Widget</h3>"
                            />
                          </div>
                          
                          <div className="space-y-1.5">
                            <label className="text-3xs text-muted-foreground uppercase font-bold flex items-center gap-1">
                              <Terminal className="h-3 w-3 text-purple-400" /> Custom CSS Styles
                            </label>
                            <textarea
                              rows={5}
                              className="flex w-full rounded-lg border border-white/10 bg-[#121212] p-3 text-xs text-purple-400 focus-visible:outline-hidden font-mono leading-relaxed"
                              value={block.css || ""}
                              onChange={(e) => updateBlock(block.id, { css: e.target.value })}
                              placeholder="h3 { color: cyan; }"
                            />
                          </div>
                          
                          <span className="text-[10px] text-red-400/80 block leading-normal pt-1 flex items-start gap-1">
                            ⚠️ Rendered in an isolated iframe. Scripts disabled for security.
                          </span>
                        </div>
                      )}

                      {/* METRICS TYPE */}
                      {block.type === "metrics" && (
                        <div className="p-4 border border-dashed border-white/5 rounded-xl text-center bg-black/10 flex flex-col items-center">
                          <Eye className="h-6 w-6 text-neutral-600 mb-1" />
                          <span className="text-3xs text-muted-foreground max-w-xs leading-relaxed">
                            Telemetry card. Renders the active telemetry metrics defined under the **Metrics** workspace tab.
                          </span>
                        </div>
                      )}

                    </div>
                  )}

                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Add Block Elements */}
      <div className="border-t border-white/5 pt-5 space-y-4">
        <span className="text-xs font-mono font-bold text-white block">Add Bento Card Layout</span>
        
        <div className="flex flex-col md:flex-row gap-3 items-end font-mono text-xs">
          <div className="flex-1 w-full space-y-1.5">
            <label className="text-3xs text-muted-foreground uppercase font-bold">Card Type</label>
            <select
              className="flex h-9 w-full rounded-lg border border-white/10 bg-[#121212] px-3 py-1 text-xs text-foreground focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-primary focus-visible:border-primary transition-all cursor-pointer"
              value={newType}
              onChange={(e: any) => setNewType(e.target.value)}
            >
              <option value="markdown">Markdown / Widget Prompt</option>
              <option value="skills">Skills Tag List</option>
              <option value="projects">Projects Grid List</option>
              <option value="timeline">Timeline Milestones</option>
              <option value="metrics">Compilation Metrics</option>
              <option value="code">Custom Sandboxed iframe</option>
            </select>
          </div>
          
          <div className="flex-1 w-full space-y-1.5">
            <label className="text-3xs text-muted-foreground uppercase font-bold">Card Title</label>
            <input
              type="text"
              className="flex h-9 w-full rounded-lg border border-white/10 bg-black/20 hover:bg-black/35 px-3 py-1.5 text-xs text-foreground placeholder:text-neutral-600 focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-primary focus-visible:border-primary transition-all"
              placeholder="e.g. systemLog"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
            />
          </div>
          
          <Button
            type="button"
            className="h-9 w-full md:w-auto px-4 gap-1.5 font-mono text-xs bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg transition-all shadow-md shrink-0 cursor-pointer"
            onClick={addBlock}
          >
            <Plus className="h-4 w-4" /> Add Card
          </Button>
        </div>
      </div>
    </div>
  )
}
