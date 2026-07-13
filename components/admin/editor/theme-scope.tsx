"use client"

import type { ReactNode, CSSProperties } from "react"
import { themeVars } from "@/lib/admin/theme-tokens"
import { useEditable } from "./editor-context"

/**
 * Wraps the landing page and sets the theme's CSS custom properties on a
 * container, so every `bg-cream` / `text-voltage-blue` / … utility inside
 * inherits the override. On the public site it renders the saved theme (from
 * props) statically; in the editor it reads the reactive working copy so colour
 * changes preview live. With no saved theme it emits no vars — the globals.css
 * defaults stand.
 */
export function ThemeScope({
  theme,
  children,
}: {
  theme?: { colors?: Record<string, string> } | null
  children: ReactNode
}) {
  const resolved = useEditable("theme", theme, {} as { colors?: Record<string, string> })
  const style = themeVars(resolved?.colors) as CSSProperties

  return <div style={style}>{children}</div>
}
