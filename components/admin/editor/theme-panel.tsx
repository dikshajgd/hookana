"use client"

import { Palette, RotateCcw, X, Check } from "lucide-react"
import { THEME_TOKENS } from "@/lib/admin/theme-tokens"
import { THEME_PRESETS, matchingPresetId, type ThemePreset } from "@/lib/admin/theme-presets"
import { useEditor } from "./editor-context"

/**
 * Whole-site theme editor. Lead with ready-made PRESETS — click one and the
 * page recolours live (via <ThemeScope>); it only goes live on Publish, so
 * trying looks is fully separate from publishing. Advanced users can fine-tune
 * the individual colours below.
 */
export function ThemePanel({ onClose }: { onClose: () => void }) {
  const { settings, setField } = useEditor()
  const colors: Record<string, string> = settings.theme?.colors ?? {}
  const activeId = matchingPresetId(colors)

  const applyPreset = (preset: ThemePreset) => setField("theme.colors", { ...preset.colors })

  return (
    <div className="fixed top-16 right-4 z-[210] flex max-h-[calc(100vh-5rem)] w-80 flex-col rounded-xl border border-neutral-200 bg-white shadow-2xl">
      <div className="flex items-center justify-between border-b border-neutral-100 p-4 pb-3">
        <div className="flex items-center gap-2">
          <Palette className="size-4" />
          <h3 className="text-sm font-semibold text-neutral-900">Theme</h3>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="rounded p-1 text-neutral-400 hover:bg-neutral-100 hover:text-neutral-700"
          aria-label="Close theme panel"
        >
          <X className="size-4" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        <p className="mb-3 text-xs text-neutral-400">
          Pick a look — the site recolours live. Nothing changes for visitors until you Publish.
        </p>

        <div className="grid grid-cols-2 gap-2">
          {THEME_PRESETS.map((preset) => {
            const c = preset.colors
            const active = activeId === preset.id
            return (
              <button
                key={preset.id}
                type="button"
                onClick={() => applyPreset(preset)}
                className={`rounded-lg border p-2 text-left transition ${
                  active
                    ? "border-neutral-900 ring-2 ring-neutral-900"
                    : "border-neutral-200 hover:border-neutral-400"
                }`}
              >
                <div
                  className="mb-1.5 flex h-14 w-full flex-col justify-between rounded-md p-1.5"
                  style={{ backgroundColor: c.background }}
                >
                  <div className="flex items-center gap-1">
                    <span
                      className="h-3 w-3 rounded-sm"
                      style={{ backgroundColor: c.cards, boxShadow: `inset 0 0 0 1px ${c.border}` }}
                    />
                    <span
                      className="h-1.5 flex-1 rounded-full"
                      style={{ backgroundColor: c.brand }}
                    />
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="h-1.5 w-6 rounded-full" style={{ backgroundColor: c.text }} />
                    <span className="h-2 w-2 rounded-full" style={{ backgroundColor: c.lime }} />
                  </div>
                </div>
                <p className="flex items-center gap-1 truncate text-xs font-medium text-neutral-700">
                  {active && <Check className="size-3 shrink-0 text-neutral-900" />}
                  {preset.name}
                </p>
              </button>
            )
          })}
        </div>

        <details className="mt-4 rounded-lg border border-neutral-200">
          <summary className="cursor-pointer px-3 py-2 text-xs font-medium text-neutral-600">
            Fine-tune colours
          </summary>
          <div className="space-y-3 border-t border-neutral-100 p-3">
            {THEME_TOKENS.map((token) => {
              const value = colors[token.key] ?? token.default
              const changed = value.toLowerCase() !== token.default.toLowerCase()
              return (
                <div key={token.key} className="flex items-center gap-3">
                  <label
                    className="relative size-8 shrink-0 rounded-md border border-neutral-200"
                    style={{ backgroundColor: value }}
                    title="Pick a colour"
                  >
                    <input
                      type="color"
                      value={/^#[0-9a-f]{6}$/i.test(value) ? value : token.default}
                      onChange={(e) => setField(`theme.colors.${token.key}`, e.target.value)}
                      className="absolute inset-0 cursor-pointer opacity-0"
                    />
                  </label>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-medium text-neutral-800">{token.label}</p>
                  </div>
                  <input
                    type="text"
                    value={value}
                    onChange={(e) => setField(`theme.colors.${token.key}`, e.target.value)}
                    spellCheck={false}
                    className="w-20 rounded border border-neutral-200 px-1.5 py-1 font-mono text-xs"
                  />
                  <button
                    type="button"
                    onClick={() => setField(`theme.colors.${token.key}`, token.default)}
                    className={`text-neutral-300 hover:text-neutral-700 ${changed ? "" : "invisible"}`}
                    aria-label={`Reset ${token.label}`}
                  >
                    <RotateCcw className="size-3.5" />
                  </button>
                </div>
              )
            })}
          </div>
        </details>
      </div>
    </div>
  )
}
