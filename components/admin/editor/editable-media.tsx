"use client"

import { useState, type ReactNode } from "react"
import { ImagePlus, Film, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { extractPoster } from "@/lib/video-processing"
import { useEditor } from "./editor-context"

/**
 * Wraps the media a component already renders (`children`) and, in edit mode,
 * lays a hover overlay over it with a single "Replace" affordance. Uploading
 * hits the generic `/api/upload/media` endpoint and writes the resulting URL
 * back to `path`. For video we derive a poster in the browser (same trick the
 * portfolio uploader uses) and store it at `posterPath`; images can flip the
 * card's `type` discriminator via `typePath`.
 *
 * Off-edit it's a no-op passthrough — `children` renders exactly as before.
 */
export function EditableMedia({
  path,
  posterPath,
  typePath,
  kind,
  className,
  children,
}: {
  path: string
  /** where to store a derived/explicit poster image URL (video) */
  posterPath?: string
  /** where to store the media-type discriminator, e.g. "image" | "video" */
  typePath?: string
  kind: "image" | "video"
  className?: string
  children: ReactNode
}) {
  const { editing, setField } = useEditor()
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState("")

  if (!editing) return <>{children}</>

  const handleFile = async (file: File | null) => {
    if (!file) return
    setUploading(true)
    setError("")
    try {
      const isVideo = file.type.startsWith("video/")
      const form = new FormData()
      form.append("file", file)
      if (isVideo) {
        try {
          form.append("poster", await extractPoster(file), "poster.webp")
        } catch {
          // Non-fatal — the endpoint stores the video without a poster.
        }
      }
      const res = await fetch("/api/upload/media", { method: "POST", body: form })
      const body = await res.json()
      if (!body.success) throw new Error(body.error || "Upload failed")

      setField(path, body.url)
      if (posterPath && body.posterUrl) setField(posterPath, body.posterUrl)
      if (typePath) setField(typePath, isVideo ? "video" : "image")
    } catch (e) {
      setError(e instanceof Error ? e.message : "Upload failed")
    } finally {
      setUploading(false)
    }
  }

  const accept = kind === "video" ? "video/*,image/*" : "image/*"
  const Icon = kind === "video" ? Film : ImagePlus

  return (
    <div className={cn("group/media relative", className)}>
      {children}
      <label
        className={cn(
          "absolute inset-0 z-40 flex cursor-pointer flex-col items-center justify-center gap-2",
          "bg-neutral-950/45 text-white opacity-0 backdrop-blur-[1px] transition-opacity",
          "group-hover/media:opacity-100 focus-within:opacity-100",
          uploading && "opacity-100"
        )}
      >
        {uploading ? (
          <Loader2 className="size-6 animate-spin" />
        ) : (
          <Icon className="size-6" />
        )}
        <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-neutral-900 shadow">
          {uploading ? "Uploading…" : kind === "video" ? "Replace video" : "Replace image"}
        </span>
        {error && (
          <span className="max-w-[85%] text-center text-[11px] leading-tight text-red-200">
            {error}
          </span>
        )}
        <input
          type="file"
          accept={accept}
          className="hidden"
          disabled={uploading}
          onChange={(e) => handleFile(e.target.files?.[0] ?? null)}
        />
      </label>
    </div>
  )
}
