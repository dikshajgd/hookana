"use client"

import { useState } from "react"
import { FieldEditor } from "./field-editor"
import { CONTENT_DEFAULTS, type Section } from "@/lib/admin/content-schema"

export function SectionEditor({
  section,
  initial,
  onSaved,
}: {
  section: Section
  initial: any
  onSaved?: (value: any) => void
}) {
  const [value, setValue] = useState<any>(
    () => initial ?? CONTENT_DEFAULTS[section.key] ?? {}
  )
  const [saving, setSaving] = useState(false)
  const [status, setStatus] = useState<"idle" | "saved" | "error">("idle")
  const [error, setError] = useState("")

  const setField = (key: string, v: any) => {
    setValue((prev: any) => ({ ...prev, [key]: v }))
    setStatus("idle")
  }

  const save = async () => {
    setSaving(true)
    setStatus("idle")
    setError("")
    try {
      const res = await fetch("/api/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key: section.key, value }),
      })
      const r = await res.json()
      if (r.success) {
        setStatus("saved")
        onSaved?.(value)
      } else {
        setStatus("error")
        setError(r.error || "Save failed")
      }
    } catch (e) {
      setStatus("error")
      setError(e instanceof Error ? e.message : String(e))
    } finally {
      setSaving(false)
    }
  }

  const resetToDefault = () => {
    setValue(CONTENT_DEFAULTS[section.key] ?? {})
    setStatus("idle")
  }

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-xl font-bold">{section.label}</h2>
        {section.description && (
          <p className="mt-1 text-sm text-gray-600">{section.description}</p>
        )}
      </div>

      <div className="space-y-6">
        {section.fields.map((f) => (
          <FieldEditor
            key={f.key}
            field={f}
            value={value?.[f.key]}
            onChange={(v) => setField(f.key, v)}
          />
        ))}
      </div>

      <div className="mt-8 flex items-center gap-3 border-t pt-4">
        <button
          onClick={save}
          disabled={saving}
          className="rounded bg-blue-600 px-6 py-2 text-white hover:bg-blue-700 disabled:opacity-50"
        >
          {saving ? "Saving…" : "Save changes"}
        </button>
        <button
          onClick={resetToDefault}
          disabled={saving}
          className="rounded px-4 py-2 text-sm text-gray-600 hover:bg-gray-100"
        >
          Reset to default
        </button>
        {status === "saved" && <span className="text-sm text-green-600">Saved — live on the site.</span>}
        {status === "error" && <span className="text-sm text-red-600">{error}</span>}
      </div>
    </div>
  )
}
