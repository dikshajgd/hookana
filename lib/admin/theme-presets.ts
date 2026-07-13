/**
 * Theme presets — complete, ready-made colour configs.
 *
 * Each preset is just an alternate value of `site_settings.theme.colors` (the
 * same six keys the theme editor drives). Selecting one in the site editor
 * applies the whole set live via <ThemeScope>; nothing goes live until Publish,
 * so previewing is always separate from publishing.
 *
 * Adding a new look is a one-line config entry here — no code changes.
 */

export type ThemePreset = {
  id: string
  name: string
  colors: {
    background: string
    cards: string
    brand: string
    text: string
    border: string
    lime: string
  }
}

export const THEME_PRESETS: ThemePreset[] = [
  // Warm / light
  { id: "cream-ink", name: "Cream & Ink", colors: { background: "#f5ead4", cards: "#faf3e6", brand: "#006eff", text: "#000000", border: "#e2d9c8", lime: "#c1f32b" } },
  { id: "paper-white", name: "Paper White", colors: { background: "#ffffff", cards: "#f7f7f5", brand: "#111111", text: "#1a1a1a", border: "#e5e5e5", lime: "#84cc16" } },
  { id: "warm-linen", name: "Warm Linen", colors: { background: "#efe7db", cards: "#f7f1e8", brand: "#b45309", text: "#292524", border: "#ddd3c4", lime: "#a3b18a" } },
  { id: "sand-clay", name: "Sand & Clay", colors: { background: "#efe9e1", cards: "#f8f4ee", brand: "#9a3412", text: "#292524", border: "#ddd0c0", lime: "#ca8a04" } },
  { id: "sunset", name: "Sunset", colors: { background: "#fff7ed", cards: "#fffbf5", brand: "#ea580c", text: "#431407", border: "#fed7aa", lime: "#f59e0b" } },
  { id: "blush", name: "Blush", colors: { background: "#fdf2f8", cards: "#ffffff", brand: "#db2777", text: "#500724", border: "#fbcfe8", lime: "#f472b6" } },
  { id: "lavender", name: "Lavender", colors: { background: "#f5f3ff", cards: "#ffffff", brand: "#7c3aed", text: "#2e1065", border: "#ddd6fe", lime: "#a78bfa" } },

  // Cool / fresh
  { id: "cool-mist", name: "Cool Mist", colors: { background: "#eef2f6", cards: "#ffffff", brand: "#2563eb", text: "#0f172a", border: "#dbe3ec", lime: "#22c55e" } },
  { id: "ocean", name: "Ocean", colors: { background: "#ecfeff", cards: "#ffffff", brand: "#0891b2", text: "#083344", border: "#a5f3fc", lime: "#14b8a6" } },
  { id: "mint-fresh", name: "Mint Fresh", colors: { background: "#f0fdf4", cards: "#ffffff", brand: "#059669", text: "#052e16", border: "#bbf7d0", lime: "#4ade80" } },
  { id: "sage", name: "Sage", colors: { background: "#eef2ec", cards: "#f8faf6", brand: "#3f6212", text: "#1a2e05", border: "#d7e0d0", lime: "#84cc16" } },

  // Neutral / mono
  { id: "slate-mono", name: "Slate Mono", colors: { background: "#f1f5f9", cards: "#ffffff", brand: "#0f172a", text: "#0f172a", border: "#cbd5e1", lime: "#64748b" } },

  // Dark
  { id: "midnight", name: "Midnight", colors: { background: "#0f172a", cards: "#1e293b", brand: "#38bdf8", text: "#e2e8f0", border: "#334155", lime: "#a3e635" } },
  { id: "noir", name: "Noir", colors: { background: "#111111", cards: "#1c1c1c", brand: "#ffffff", text: "#ededed", border: "#2e2e2e", lime: "#c1f32b" } },
  { id: "forest", name: "Forest", colors: { background: "#0b1f16", cards: "#12291d", brand: "#34d399", text: "#d1fae5", border: "#1f3d2e", lime: "#a3e635" } },
  { id: "graphite", name: "Graphite", colors: { background: "#1a1a1a", cards: "#262626", brand: "#fbbf24", text: "#f5f5f5", border: "#3a3a3a", lime: "#fbbf24" } },
]

/** The preset whose colours exactly match the current theme, if any. */
export function matchingPresetId(colors: Record<string, string> | undefined): string | null {
  if (!colors) return null
  const eq = (a?: string, b?: string) => (a ?? "").toLowerCase() === (b ?? "").toLowerCase()
  const match = THEME_PRESETS.find(
    (p) =>
      eq(p.colors.background, colors.background) &&
      eq(p.colors.cards, colors.cards) &&
      eq(p.colors.brand, colors.brand) &&
      eq(p.colors.text, colors.text) &&
      eq(p.colors.border, colors.border) &&
      eq(p.colors.lime, colors.lime)
  )
  return match?.id ?? null
}
