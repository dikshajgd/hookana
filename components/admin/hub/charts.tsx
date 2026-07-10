"use client"

/**
 * Tiny dependency-free chart primitives for the admin analytics.
 * Inline SVG / CSS only, tuned for the light admin surface. Each degrades
 * gracefully on empty data so panels never crash on a fresh install.
 */

import type { ReactNode } from "react"

export const CHART_COLORS = {
  blue: "#2563eb",
  violet: "#7c3aed",
  green: "#16a34a",
  amber: "#d97706",
  pink: "#db2777",
  red: "#dc2626",
  slate: "#64748b",
}

const PALETTE = Object.values(CHART_COLORS)

export function StatTile({
  label,
  value,
  sub,
  icon,
  accent = CHART_COLORS.blue,
}: {
  label: string
  value: string | number
  sub?: string
  icon?: ReactNode
  accent?: string
}) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5">
      {icon && (
        <div
          className="mb-3 flex size-9 items-center justify-center rounded-lg"
          style={{ backgroundColor: `${accent}14`, color: accent }}
        >
          {icon}
        </div>
      )}
      <p className="text-3xl font-bold tracking-tight text-gray-900">
        {typeof value === "number" ? value.toLocaleString() : value}
      </p>
      <p className="mt-1 text-sm font-medium text-gray-700">{label}</p>
      {sub && <p className="mt-0.5 text-xs text-gray-400">{sub}</p>}
    </div>
  )
}

export function Donut({
  segments,
  centerLabel,
  centerValue,
}: {
  segments: { label: string; value: number; color?: string }[]
  centerLabel?: string
  centerValue?: string | number
}) {
  const total = segments.reduce((s, x) => s + x.value, 0)
  const r = 60
  const c = 2 * Math.PI * r
  let offset = 0

  return (
    <div className="flex items-center gap-6">
      <svg viewBox="0 0 160 160" className="size-40 shrink-0 -rotate-90">
        <circle cx="80" cy="80" r={r} fill="none" stroke="#f1f5f9" strokeWidth="18" />
        {total > 0 &&
          segments.map((seg, i) => {
            const len = (seg.value / total) * c
            const el = (
              <circle
                key={i}
                cx="80"
                cy="80"
                r={r}
                fill="none"
                stroke={seg.color ?? PALETTE[i % PALETTE.length]}
                strokeWidth="18"
                strokeDasharray={`${len} ${c - len}`}
                strokeDashoffset={-offset}
              />
            )
            offset += len
            return el
          })}
      </svg>
      <div className="min-w-0">
        {centerValue !== undefined && (
          <>
            <p className="text-2xl font-bold text-gray-900">
              {typeof centerValue === "number" ? centerValue.toLocaleString() : centerValue}
            </p>
            {centerLabel && <p className="mb-3 text-xs text-gray-400">{centerLabel}</p>}
          </>
        )}
        <ul className="space-y-1.5">
          {segments.map((seg, i) => (
            <li key={i} className="flex items-center gap-2 text-sm">
              <span
                className="size-2.5 rounded-full"
                style={{ backgroundColor: seg.color ?? PALETTE[i % PALETTE.length] }}
              />
              <span className="text-gray-600">{seg.label}</span>
              <span className="ml-auto font-semibold text-gray-900">
                {seg.value.toLocaleString()}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}

export function HBars({
  items,
  emptyLabel = "No data yet",
}: {
  items: { label: string; value: number; color?: string }[]
  emptyLabel?: string
}) {
  const max = Math.max(1, ...items.map((i) => i.value))
  if (items.length === 0) return <p className="text-sm text-gray-400">{emptyLabel}</p>
  return (
    <div className="space-y-2.5">
      {items.map((item, i) => (
        <div key={i} className="flex items-center gap-3">
          <span className="w-28 shrink-0 truncate text-xs font-medium text-gray-600 capitalize">
            {item.label}
          </span>
          <div className="h-5 flex-1 overflow-hidden rounded bg-gray-100">
            <div
              className="h-full rounded"
              style={{
                width: `${(item.value / max) * 100}%`,
                backgroundColor: item.color ?? PALETTE[i % PALETTE.length],
              }}
            />
          </div>
          <span className="w-10 shrink-0 text-right text-xs font-semibold text-gray-800">
            {item.value.toLocaleString()}
          </span>
        </div>
      ))}
    </div>
  )
}

export function AreaTrend({
  points,
  color = CHART_COLORS.blue,
  height = 160,
  valueSuffix = "",
}: {
  points: { label: string; value: number }[]
  color?: string
  height?: number
  valueSuffix?: string
}) {
  if (points.length < 2) {
    return (
      <div
        className="flex items-center justify-center rounded-lg bg-gray-50 text-sm text-gray-400"
        style={{ height }}
      >
        Not enough data to chart yet
      </div>
    )
  }

  const W = 600
  const H = 180
  const padX = 8
  const padY = 16
  const max = Math.max(...points.map((p) => p.value))
  const min = Math.min(...points.map((p) => p.value))
  const span = max - min || 1
  const x = (i: number) => padX + (i / (points.length - 1)) * (W - padX * 2)
  const y = (v: number) => padY + (1 - (v - min) / span) * (H - padY * 2)

  const line = points.map((p, i) => `${i === 0 ? "M" : "L"} ${x(i)} ${y(p.value)}`).join(" ")
  const area = `${line} L ${x(points.length - 1)} ${H - padY} L ${x(0)} ${H - padY} Z`
  const last = points[points.length - 1]

  return (
    <div>
      <div className="mb-2 flex items-baseline justify-between">
        <span className="text-2xl font-bold text-gray-900">
          {last.value.toLocaleString()}
          {valueSuffix}
        </span>
        <span className="text-xs text-gray-400">
          {points[0].label} → {last.label}
        </span>
      </div>
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ height }} preserveAspectRatio="none">
        <defs>
          <linearGradient id={`grad-${color.slice(1)}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0.25" />
            <stop offset="100%" stopColor={color} stopOpacity="0" />
          </linearGradient>
        </defs>
        <path d={area} fill={`url(#grad-${color.slice(1)})`} />
        <path d={line} fill="none" stroke={color} strokeWidth="2.5" strokeLinejoin="round" />
        <circle cx={x(points.length - 1)} cy={y(last.value)} r="4" fill={color} />
      </svg>
    </div>
  )
}

export function ChartCard({
  title,
  subtitle,
  children,
  className,
}: {
  title: string
  subtitle?: string
  children: ReactNode
  className?: string
}) {
  return (
    <div className={`rounded-xl border border-gray-200 bg-white p-6 ${className ?? ""}`}>
      <div className="mb-4">
        <h3 className="text-sm font-semibold text-gray-900">{title}</h3>
        {subtitle && <p className="text-xs text-gray-400">{subtitle}</p>}
      </div>
      {children}
    </div>
  )
}
