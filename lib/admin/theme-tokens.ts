/**
 * The editable theme — colours + fonts.
 *
 * The site's look is driven by Tailwind v4 `@theme` CSS variables (see
 * app/globals.css). Overriding those variables recolours/re-fonts every utility
 * that references them, so the theme editor just writes a few values and
 * <ThemeScope> sets the matching CSS vars on a wrapper around the page.
 *
 * Kept intentionally small: a handful of colour knobs + heading/body font, so
 * it's a "slightly adjust the look" tool, not a full design system.
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
    hint: "The canvas behind every section.",
    vars: ["--color-cream", "--color-warm-linen", "--color-charcoal", "--color-sand"],
    default: "#ffffff",
  },
  {
    key: "cards",
    label: "Cards & panels",
    hint: "Hero cards, pricing cards, the contact panel.",
    vars: ["--color-paper-white", "--color-card"],
    default: "#ffffff",
  },
  {
    key: "text",
    label: "Text & headings",
    hint: "Headlines, paragraphs and labels.",
    vars: ["--color-ink", "--color-voltage-blue", "--color-foreground"],
    default: "#161900",
  },
  {
    key: "accent",
    label: "Accent text",
    hint: "Service titles, stat labels, receipt figures.",
    vars: ["--color-hot-pink", "--color-primary"],
    default: "#3e4600",
  },
  {
    key: "highlight",
    label: "Highlight & buttons",
    hint: "Button fills, underlines and pills.",
    vars: ["--color-lime-brand"],
    default: "#eefe90",
  },
  {
    key: "border",
    label: "Borders",
    hint: "Hairline borders and dividers.",
    vars: ["--color-ash", "--color-stone", "--color-border"],
    default: "#e2e8f0",
  },
]

export const THEME_DEFAULT_COLORS: Record<string, string> = Object.fromEntries(
  THEME_TOKENS.map((t) => [t.key, t.default])
)

// ---- fonts ----------------------------------------------------------------

export type FontOption = { id: string; label: string; stack: string }

export const FONT_OPTIONS: FontOption[] = [
  { id: "dm-sans", label: "DM Sans", stack: "var(--font-dm-sans), ui-sans-serif, system-ui, sans-serif" },
  { id: "staatliches", label: "Staatliches", stack: "var(--font-staatliches), Impact, sans-serif" },
  { id: "serif", label: "Cormorant serif", stack: "var(--font-cormorant), Georgia, ui-serif, serif" },
  { id: "inter", label: "Inter", stack: "var(--font-inter), ui-sans-serif, system-ui, sans-serif" },
  { id: "mono", label: "Monospace", stack: "var(--font-mono), ui-monospace, monospace" },
]

/** Which CSS vars each font role drives. */
export const FONT_TARGETS: Record<"heading" | "body", string[]> = {
  heading: ["--font-editorial", "--font-sans"],
  body: ["--font-ease", "--font-serif"],
}

export const THEME_DEFAULT_FONTS: { heading: string; body: string } = {
  heading: "dm-sans",
  body: "dm-sans",
}

// ---- style builders -------------------------------------------------------

/** Inline `style` (CSS custom properties) for a saved set of theme colours. */
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

/** Inline `style` for chosen heading/body fonts. */
export function themeFontVars(
  fonts: { heading?: string; body?: string } | undefined
): Record<string, string> {
  const style: Record<string, string> = {}
  if (!fonts) return style
  const apply = (id: string | undefined, targets: string[]) => {
    if (!id) return
    const opt = FONT_OPTIONS.find((o) => o.id === id)
    if (!opt) return
    for (const t of targets) style[t] = opt.stack
  }
  apply(fonts.heading, FONT_TARGETS.heading)
  apply(fonts.body, FONT_TARGETS.body)
  return style
}
