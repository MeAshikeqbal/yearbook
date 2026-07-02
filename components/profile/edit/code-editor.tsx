"use client"

import React from "react"
import Editor from "@monaco-editor/react"

interface CodeEditorProps {
  value: string
  onChange: (val: string) => void
  language: "html" | "css" | "js"
  className?: string
}

export function CodeEditor({ value, onChange, language, className = "" }: CodeEditorProps) {
  // Map our internal 'js' extension representation to Monaco's standard 'javascript' identifier
  const monacoLanguage = language === "js" ? "javascript" : language

  return (
    <div className={`w-full h-full bg-[#1e1e1e] ${className}`}>
      <Editor
        height="100%"
        width="100%"
        language={monacoLanguage}
        value={value}
        onChange={(val) => onChange(val || "")}
        theme="vs-dark"
        loading={
          <div className="flex items-center justify-center h-full w-full bg-[#1e1e1e] font-mono text-xs text-neutral-500 gap-2 select-none">
            <span className="h-1.5 w-1.5 rounded-full bg-purple-500 animate-ping"></span>
            compiling_monaco_runtime...
          </div>
        }
        options={{
          fontSize: 12,
          fontFamily: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
          lineHeight: 20,
          minimap: { enabled: false },
          automaticLayout: true,
          scrollbar: {
            vertical: "auto",
            horizontal: "auto",
            verticalScrollbarSize: 8,
            horizontalScrollbarSize: 8,
          },
          wordWrap: "on",
          lineNumbers: "on",
          glyphMargin: false,
          folding: true,
          lineDecorationsWidth: 8,
          lineNumbersMinChars: 3,
          tabSize: 2,
          renderLineHighlight: "all",
          cursorBlinking: "blink",
          cursorSmoothCaretAnimation: "on",
          padding: { top: 12, bottom: 12 },
        }}
      />
    </div>
  )
}
