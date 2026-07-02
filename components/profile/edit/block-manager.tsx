"use client"

import React, { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Layers, Plus, Trash2, ArrowUp, ArrowDown, ChevronDown, ChevronUp } from "lucide-react"

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

  return (
    <Card className="border-border bg-card">
      <CardHeader className="border-b border-border/50 py-3 px-6">
        <CardTitle className="text-sm font-bold font-mono flex items-center gap-2">
          <Layers className="h-4 w-4 text-purple-400" /> bento_blocks_manager
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6 space-y-6">
        
        {/* Active Blocks List */}
        <div className="space-y-4">
          <span className="text-xs font-mono text-muted-foreground block">Active Layout Cards</span>
          {blocks.length === 0 ? (
            <p className="text-3xs font-mono text-muted-foreground py-4 text-center border border-dashed border-border rounded-md">
              No blocks added to Bento Layout yet.
            </p>
          ) : (
            <div className="space-y-3">
              {blocks.map((block, idx) => {
                const isExpanded = expandedBlockId === block.id

                return (
                  <div key={block.id} className="border border-border rounded-lg bg-background overflow-hidden">
                    
                    {/* Header Row */}
                    <div className="flex items-center justify-between p-3 bg-muted/20 border-b border-border/40 text-xs font-mono">
                      <div className="flex items-center gap-2 truncate flex-1 mr-2">
                        <button
                          type="button"
                          onClick={() => setExpandedBlockId(isExpanded ? null : block.id)}
                          className="text-muted-foreground hover:text-foreground p-0.5"
                        >
                          {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                        </button>
                        <span className="font-bold text-foreground truncate">{block.title}</span>
                        <span className="text-3xs text-primary bg-primary/10 border border-primary/20 px-1.5 py-0.5 rounded-xs uppercase">
                          {block.type}
                        </span>
                      </div>

                      {/* Controls */}
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          disabled={idx === 0}
                          onClick={() => moveUp(idx)}
                          className="text-muted-foreground hover:text-foreground disabled:opacity-30 p-1"
                          title="Move Block Up"
                        >
                          <ArrowUp className="h-3.5 w-3.5" />
                        </button>
                        <button
                          type="button"
                          disabled={idx === blocks.length - 1}
                          onClick={() => moveDown(idx)}
                          className="text-muted-foreground hover:text-foreground disabled:opacity-30 p-1"
                          title="Move Block Down"
                        >
                          <ArrowDown className="h-3.5 w-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => removeBlock(block.id)}
                          className="text-muted-foreground hover:text-destructive p-1 ml-1"
                          title="Delete Block"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Expandable Editor Pane */}
                    {isExpanded && (
                      <div className="p-4 space-y-4 border-t border-border/20 text-xs font-mono">
                        
                        {/* Title & Column Span */}
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-1">
                            <label className="text-3xs text-muted-foreground uppercase">Card Title</label>
                            <input
                              type="text"
                              className="flex h-8 w-full rounded-md border border-input bg-card px-2.5 py-1 text-xs focus-visible:outline-hidden"
                              value={block.title}
                              onChange={(e) => updateBlock(block.id, { title: e.target.value })}
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="text-3xs text-muted-foreground uppercase">Column Width Span</label>
                            <select
                              className="flex h-8 w-full rounded-md border border-input bg-card px-2 py-1 text-xs focus-visible:outline-hidden"
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
                          <div className="space-y-1">
                            <label className="text-3xs text-muted-foreground uppercase block">
                              Markdown Content (Shortcodes allowed)
                            </label>
                            <textarea
                              rows={5}
                              className="flex w-full rounded-md border border-input bg-card p-2 text-xs focus-visible:outline-hidden font-mono"
                              value={block.content || ""}
                              onChange={(e) => updateBlock(block.id, { content: e.target.value })}
                            />
                            <span className="text-[10px] text-muted-foreground block mt-1">
                              Supports <code className="text-primary font-bold">&lt;Spotify id="trackId" /&gt;</code> and <code className="text-primary font-bold">&lt;TerminalPrompt command="cmd"&gt;output&lt;/TerminalPrompt&gt;</code> shortcodes.
                            </span>
                          </div>
                        )}

                        {/* SKILLS TYPE */}
                        {block.type === "skills" && (
                          <div className="space-y-1">
                            <label className="text-3xs text-muted-foreground uppercase block">
                              Skills (Comma Separated)
                            </label>
                            <input
                              type="text"
                              className="flex h-8 w-full rounded-md border border-input bg-card px-2.5 py-1 text-xs focus-visible:outline-hidden"
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
                              <label className="text-3xs text-muted-foreground uppercase">Project List</label>
                              <Button
                                type="button"
                                size="sm"
                                variant="outline"
                                className="h-6 gap-0.5 text-3xs font-mono border-primary/20 hover:border-primary text-primary"
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
                                <div key={pIdx} className="p-3 border border-border bg-card rounded-md space-y-2 relative">
                                  <button
                                    type="button"
                                    onClick={() =>
                                      updateBlock(block.id, {
                                        projects: block.projects.filter((_: any, idx: number) => idx !== pIdx),
                                      })
                                    }
                                    className="absolute top-2 right-2 text-muted-foreground hover:text-destructive"
                                  >
                                    <Trash2 className="h-3.5 w-3.5" />
                                  </button>
                                  <div className="grid grid-cols-2 gap-2 pr-6">
                                    <input
                                      type="text"
                                      placeholder="Title"
                                      className="flex h-7 w-full rounded-sm border border-input bg-background px-2 py-0.5 text-xs focus-visible:outline-hidden"
                                      value={proj.title}
                                      onChange={(e) => {
                                        const newProjs = [...block.projects]
                                        newProjs[pIdx].title = e.target.value
                                        updateBlock(block.id, { projects: newProjs })
                                      }}
                                    />
                                    <input
                                      type="text"
                                      placeholder="Link URL"
                                      className="flex h-7 w-full rounded-sm border border-input bg-background px-2 py-0.5 text-xs focus-visible:outline-hidden"
                                      value={proj.link || ""}
                                      onChange={(e) => {
                                        const newProjs = [...block.projects]
                                        newProjs[pIdx].link = e.target.value
                                        updateBlock(block.id, { projects: newProjs })
                                      }}
                                    />
                                  </div>
                                  <textarea
                                    rows={2}
                                    placeholder="Short description"
                                    className="flex w-full rounded-sm border border-input bg-background p-2 text-xs focus-visible:outline-hidden"
                                    value={proj.description}
                                    onChange={(e) => {
                                      const newProjs = [...block.projects]
                                      newProjs[pIdx].description = e.target.value
                                      updateBlock(block.id, { projects: newProjs })
                                    }}
                                  />
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* TIMELINE TYPE */}
                        {block.type === "timeline" && (
                          <div className="space-y-3">
                            <div className="flex justify-between items-center">
                              <label className="text-3xs text-muted-foreground uppercase">Timeline Entries</label>
                              <Button
                                type="button"
                                size="sm"
                                variant="outline"
                                className="h-6 gap-0.5 text-3xs font-mono border-primary/20 hover:border-primary text-primary"
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
                                <div key={tIdx} className="p-3 border border-border bg-card rounded-md space-y-2 relative">
                                  <button
                                    type="button"
                                    onClick={() =>
                                      updateBlock(block.id, {
                                        items: block.items.filter((_: any, idx: number) => idx !== tIdx),
                                      })
                                    }
                                    className="absolute top-2 right-2 text-muted-foreground hover:text-destructive"
                                  >
                                    <Trash2 className="h-3.5 w-3.5" />
                                  </button>
                                  <div className="grid grid-cols-2 gap-2 pr-6">
                                    <input
                                      type="text"
                                      placeholder="Event / Title"
                                      className="flex h-7 w-full rounded-sm border border-input bg-background px-2 py-0.5 text-xs focus-visible:outline-hidden"
                                      value={item.title}
                                      onChange={(e) => {
                                        const newItems = [...block.items]
                                        newItems[tIdx].title = e.target.value
                                        updateBlock(block.id, { items: newItems })
                                      }}
                                    />
                                    <input
                                      type="text"
                                      placeholder="Date (e.g. 2026)"
                                      className="flex h-7 w-full rounded-sm border border-input bg-background px-2 py-0.5 text-xs focus-visible:outline-hidden"
                                      value={item.date}
                                      onChange={(e) => {
                                        const newItems = [...block.items]
                                        newItems[tIdx].date = e.target.value
                                        updateBlock(block.id, { items: newItems })
                                      }}
                                    />
                                  </div>
                                  <input
                                    type="text"
                                    placeholder="Short description"
                                    className="flex h-7 w-full rounded-sm border border-input bg-background px-2 py-0.5 text-xs focus-visible:outline-hidden"
                                    value={item.description}
                                    onChange={(e) => {
                                      const newItems = [...block.items]
                                      newItems[tIdx].description = e.target.value
                                      updateBlock(block.id, { items: newItems })
                                    }}
                                  />
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* CODE TYPE */}
                        {block.type === "code" && (
                          <div className="space-y-4">
                            <div className="space-y-1">
                              <label className="text-3xs text-muted-foreground uppercase block font-mono">Custom HTML Markup</label>
                              <textarea
                                rows={4}
                                className="flex w-full rounded-md border border-input bg-card p-2.5 text-xs focus-visible:outline-hidden font-mono text-emerald-400"
                                value={block.html || ""}
                                onChange={(e) => updateBlock(block.id, { html: e.target.value })}
                                placeholder="<h3>Hello</h3>\n<p>Your HTML here</p>"
                              />
                            </div>
                            <div className="space-y-1">
                              <label className="text-3xs text-muted-foreground uppercase block font-mono">Custom CSS Stylesheet</label>
                              <textarea
                                rows={4}
                                className="flex w-full rounded-md border border-input bg-card p-2.5 text-xs focus-visible:outline-hidden font-mono text-purple-400"
                                value={block.css || ""}
                                onChange={(e) => updateBlock(block.id, { css: e.target.value })}
                                placeholder="h3 { color: cyan; }"
                              />
                            </div>
                            <span className="text-[10px] text-muted-foreground block font-mono leading-relaxed mt-1">
                              ⚠️ Rendered inside a strictly sandboxed &lt;iframe&gt;. Javascript is disabled and origin is isolated for security.
                            </span>
                          </div>
                        )}

                        {/* METRICS TYPE */}
                        {block.type === "metrics" && (
                          <div className="p-3 border border-dashed border-border rounded-md text-center bg-muted/10">
                            <span className="text-[10px] text-muted-foreground">
                              This card displays the metrics defined in the **diagnostic_metrics** form card (located below general info).
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
        <div className="border-t border-border/50 pt-4 flex gap-3 items-end font-mono text-xs">
          <div className="flex-1 space-y-1">
            <label className="text-3xs text-muted-foreground uppercase">Card Type</label>
            <select
              className="flex h-8 w-full rounded-md border border-input bg-background px-2 py-1 text-xs focus-visible:outline-hidden"
              value={newType}
              onChange={(e: any) => setNewType(e.target.value)}
            >
              <option value="markdown">Markdown / Shortcodes</option>
              <option value="skills">Skills Tag List</option>
              <option value="projects">Projects Grid</option>
              <option value="timeline">Timeline Milestones</option>
              <option value="metrics">Compilation Metrics</option>
              <option value="code">Custom HTML / CSS</option>
            </select>
          </div>
          <div className="flex-1 space-y-1">
            <label className="text-3xs text-muted-foreground uppercase">Card Title</label>
            <input
              type="text"
              className="flex h-8 w-full rounded-md border border-input bg-background px-2.5 py-1 text-xs focus-visible:outline-hidden"
              placeholder="e.g. techStack"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
            />
          </div>
          <Button
            type="button"
            size="sm"
            className="h-8 gap-1 font-mono text-3xs bg-primary text-primary-foreground"
            onClick={addBlock}
          >
            <Plus className="h-3.5 w-3.5" /> Add Card
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
