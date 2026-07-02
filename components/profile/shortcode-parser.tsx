"use client"

import React, { useState } from "react"

interface Token {
  type: "text" | "spotify" | "terminal" | "github" | "glowcard"
  content?: string
  id?: string
  command?: string
  repo?: string
  color?: string
}

// Tokenizes text for markdown and shortcodes
function tokenize(text: string): Token[] {
  const tokens: Token[] = []
  const regex = /(<Spotify\s+id="([^"]+)"\s*\/?>)|(<TerminalPrompt\s+command="([^"]+)">([\s\S]*?)<\/TerminalPrompt>)|(<GithubRepo\s+repo="([^"]+)"\s*\/?>)|(<GlowCard(?:\s+color="([^"]+)")?>([\s\S]*?)<\/GlowCard>)/g

  let lastIndex = 0
  let match

  while ((match = regex.exec(text)) !== null) {
    const textBefore = text.substring(lastIndex, match.index)
    if (textBefore) {
      tokens.push({ type: "text", content: textBefore })
    }

    if (match[1]) {
      tokens.push({ type: "spotify", id: match[2] })
    } else if (match[3]) {
      tokens.push({ type: "terminal", command: match[4], content: match[5] })
    } else if (match[6]) {
      tokens.push({ type: "github", repo: match[7] })
    } else if (match[8]) {
      tokens.push({ type: "glowcard", color: match[9] || "rgba(125, 190, 255, 0.3)", content: match[10] })
    }

    lastIndex = regex.lastIndex
  }

  const textAfter = text.substring(lastIndex)
  if (textAfter) {
    tokens.push({ type: "text", content: textAfter })
  }

  return tokens
}

// Inline markdown parser for Bold (**) and Code (`)
function parseInlineMarkdown(text: string): React.ReactNode {
  const parts: React.ReactNode[] = []
  const regex = /(\*\*.*?\*\*|`.*?`)/g
  let lastIndex = 0
  let match

  while ((match = regex.exec(text)) !== null) {
    const textBefore = text.substring(lastIndex, match.index)
    if (textBefore) parts.push(textBefore)

    const token = match[1]
    if (token.startsWith("**") && token.endsWith("**")) {
      parts.push(
        <strong key={match.index} className="text-foreground font-bold font-sans">
          {token.substring(2, token.length - 2)}
        </strong>
      )
    } else if (token.startsWith("`") && token.endsWith("`")) {
      parts.push(
        <code key={match.index} className="bg-black/60 border border-border/80 px-1 py-0.5 rounded-sm text-emerald-400 font-mono text-[10px]">
          {token.substring(1, token.length - 1)}
        </code>
      )
    }

    lastIndex = regex.lastIndex
  }

  const textAfter = text.substring(lastIndex)
  if (textAfter) parts.push(textAfter)

  return parts.length > 0 ? <>{parts}</> : text
}

