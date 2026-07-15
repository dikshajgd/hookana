"use client"

import type { ReactNode, CSSProperties } from "react"
import { themeVars, themeFontVars } from "@/lib/admin/theme-tokens"
import { useEditable } from "./editor-context"

type Theme = {
  colors?: Record<string, string>
  fonts?: { heading?: string; body?: string }
}

/**
 * Wraps the landing page and sets the theme's CSS custom properties (colours +
 * fonts) on a container, so every `bg-cream` / `text-ink` / `font-editorial` /…
 * utility inside inherits the override. On the public site it renders the saved
 * theme (from props) statically; in the editor it reads the reactive working
 * copy so changes preview live. With no saved theme it emits nothing — the
 * globals.css defaults stand.
 */
export function ThemeScope({ theme, children }: { theme?: Theme | null; children: ReactNode }) {
  const resolved = useEditable("theme", theme, {} as Theme)
  const style = {
    ...themeVars(resolved?.colors),
    ...themeFontVars(resolved?.fonts),
  } as CSSProperties

  return <div style={style}>{children}</div>
}
