"use client"

/**
 * The heart of the inline site editor.
 *
 * One React context makes the ordinary landing components editable *in place*.
 * On the public site there is no provider, so `useEditor()` returns the inert
 * default (`editing: false`) and every editable primitive renders exactly what
 * it always did — no behaviour change, still server-rendered.
 *
 * Inside /admin/site an `<EditorProvider editing>` holds a working copy of the
 * whole `site_settings` payload. Components read their slice through
 * `useEditable(sectionKey, …)` so structural edits (add/remove/reorder a card)
 * re-render live; the primitives write back through `setField(path, value)`
 * using dotted paths like `hero.videoCards.2.url`.
 */

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react"

export type Settings = Record<string, any>

type SaveStatus = "idle" | "saving" | "saved" | "error"

type EditorContextValue = {
  editing: boolean
  settings: Settings
  dirty: ReadonlySet<string>
  status: SaveStatus
  error: string
  previewWidth: "desktop" | "mobile"
  setPreviewWidth: (w: "desktop" | "mobile") => void
  setField: (path: string, value: unknown) => void
  save: () => Promise<void>
}

const INERT: EditorContextValue = {
  editing: false,
  settings: {},
  dirty: new Set(),
  status: "idle",
  error: "",
  previewWidth: "desktop",
  setPreviewWidth: () => {},
  setField: () => {},
  save: async () => {},
}

const EditorContext = createContext<EditorContextValue>(INERT)

// ---- pure path helpers (numeric segments index arrays) --------------------

/** Read the value at a dotted `path` (e.g. `hero.videoCards.2.url`). */
export function getAtPath(root: any, path: string): any {
  return path.split(".").reduce((acc, key) => (acc == null ? acc : acc[key]), root)
}

/** Immutably set the value at a dotted `path`, cloning each node on the way. */
export function setAtPath(root: any, path: string, value: unknown): any {
  const keys = path.split(".")
  const clone = Array.isArray(root) ? [...root] : { ...(root ?? {}) }
  let cursor: any = clone
  for (let i = 0; i < keys.length - 1; i++) {
    const key = keys[i]
    const next = cursor[key]
    cursor[key] = Array.isArray(next) ? [...next] : { ...(next ?? {}) }
    cursor = cursor[key]
  }
  cursor[keys[keys.length - 1]] = value
  return clone
}

/**
 * Deep-merge saved settings over defaults so the working copy is always
 * *complete* — every section fully populated. That's what prevents a
 * single-field edit from saving a partial section (which would blank out the
 * fields the component relies on). Saved scalars/arrays win; nested objects
 * merge key-by-key.
 */
export function mergeDefaults(defaults: Settings, saved: Settings): Settings {
  const isPlainObject = (v: unknown): v is Record<string, any> =>
    typeof v === "object" && v !== null && !Array.isArray(v)

  const merge = (a: any, b: any): any => {
    if (b === undefined) return a
    if (!isPlainObject(a) || !isPlainObject(b)) return b
    const out: Record<string, any> = { ...a }
    for (const key of Object.keys(b)) out[key] = merge(a[key], b[key])
    return out
  }

  const result: Settings = { ...defaults }
  for (const key of Object.keys(saved ?? {})) {
    result[key] = merge(defaults[key], saved[key])
  }
  return result
}

// ---- provider -------------------------------------------------------------

export function EditorProvider({
  editing = false,
  defaults = {},
  initialSettings = {},
  children,
}: {
  editing?: boolean
  defaults?: Settings
  initialSettings?: Settings
  children: ReactNode
}) {
  const [settings, setSettings] = useState<Settings>(() =>
    editing ? mergeDefaults(defaults, initialSettings) : initialSettings
  )
  // Mirror of `settings` for reads that must see the very latest value even
  // before React re-renders — e.g. clicking Save immediately after a blur.
  const settingsRef = useRef<Settings>(settings)
  const [dirty, setDirty] = useState<Set<string>>(() => new Set())
  const [status, setStatus] = useState<SaveStatus>("idle")
  const [error, setError] = useState("")
  const [previewWidth, setPreviewWidth] = useState<"desktop" | "mobile">("desktop")

  const setField = useCallback((path: string, value: unknown) => {
    const section = path.split(".")[0]
    setSettings((prev) => {
      const next = setAtPath(prev, path, value)
      settingsRef.current = next
      return next
    })
    setDirty((prev) => {
      if (prev.has(section)) return prev
      const next = new Set(prev)
      next.add(section)
      return next
    })
    setStatus("idle")
  }, [])

  const save = useCallback(async () => {
    const sections = [...dirty]
    if (sections.length === 0) return
    setStatus("saving")
    setError("")
    try {
      await Promise.all(
        sections.map(async (key) => {
          const res = await fetch("/api/settings", {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ key, value: settingsRef.current[key] }),
          })
          const body = await res.json()
          if (!body.success) throw new Error(body.error || `Failed to save "${key}"`)
        })
      )
      setDirty(new Set())
      setStatus("saved")
    } catch (e) {
      setStatus("error")
      setError(e instanceof Error ? e.message : String(e))
    }
  }, [dirty])

  const value = useMemo<EditorContextValue>(
    () => ({
      editing,
      settings,
      dirty,
      status,
      error,
      previewWidth,
      setPreviewWidth,
      setField,
      save,
    }),
    [editing, settings, dirty, status, error, previewWidth, setField, save]
  )

  return <EditorContext.Provider value={value}>{children}</EditorContext.Provider>
}

export function useEditor(): EditorContextValue {
  return useContext(EditorContext)
}

/**
 * Resolve a section's content for rendering. In edit mode returns the reactive
 * working copy (so edits show immediately); otherwise the server-provided prop,
 * falling back to the component's built-in default. Off-edit this never
 * subscribes to changing state, so the public site pays no re-render cost.
 */
export function useEditable<T>(
  sectionKey: string,
  propContent: T | null | undefined,
  fallback: T
): T {
  const { editing, settings } = useContext(EditorContext)
  if (!editing) return propContent ?? fallback
  return (settings[sectionKey] as T) ?? propContent ?? fallback
}
