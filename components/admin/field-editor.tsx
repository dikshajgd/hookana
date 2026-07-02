"use client"

import { Plus, Trash2, ChevronUp, ChevronDown } from "lucide-react"
import type { Field } from "@/lib/admin/content-schema"

export function FieldEditor({
  field,
  value,
  onChange,
}: {
  field: Field
  value: any
  onChange: (v: any) => void
}) {
  if (field.type === "text" || field.type === "textarea") {
    return (
      <label className="block">
        <span className="mb-1 block text-sm font-medium text-gray-800">{field.label}</span>
        {field.help && <span className="mb-1 block text-xs text-gray-500">{field.help}</span>}
        {field.type === "text" ? (
          <input
            type="text"
            value={value ?? ""}
            onChange={(e) => onChange(e.target.value)}
            className="w-full rounded border border-gray-300 px-3 py-2 text-sm"
          />
        ) : (
          <textarea
            rows={4}
            value={value ?? ""}
            onChange={(e) => onChange(e.target.value)}
            className="w-full rounded border border-gray-300 px-3 py-2 text-sm"
          />
        )}
      </label>
    )
  }

  if (field.type === "list") {
    const arr: string[] = Array.isArray(value) ? value : []
    const set = (i: number, v: string) => onChange(arr.map((x, j) => (j === i ? v : x)))
    const remove = (i: number) => onChange(arr.filter((_, j) => j !== i))
    const add = () => onChange([...arr, ""])
    return (
      <div>
        <span className="mb-1 block text-sm font-medium text-gray-800">{field.label}</span>
        {field.help && <span className="mb-2 block text-xs text-gray-500">{field.help}</span>}
        <div className="space-y-2">
          {arr.map((item, i) => (
            <div key={i} className="flex gap-2">
              <input
                type="text"
                value={item}
                onChange={(e) => set(i, e.target.value)}
                className="w-full rounded border border-gray-300 px-3 py-2 text-sm"
              />
              <button
                type="button"
                onClick={() => remove(i)}
                className="rounded p-2 text-red-600 hover:bg-red-50"
                aria-label="Remove"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
        <button
          type="button"
          onClick={add}
          className="mt-2 inline-flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800"
        >
          <Plus className="h-4 w-4" /> Add {field.itemLabel ?? "item"}
        </button>
      </div>
    )
  }

  // group: array of objects, each rendered by recursing over subfields
  const arr: any[] = Array.isArray(value) ? value : []
  const subfields = field.fields ?? []
  const emptyItem = () => Object.fromEntries(subfields.map((f) => [f.key, f.type === "group" || f.type === "list" ? [] : ""]))
  const setItem = (i: number, item: any) => onChange(arr.map((x, j) => (j === i ? item : x)))
  const removeItem = (i: number) => onChange(arr.filter((_, j) => j !== i))
  const addItem = () => onChange([...arr, emptyItem()])
  const move = (i: number, dir: -1 | 1) => {
    const j = i + dir
    if (j < 0 || j >= arr.length) return
    const next = [...arr]
    ;[next[i], next[j]] = [next[j], next[i]]
    onChange(next)
  }

  return (
    <div>
      <span className="mb-2 block text-sm font-medium text-gray-800">{field.label}</span>
      {field.help && <span className="mb-2 block text-xs text-gray-500">{field.help}</span>}
      <div className="space-y-4">
        {arr.map((item, i) => (
          <div key={i} className="rounded-md border border-gray-200 bg-gray-50 p-4">
            <div className="mb-3 flex items-center justify-between">
              <span className="text-xs font-semibold tracking-wide text-gray-500 uppercase">
                {field.itemLabel ?? "Item"} {i + 1}
              </span>
              <div className="flex items-center gap-1">
                <button type="button" onClick={() => move(i, -1)} disabled={i === 0} className="rounded p-1 hover:bg-gray-200 disabled:opacity-30" aria-label="Move up">
                  <ChevronUp className="h-4 w-4" />
                </button>
                <button type="button" onClick={() => move(i, 1)} disabled={i === arr.length - 1} className="rounded p-1 hover:bg-gray-200 disabled:opacity-30" aria-label="Move down">
                  <ChevronDown className="h-4 w-4" />
                </button>
                <button type="button" onClick={() => removeItem(i)} className="rounded p-1 text-red-600 hover:bg-red-50" aria-label="Remove">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
            <div className="space-y-3">
              {subfields.map((sf) => (
                <FieldEditor
                  key={sf.key}
                  field={sf}
                  value={item?.[sf.key]}
                  onChange={(v) => setItem(i, { ...item, [sf.key]: v })}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
      <button
        type="button"
        onClick={addItem}
        className="mt-3 inline-flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800"
      >
        <Plus className="h-4 w-4" /> Add {field.itemLabel ?? "item"}
      </button>
    </div>
  )
}
