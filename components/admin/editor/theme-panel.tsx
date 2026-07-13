"use client"

import { Palette, RotateCcw, X } from "lucide-react"
import { THEME_TOKENS } from "@/lib/admin/theme-tokens"
import { useEditor } from "./editor-context"

/**
 * Floating colour palette for the whole-site theme. Each swatch writes to
 * `theme.colors.<key>`, which <ThemeScope> turns into live CSS-variable
 * overrides — so the page recolours as she picks. Publish persists it.
 */
export function ThemePanel({ onClose }: { onClose: () => void }) {
  const { settings, setField } = useEditor()
  const colors: Record<string, string> = settings.theme?.colors ?? {}

  return (
    <div className="fixed top-16 right-4 z-[210] w-80 rounded-xl border border-neutral-200 bg-white p-4 shadow-2xl">
      <div className="mb-1 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Palette className="size-4" />
          <h3 className="text-sm font-semibold text-neutral-900">Theme colours</h3>
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
      <p className="mb-3 text-xs text-neutral-400">Recolours the whole site. Previews live.</p>

      <div className="space-y-3">
        {THEME_TOKENS.map((token) => {
          const value = colors[token.key] ?? token.default
          const changed = value.toLowerCase() !== token.default.toLowerCase()
          return (
            <div key={token.key} className="flex items-center gap-3">
              <label
                className="relative size-9 shrink-0 cursor-pointer rounded-md border border-neutral-200"
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
                <p className="text-sm font-medium text-neutral-800">{token.label}</p>
                <p className="truncate text-xs text-neutral-400">{token.hint}</p>
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
    </div>
  )
}
