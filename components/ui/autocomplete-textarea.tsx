"use client"

import React, { useState, useRef, useEffect, useCallback } from "react"

// Standard CSS properties for autocompletion
const CSS_PROPERTIES = [
  "align-content",
  "align-items",
  "align-self",
  "animation",
  "backdrop-filter",
  "background",
  "background-color",
  "background-image",
  "background-size",
  "background-position",
  "background-repeat",
  "border",
  "border-radius",
  "border-color",
  "border-width",
  "border-style",
  "box-shadow",
  "color",
  "cursor",
  "display",
  "filter",
  "flex",
  "flex-direction",
  "flex-wrap",
  "font-family",
  "font-size",
  "font-weight",
  "gap",
  "grid-template-columns",
  "height",
  "justify-content",
  "justify-items",
  "letter-spacing",
  "line-height",
  "margin",
  "margin-top",
  "margin-bottom",
  "margin-left",
  "margin-right",
  "max-height",
  "max-width",
  "min-height",
  "min-width",
  "opacity",
  "outline",
  "overflow",
  "padding",
  "padding-top",
  "padding-bottom",
  "padding-left",
  "padding-right",
  "position",
  "right",
  "left",
  "top",
  "bottom",
  "text-align",
  "text-decoration",
  "text-transform",
  "transform",
  "transition",
  "user-select",
  "width",
  "z-index"
].sort()

interface AutocompleteTextareaProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  rows?: number
  className?: string
  id?: string
}

export function AutocompleteTextarea({
  value,
  onChange,
  placeholder,
  rows = 8,
  className = "",
  id
}: AutocompleteTextareaProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const listRef = useRef<HTMLDivElement>(null)
  const [suggestions, setSuggestions] = useState<string[]>([])
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [showList, setShowList] = useState(false)
  const [wordToComplete, setWordToComplete] = useState("")

  // Extract the word immediately behind the caret
  const getActiveWord = (text: string, caretPos: number) => {
    const textBefore = text.slice(0, caretPos)
    const matches = textBefore.match(/[\w-]+$/)
    return matches ? matches[0] : ""
  }

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const text = e.target.value
    onChange(text)

    const caretPos = e.target.selectionStart
    const word = getActiveWord(text, caretPos)
    setWordToComplete(word)

    if (word.length >= 2) {
      const filtered = CSS_PROPERTIES.filter((prop) =>
        prop.startsWith(word.toLowerCase()) && prop !== word.toLowerCase()
      )
      setSuggestions(filtered)
      setSelectedIndex(0)
      setShowList(filtered.length > 0)
    } else {
      setSuggestions([])
      setShowList(false)
    }
  }

  const selectSuggestion = useCallback((suggestion: string) => {
    const textarea = textareaRef.current
    if (!textarea) return

    const caretPos = textarea.selectionStart
    const textBefore = value.slice(0, caretPos)
    const textAfter = value.slice(caretPos)
    
    // Replace the word behind the caret with the complete property name
    const newTextBefore = textBefore.slice(0, textBefore.length - wordToComplete.length) + suggestion + ": "
    const newValue = newTextBefore + textAfter
    onChange(newValue)

    // Close suggestion list
    setShowList(false)
    setSuggestions([])

    // Reposition caret inside textarea after insertion
    setTimeout(() => {
      textarea.focus()
      const newCaretPos = newTextBefore.length
      textarea.setSelectionRange(newCaretPos, newCaretPos)
    }, 0)
  }, [value, wordToComplete, onChange])

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (!showList || suggestions.length === 0) return

    if (e.key === "ArrowDown") {
      e.preventDefault()
      setSelectedIndex((prev) => (prev + 1) % suggestions.length)
    } else if (e.key === "ArrowUp") {
      e.preventDefault()
      setSelectedIndex((prev) => (prev - 1 + suggestions.length) % suggestions.length)
    } else if (e.key === "Tab" || e.key === "Enter") {
      e.preventDefault()
      selectSuggestion(suggestions[selectedIndex])
    } else if (e.key === "Escape") {
      e.preventDefault()
      setShowList(false)
    }
  }

  // Handle outside clicks to close autocomplete
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (
        textareaRef.current &&
        !textareaRef.current.contains(e.target as Node) &&
        listRef.current &&
        !listRef.current.contains(e.target as Node)
      ) {
        setShowList(false)
      }
    }
    document.addEventListener("mousedown", handleOutsideClick)
    return () => document.removeEventListener("mousedown", handleOutsideClick)
  }, [])

  return (
    <div className="relative w-full flex flex-col">
      <textarea
        ref={textareaRef}
        id={id}
        rows={rows}
        className={`${className} font-mono`}
        placeholder={placeholder}
        value={value}
        onChange={handleTextChange}
        onKeyDown={handleKeyDown}
        spellCheck={false}
      />
      {showList && suggestions.length > 0 && (
        <div
          ref={listRef}
          className="absolute left-3 bottom-full mb-1 z-50 max-h-48 w-56 overflow-y-auto rounded-lg border border-border bg-popover p-1 shadow-lg backdrop-blur-md text-xs font-mono"
        >
          <div className="px-2 py-1 text-[9px] text-muted-foreground uppercase border-b border-border/40 mb-1 select-none">
            CSS Suggestions
          </div>
          {suggestions.map((suggestion, index) => (
            <button
              key={suggestion}
              type="button"
              onClick={() => selectSuggestion(suggestion)}
              className={`w-full text-left px-2.5 py-1.5 rounded-md flex items-center justify-between transition-colors ${
                index === selectedIndex
                  ? "bg-primary text-primary-foreground font-bold"
                  : "text-foreground hover:bg-muted"
              }`}
            >
              <span>{suggestion}</span>
              <span className={`text-[9px] opacity-60 ${index === selectedIndex ? "text-primary-foreground" : "text-muted-foreground"}`}>
                {index === selectedIndex ? "↵ Enter/Tab" : "click"}
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
