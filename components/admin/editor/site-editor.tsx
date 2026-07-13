"use client"

import { useEffect, useState, type ReactNode } from "react"
import Link from "next/link"
import { ArrowLeft, Check, Loader2, AlertCircle, ExternalLink, Palette } from "lucide-react"
import { cn } from "@/lib/utils"
import { EditorProvider, useEditor, type Settings } from "./editor-context"
import { RichTextToolbar } from "./rich-text-toolbar"
import { ThemePanel } from "./theme-panel"

/**
 * Client shell for /admin/site. Wraps the server-rendered <LandingSections>
 * (passed as children) in the editor context, and pins a toolbar on top. The
 * page underneath is the real homepage — every editable primitive inside it
 * lights up because it now sits under an <EditorProvider editing>.
 */
export function SiteEditor({
  defaults,
  initialSettings,
  children,
}: {
  defaults: Settings
  initialSettings: Settings
  children: ReactNode
}) {
  return (
    <EditorProvider editing defaults={defaults} initialSettings={initialSettings}>
      <div className="relative min-h-screen">
        <Toolbar />
        <RichTextToolbar />
        {children}
      </div>
    </EditorProvider>
  )
}

function Toolbar() {
  const { dirty, status, error, save } = useEditor()
  const [themeOpen, setThemeOpen] = useState(false)
  const dirtyCount = dirty.size
  const hasChanges = dirtyCount > 0

  // Warn before leaving with unsaved edits.
  useEffect(() => {
    if (!hasChanges) return
    const handler = (e: BeforeUnloadEvent) => {
      e.preventDefault()
      e.returnValue = ""
    }
    window.addEventListener("beforeunload", handler)
    return () => window.removeEventListener("beforeunload", handler)
  }, [hasChanges])

  return (
    <header className="sticky top-0 z-[200] flex h-14 items-center justify-between gap-4 border-b border-neutral-200 bg-white/95 px-4 backdrop-blur-sm">
      <div className="flex items-center gap-3">
        <Link
          href="/admin"
          className="flex items-center gap-1.5 rounded-md px-2 py-1.5 text-sm font-medium text-neutral-600 hover:bg-neutral-100"
        >
          <ArrowLeft className="size-4" /> Admin
        </Link>
        <button
          type="button"
          onClick={() => setThemeOpen((v) => !v)}
          className={cn(
            "flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-sm font-medium transition-colors",
            themeOpen
              ? "bg-neutral-900 text-white"
              : "text-neutral-600 hover:bg-neutral-100"
          )}
        >
          <Palette className="size-4" /> Theme
        </button>
        <span className="hidden text-sm text-neutral-400 lg:inline">
          Click any text to edit · hover a card, logo or video to replace it
        </span>
      </div>
      {themeOpen && <ThemePanel onClose={() => setThemeOpen(false)} />}

      <div className="flex items-center gap-3">
        {status === "error" ? (
          <span className="flex max-w-[32vw] items-center gap-1 truncate text-sm text-red-600">
            <AlertCircle className="size-4 shrink-0" /> {error}
          </span>
        ) : hasChanges ? (
          <span className="flex items-center gap-1.5 text-sm text-amber-600">
            <span className="size-2 rounded-full bg-amber-500" />
            {dirtyCount} unpublished {dirtyCount === 1 ? "change" : "changes"}
          </span>
        ) : status === "saved" ? (
          <span className="flex items-center gap-1 text-sm text-emerald-600">
            <Check className="size-4" /> Published — it&apos;s live
          </span>
        ) : null}

        {/* Always available: open the real, published homepage in a new tab */}
        <a
          href="/"
          target="_blank"
          rel="noreferrer"
          className="flex items-center gap-1.5 rounded-md px-2 py-1.5 text-sm font-medium text-neutral-600 hover:bg-neutral-100"
        >
          View live site <ExternalLink className="size-3.5" />
        </a>

        <button
          onClick={save}
          disabled={!hasChanges || status === "saving"}
          className={cn(
            "flex items-center gap-1.5 rounded-md px-4 py-2 text-sm font-semibold text-white transition-colors",
            hasChanges && status !== "saving"
              ? "bg-neutral-900 hover:bg-neutral-700"
              : "cursor-not-allowed bg-neutral-300"
          )}
        >
          {status === "saving" && <Loader2 className="size-4 animate-spin" />}
          {status === "saving" ? "Publishing…" : "Publish changes"}
        </button>
      </div>
    </header>
  )
}
