"use client"

import { useEffect, type ReactNode } from "react"
import Link from "next/link"
import { ArrowLeft, Check, Loader2, AlertCircle } from "lucide-react"
import { cn } from "@/lib/utils"
import { EditorProvider, useEditor, type Settings } from "./editor-context"
import { RichTextToolbar } from "./rich-text-toolbar"

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
        <span className="hidden text-sm text-neutral-400 sm:inline">
          Click any text to edit · hover a card, logo or video to replace it
        </span>
      </div>

      <div className="flex items-center gap-3">
        {status === "saved" && !hasChanges && (
          <span className="flex items-center gap-1 text-sm text-emerald-600">
            <Check className="size-4" /> Saved — live on the site
          </span>
        )}
        {status === "error" && (
          <span className="flex max-w-[40vw] items-center gap-1 truncate text-sm text-red-600">
            <AlertCircle className="size-4 shrink-0" /> {error}
          </span>
        )}
        {hasChanges && (
          <span className="flex items-center gap-1.5 text-sm text-amber-600">
            <span className="size-2 rounded-full bg-amber-500" />
            {dirtyCount} unsaved {dirtyCount === 1 ? "section" : "sections"}
          </span>
        )}
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
          {status === "saving" ? "Saving…" : "Save changes"}
        </button>
      </div>
    </header>
  )
}
