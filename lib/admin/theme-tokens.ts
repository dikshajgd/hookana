/**
 * The editable theme.
 *
 * The site's look is driven by Tailwind v4 `@theme` CSS variables (see
 * app/globals.css). Overriding those variables at runtime recolours every
 * utility that references them (`bg-cream`, `text-voltage-blue`, …) — so the
 * theme editor just needs to write a few hex values and set the matching CSS
 * vars on a wrapper around the page.
 *
 * Each control maps one friendly colour to the group of CSS vars it should
 * drive (e.g. "Page background" drives all the cream/canvas aliases so the
 * whole page changes together).
 */

export type ThemeToken = {
  key: string
  label: string
  hint: string
  /** CSS custom properties this control overrides. */
  vars: string[]
  default: string
}

export const THEME_TOKENS: ThemeToken[] = [
  {
    key: "background",
    label: "Page background",
    hint: "The main canvas behind every section.",
    vars: ["--color-cream", "--color-warm-linen", "--color-charcoal", "--color-sand"],
    default: "#f5ead4",
  },
  {
    key: "cards",
    label: "Cards & panels",
    hint: "Hero cards, pricing cards, the contact panel.",
    vars: ["--color-paper-white", "--color-card"],
    default: "#faf3e6",
  },
  {
    key: "brand",
    label: "Brand / accent",
    hint: "Headlines, buttons, links and key accents.",
    vars: ["--color-voltage-blue", "--color-primary", "--color-hot-pink"],
    default: "#006eff",
  },
  {
    key: "text",
    label: "Body text",
    hint: "Paragraph and label text.",
    vars: ["--color-ink"],
    default: "#000000",
  },
  {
    key: "border",
    label: "Borders",
    hint: "Hairline borders and dividers.",
    vars: ["--color-ash", "--color-stone", "--color-border"],
    default: "#e2d9c8",
  },
  {
    key: "lime",
    label: "Lime highlight",
    hint: "The secondary lime accent.",
    vars: ["--color-lime-brand"],
    default: "#c1f32b",
  },
]

export const THEME_DEFAULT_COLORS: Record<string, string> = Object.fromEntries(
  THEME_TOKENS.map((t) => [t.key, t.default])
)

/**
 * Build the inline `style` object (CSS custom properties) that applies a saved
 * set of theme colours. Only keys with a value are emitted, so an unset theme
 * leaves the globals.css defaults untouched.
 */
export function themeVars(colors: Record<string, string> | undefined): Record<string, string> {
  const style: Record<string, string> = {}
  if (!colors) return style
  for (const token of THEME_TOKENS) {
    const value = colors[token.key]
    if (typeof value === "string" && value) {
      for (const cssVar of token.vars) style[cssVar] = value
    }
  }
  return style
}