// Paragraph and block parser
function renderMarkdownText(text: string): React.ReactNode[] {
  const lines = text.split("\n")
  return lines.map((line, idx) => {
    // Headers (### Header)
    const headerMatch = line.match(/^(#{1,6})\s+(.*)$/)
    if (headerMatch) {
      const level = headerMatch[1].length
      const content = parseInlineMarkdown(headerMatch[2])
      if (level === 1) return <h1 key={idx} className="text-xl font-bold tracking-tight text-foreground font-sans mt-4 mb-2">{content}</h1>
      if (level === 2) return <h2 key={idx} className="text-lg font-bold tracking-tight text-foreground font-sans mt-4 mb-2">{content}</h2>
      return <h3 key={idx} className="text-xs font-bold font-mono text-primary uppercase tracking-wider mt-4 mb-1">{content}</h3>
    }

    // List bullets (- item)
    const listMatch = line.match(/^[-*]\s+(.*)$/)
    if (listMatch) {
      return (
        <li key={idx} className="ml-4 list-disc text-muted-foreground font-mono text-xs my-1 leading-normal list-item">
          {parseInlineMarkdown(listMatch[1])}
        </li>
      )
    }

    // Paragraph
    if (line.trim() === "") {
      return <div key={idx} className="h-3" />
    }

    return (
      <p key={idx} className="my-1 font-mono text-xs text-foreground/90 leading-relaxed">
        {parseInlineMarkdown(line)}
      </p>
    )
  })
}

// WIDGET COMPONENTS

function SpotifyWidget({ id }: { id: string }) {
  return (
    <div className="my-4 w-full">
      <iframe
        style={{ borderRadius: "8px" }}
        src={`https://open.spotify.com/embed/track/${id}?utm_source=generator&theme=0`}
        width="100%"
        height="80"
        frameBorder="0"
        allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
        loading="lazy"
      />
    </div>
  )
}

function TerminalWidget({ command, content }: { command: string; content: string }) {
  return (
    <div className="bg-black/90 border border-border rounded-lg p-4 font-mono text-xs my-4 text-emerald-400 shadow-inner">
      <div className="flex items-center gap-1.5 border-b border-border/40 pb-2 mb-2 text-muted-foreground select-none">
        <div className="h-1.5 w-1.5 rounded-full bg-destructive/60" />
        <div className="h-1.5 w-1.5 rounded-full bg-amber-500/60" />
        <div className="h-1.5 w-1.5 rounded-full bg-emerald-500/60" />
        <span className="text-[9px] ml-1 uppercase">shell_terminal</span>
      </div>
      <div className="flex items-start gap-1">
        <span className="text-primary font-bold shrink-0">guest@yearbook:~$</span>
        <span className="text-foreground font-semibold">{command}</span>
      </div>
      <div className="mt-2 text-emerald-400/90 whitespace-pre-wrap leading-relaxed">
        {content}
      </div>
    </div>
  )
}

function GithubRepoWidget({ repo }: { repo: string }) {
  const [owner, name] = repo.split("/")
  return (
    <div className="bg-card border border-border/80 p-4 rounded-lg font-mono text-xs my-4 flex flex-col justify-between h-24 hover:border-primary/50 transition-colors shadow-2xs">
      <div>
        <span className="text-[9px] text-muted-foreground uppercase tracking-wider block">Repository</span>
        <a
          href={`https://github.com/${repo}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-primary font-bold hover:underline block text-xs mt-1 truncate"
        >
          {owner || "github"}/{name || "repo"}
        </a>
      </div>
      <div className="flex items-center gap-4 text-muted-foreground mt-2 text-[10px]">
        <span className="flex items-center gap-0.5">⭐ star_count</span>
        <span className="flex items-center gap-0.5">🍴 fork_count</span>
        <span className="bg-primary/15 text-primary border border-primary/20 px-1 py-0.5 rounded-xs text-[9px]">Active</span>
      </div>
    </div>
  )
}

function GlowCardWidget({ color, content }: { color: string; content: string }) {
  return (
    <div
      className="relative p-4 rounded-xl border bg-card/40 backdrop-blur-md my-4 shadow-sm group overflow-hidden transition-all duration-300 hover:border-white/20"
      style={{
        borderColor: "rgba(255, 255, 255, 0.08)",
        boxShadow: `0 0 15px -3px ${color}`,
      }}
    >
      <div
        className="absolute -inset-10 opacity-20 group-hover:opacity-30 blur-2xl transition-opacity pointer-events-none"
        style={{
          background: `radial-gradient(circle at center, ${color} 0%, transparent 70%)`,
        }}
      />
      <div className="relative z-10">
        {renderMarkdownText(content)}
      </div>
    </div>
  )
}

// MAIN RENDER COMPONENT
export function ShortcodeParser({ text }: { text: string }) {
  if (!text) return null

  const tokens = tokenize(text)

  return (
    <div className="space-y-1">
      {tokens.map((token, idx) => {
        switch (token.type) {
          case "spotify":
            return <SpotifyWidget key={idx} id={token.id || ""} />
          case "terminal":
            return (
              <TerminalWidget
                key={idx}
                command={token.command || ""}
                content={token.content || ""}
              />
            )
          case "github":
            return <GithubRepoWidget key={idx} repo={token.repo || ""} />
          case "glowcard":
            return (
              <GlowCardWidget
                key={idx}
                color={token.color || ""}
                content={token.content || ""}
              />
            )
          case "text":
          default:
            return <div key={idx}>{renderMarkdownText(token.content || "")}</div>
        }
      })}
    </div>
  )
}
