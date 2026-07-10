"use client"

import { Plus, Trash2, ChevronUp, ChevronDown } from "lucide-react"
import { cn } from "@/lib/utils"
import { useEditor, getAtPath } from "./editor-context"

/**
 * Structural editing for arrays inside a section (hero cards, logos, FAQ
 * questions…). `listPath` points at the array; the returned helpers rewrite the
 * whole array through `setField`, which keeps saves complete. `editing` is
 * surfaced so callers can conditionally render the controls.
 */
export function useListControls(listPath: string) {
  const { editing, settings, setField } = useEditor()
  const arr: any[] = editing ? getAtPath(settings, listPath) ?? [] : []

  const add = (item: unknown) => setField(listPath, [...arr, item])
  const remove = (index: number) =>
    setField(listPath, arr.filter((_, i) => i !== index))
  const move = (index: number, dir: -1 | 1) => {
    const j = index + dir
    if (j < 0 || j >= arr.length) return
    const next = [...arr]
    ;[next[index], next[j]] = [next[j], next[index]]
    setField(listPath, next)
  }

  return { editing, length: arr.length, add, remove, move }
}

/** Floating up/down/remove cluster for a single list item (edit mode only). */
export function ListItemControls({
  index,
  length,
  onMove,
  onRemove,
  className,
}: {
  index: number
  length: number
  onMove: (index: number, dir: -1 | 1) => void
  onRemove: (index: number) => void
  className?: string
}) {
  return (
    <div
      className={cn(
        "absolute z-50 flex items-center gap-1 rounded-full bg-neutral-900/90 p-1 text-white shadow-lg",
        className
      )}
      contentEditable={false}
    >
      <button
        type="button"
        onClick={() => onMove(index, -1)}
        disabled={index === 0}
        className="rounded-full p-1 hover:bg-white/20 disabled:opacity-30"
        aria-label="Move earlier"
      >
        <ChevronUp className="size-4" />
      </button>
      <button
        type="button"
        onClick={() => onMove(index, 1)}
        disabled={index === length - 1}
        className="rounded-full p-1 hover:bg-white/20 disabled:opacity-30"
        aria-label="Move later"
      >
        <ChevronDown className="size-4" />
      </button>
      <button
        type="button"
        onClick={() => onRemove(index)}
        className="rounded-full p-1 text-red-300 hover:bg-red-500/30"
        aria-label="Remove"
      >
        <Trash2 className="size-4" />
      </button>
    </div>
  )
}

/** "Add …" button for a list (edit mode only). */
export function AddItemButton({
  label,
  onClick,
  className,
}: {
  label: string
  onClick: () => void
  className?: string
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border-2 border-dashed border-neutral-400 px-4 py-2 text-sm font-medium text-neutral-600 transition-colors hover:border-sky-500 hover:text-sky-600",
        className
      )}
      contentEditable={false}
    >
      <Plus className="size-4" /> {label}
    </button>
  )
}
