"use client"

import { type ElementType } from "react"
import { cn } from "@/lib/utils"
import { useEditor } from "./editor-context"

/**
 * Text that edits itself in place.
 *
 * Two modes:
 *  - `rich` (default): the value is a small HTML fragment, so bold / italic /
 *    underline / colour survive (font-family is deliberately left to CSS). It
 *    renders via dangerouslySetInnerHTML and, in edit mode, becomes a
 *    contentEditable that the shared <RichTextToolbar> formats. Values are
 *    authored only by the signed-in admin, so the HTML is trusted.
 *  - plain (`rich={false}`): single-string content committed as innerText —
 *    right for things that can't hold markup, like image alt text or a
 *    short label.
 *
 * Either way, off-edit it renders the same element the component always did, so
 * the public site is unchanged. Legacy "\n" line breaks are shown as <br>.
 */

function toHtml(value: string): string {
  return (value ?? "").replace(/\n/g, "<br>")
}

const EDIT_CLASSES =
  "cursor-text rounded-sm outline outline-2 outline-offset-2 outline-transparent transition-colors hover:outline-sky-300/70 focus:bg-sky-50/40 focus:outline-sky-500"

export function EditableText({
  path,
  value,
  as,
  className,
  multiline = false,
  rich = true,
  placeholder = "Empty",
}: {
  path: string
  value: string
  as?: ElementType
  className?: string
  multiline?: boolean
  rich?: boolean
  placeholder?: string
}) {
  const { editing, setField } = useEditor()
  const As: ElementType = as ?? "span"

  // ---- rich (HTML) --------------------------------------------------------
  if (rich) {
    if (!editing) {
      return <As className={className} dangerouslySetInnerHTML={{ __html: toHtml(value) }} />
    }
    return (
      <As
        className={cn(EDIT_CLASSES, !value && "min-w-[2ch] opacity-60", className)}
        contentEditable
        suppressContentEditableWarning
        spellCheck={false}
        role="textbox"
        aria-label={placeholder}
        data-editable-rich="true"
        dangerouslySetInnerHTML={{ __html: toHtml(value) }}
        onBlur={(e: React.FocusEvent<HTMLElement>) => {
          const next = e.currentTarget.innerHTML.trim()
          if (next !== toHtml(value)) setField(path, next)
        }}
        onKeyDown={(e: React.KeyboardEvent<HTMLElement>) => {
          if (e.key === "Escape") {
            e.preventDefault()
            e.currentTarget.blur()
          }
        }}
      />
    )
  }

  // ---- plain (innerText) --------------------------------------------------
  if (!editing) {
    return (
      <As className={className} style={multiline ? { whiteSpace: "pre-line" } : undefined}>
        {value}
      </As>
    )
  }

  return (
    <As
      className={cn(EDIT_CLASSES, !value && "min-w-[2ch] opacity-60", className)}
      style={{ whiteSpace: multiline ? "pre-wrap" : undefined }}
      contentEditable
      suppressContentEditableWarning
      spellCheck={false}
      role="textbox"
      aria-label={placeholder}
      onBlur={(e: React.FocusEvent<HTMLElement>) => {
        // contentEditable emits U+00A0 (nbsp) for spaces — normalise back.
        const raw = e.currentTarget.innerText.replace(/ /g, " ")
        const next = multiline ? raw.replace(/\n$/, "") : raw.replace(/\s*\n\s*/g, " ").trim()
        if (next !== value) setField(path, next)
      }}
      onKeyDown={(e: React.KeyboardEvent<HTMLElement>) => {
        if (e.key === "Escape") {
          e.preventDefault()
          e.currentTarget.blur()
        }
        if (!multiline && e.key === "Enter") {
          e.preventDefault()
          e.currentTarget.blur()
        }
      }}
    >
      {value}
    </As>
  )
}
