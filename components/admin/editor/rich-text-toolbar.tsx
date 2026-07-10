"use client"

import { useEffect, useState } from "react"
import { Bold, Italic, Underline, Eraser } from "lucide-react"

/**
 * A shared bubble toolbar for formatting rich <EditableText> fields. It watches
 * the document selection; whenever the caret sits inside a
 * `[data-editable-rich]` element it pops above the selection with bold / italic
 * / underline / colour controls. font-family is intentionally omitted — the site
 * CSS owns that.
 *
 * Formatting uses document.execCommand: deprecated, but still the only
 * one-liner for styling a live contentEditable, and this is an internal admin
 * tool. `onMouseDown → preventDefault` on the bar keeps the text selection
 * alive while a button is pressed.
 */

const COLORS = [
  { name: "Ink", value: "#1c1c1c" },
  { name: "White", value: "#ffffff" },
  { name: "Blue", value: "#1e3a8a" },
  { name: "Sky", value: "#2563eb" },
  { name: "Lime", value: "#65a30d" },
  { name: "Pink", value: "#db2777" },
  { name: "Red", value: "#dc2626" },
  { name: "Amber", value: "#d97706" },
]

function activeRichElement(): HTMLElement | null {
  const sel = window.getSelection()
  if (!sel || sel.rangeCount === 0) return null
  let node: Node | null = sel.anchorNode
  while (node && node !== document.body) {
    if (node instanceof HTMLElement && node.dataset.editableRich === "true") return node
    node = node.parentNode
  }
  return null
}

export function RichTextToolbar() {
  const [pos, setPos] = useState<{ top: number; left: number } | null>(null)

  useEffect(() => {
    const update = () => {
      const el = activeRichElement()
      const sel = window.getSelection()
      if (!el || !sel || sel.rangeCount === 0) {
        setPos(null)
        return
      }
      const rect = sel.getRangeAt(0).getBoundingClientRect()
      const anchor = rect.width || rect.height ? rect : el.getBoundingClientRect()
      setPos({
        top: anchor.top + window.scrollY - 46,
        left: anchor.left + window.scrollX + anchor.width / 2,
      })
    }
    document.addEventListener("selectionchange", update)
    window.addEventListener("scroll", update, true)
    window.addEventListener("resize", update)
    return () => {
      document.removeEventListener("selectionchange", update)
      window.removeEventListener("scroll", update, true)
      window.removeEventListener("resize", update)
    }
  }, [])

  if (!pos) return null

  const exec = (command: string, value?: string) => {
    document.execCommand("styleWithCSS", false, "true")
    document.execCommand(command, false, value)
  }

  return (
    <div
      style={{ top: pos.top, left: pos.left, transform: "translateX(-50%)" }}
      className="absolute z-[300] flex items-center gap-0.5 rounded-lg border border-neutral-700 bg-neutral-900 px-1.5 py-1 text-white shadow-xl"
      // Keep the editable's selection while a control is pressed.
      onMouseDown={(e) => e.preventDefault()}
    >
      <ToolButton label="Bold" onClick={() => exec("bold")}>
        <Bold className="size-4" />
      </ToolButton>
      <ToolButton label="Italic" onClick={() => exec("italic")}>
        <Italic className="size-4" />
      </ToolButton>
      <ToolButton label="Underline" onClick={() => exec("underline")}>
        <Underline className="size-4" />
      </ToolButton>

      <span className="mx-1 h-5 w-px bg-white/20" />

      {COLORS.map((c) => (
        <button
          key={c.value}
          type="button"
          onClick={() => exec("foreColor", c.value)}
          aria-label={`Colour: ${c.name}`}
          title={c.name}
          className="size-5 rounded-full border border-white/40 transition-transform hover:scale-110"
          style={{ backgroundColor: c.value }}
        />
      ))}

      <span className="mx-1 h-5 w-px bg-white/20" />

      <ToolButton label="Clear formatting" onClick={() => exec("removeFormat")}>
        <Eraser className="size-4" />
      </ToolButton>
    </div>
  )
}

function ToolButton({
  label,
  onClick,
  children,
}: {
  label: string
  onClick: () => void
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      title={label}
      className="rounded p-1.5 text-white/90 hover:bg-white/15"
    >
      {children}
    </button>
  )
}
