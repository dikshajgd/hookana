"use client"

import { X } from "lucide-react"
import { useEditor, useEditable } from "@/components/admin/editor/editor-context"
import { useListControls, AddItemButton } from "@/components/admin/editor/editable-list"
import { EditableText } from "@/components/admin/editor/editable-text"

const FALLBACK_ITEMS = [
  "US · AU · India",
  "4.9★ client rating",
  "48-hr avg turnaround",
  "10,000+ creatives shipped",
  "50+ D2C brands served",
]

export function StatsMarquee({ items }: { items: string[] }) {
  const { editing } = useEditor()
  const section = useEditable("stats", items.length > 0 ? { marqueeItems: items } : null, {
    marqueeItems: FALLBACK_ITEMS,
  })
  const source =
    section.marqueeItems && section.marqueeItems.length > 0 ? section.marqueeItems : FALLBACK_ITEMS
  const controls = useListControls("stats.marqueeItems")

  if (editing) {
    return (
      <div className="w-full border-y border-ash bg-cream px-6 py-6">
        <p className="mb-4 text-center text-xs font-semibold tracking-widest text-ink/50 uppercase">
          Ticker items · scroll across the live site
        </p>
        <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-center gap-2.5">
          {source.map((item, i) => (
            <span
              key={i}
              className="inline-flex items-center gap-1 rounded-full border border-ash bg-paper-white px-3 py-1.5"
            >
              <span className="text-lime-brand">✦</span>
              <EditableText
                path={`stats.marqueeItems.${i}`}
                value={item}
                rich={false}
                className="font-ease text-sm text-voltage-blue"
              />
              <button
                type="button"
                onClick={() => controls.remove(i)}
                className="ml-1 text-ink/40 hover:text-red-500"
                aria-label="Remove item"
              >
                <X className="size-3.5" />
              </button>
            </span>
          ))}
          <AddItemButton label="Add item" onClick={() => controls.add("New item")} />
        </div>
      </div>
    )
  }

  const repeatedStats = [...source, ...source, ...source, ...source, ...source]

  return (
    <>
      <style>{`
        @keyframes scrollMarqueeStats {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-marquee-stats {
          animation: scrollMarqueeStats 40s linear infinite;
        }
      `}</style>

      <div className="flex h-18 w-full items-center overflow-hidden border-y border-ash bg-cream">
        <div className="animate-marquee-stats flex w-max items-center">
          {repeatedStats.map((stat, idx) => (
            <div key={idx} className="flex shrink-0 items-center">
              <span className="font-ease text-[16px] font-light uppercase tracking-[-0.02em] whitespace-nowrap text-voltage-blue">
                <span className="text-lime-brand">✦</span> {stat}
              </span>
              <div className="w-12 shrink-0 sm:w-24 lg:w-40" />
            </div>
          ))}
        </div>
      </div>
    </>
  )
}
