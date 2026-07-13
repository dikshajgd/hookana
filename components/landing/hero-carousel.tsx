"use client"

import { X } from "lucide-react"
import type { LogoItem } from "@/sanity/lib/types"
import { useEditor, useEditable } from "@/components/admin/editor/editor-context"
import { useListControls, AddItemButton } from "@/components/admin/editor/editable-list"
import { EditableText } from "@/components/admin/editor/editable-text"
import { EditableMedia } from "@/components/admin/editor/editable-media"

const FALLBACK_LOGOS: LogoItem[] = [
  { alt: "Nutrisense", imageUrl: "/logos/Nutrisense.png" },
  { alt: "Salt Labs", imageUrl: "/logos/SaltLabs.png" },
  // { alt: "SkinnyRx", imageUrl: "/logos/SkinnyRx.png" },
  { alt: "Studio Era", imageUrl: "/logos/StudioEra.png" },
  { alt: "TOB", imageUrl: "/logos/TOB.png" },
  { alt: "Veralane", imageUrl: "/logos/Veralane.png" },
  { alt: "Brainjolt", imageUrl: "/logos/brainjolt.png" },
  { alt: "Tata Fit", imageUrl: "/logos/tata-fit.png" },
  // { alt: "Jet Learn", imageUrl: "/logos/jet-learn.png" },
  { alt: "Intel", imageUrl: "/logos/intel.png" },
  { alt: "Dell", imageUrl: "/logos/dell.png" },
]

export function HeroCarousel({ logos }: { logos?: LogoItem[] }) {
  const { editing } = useEditor()
  const section = useEditable("logoTicker", logos ? { logos } : null, { logos: FALLBACK_LOGOS })
  const items = section.logos && section.logos.length > 0 ? section.logos : FALLBACK_LOGOS
  const logoControls = useListControls("logoTicker.logos")

  // A moving marquee is impossible to edit; in edit mode swap in a static,
  // fully-editable panel of the same logos. The public site keeps the marquee.
  if (editing) {
    return (
      <div className="relative z-10 w-full bg-charcoal px-6 py-10">
        <p className="mb-6 text-center text-xs font-semibold tracking-widest text-white/50 uppercase">
          Brand logos · shown as a scrolling ticker on the live site
        </p>
        <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-center gap-5">
          {items.map((item, idx) => (
            <div key={idx} className="relative flex flex-col items-center gap-2">
              <button
                type="button"
                onClick={() => logoControls.remove(idx)}
                className="absolute -top-2 -right-2 z-50 flex size-6 items-center justify-center rounded-full bg-white text-neutral-900 shadow hover:bg-red-500 hover:text-white"
                aria-label="Remove logo"
              >
                <X className="size-3.5" />
              </button>
              <EditableMedia
                path={`logoTicker.logos.${idx}.imageUrl`}
                kind="image"
                className="flex h-20 w-36 items-center justify-center rounded-md border border-white/10 bg-white/5"
              >
                {item.imageUrl ? (
                  <img
                    src={item.imageUrl}
                    alt={item.alt}
                    className="h-10 max-w-28 object-contain brightness-0 invert"
                  />
                ) : (
                  <span className="text-[10px] tracking-wide text-white/40 uppercase">No logo</span>
                )}
              </EditableMedia>
              <EditableText
                path={`logoTicker.logos.${idx}.alt`}
                value={item.alt}
                rich={false}
                className="text-center text-[11px] text-white/60"
              />
            </div>
          ))}
          <AddItemButton
            label="Add logo"
            onClick={() => logoControls.add({ alt: "New logo", imageUrl: "" })}
            className="border-white/30 text-white/70 hover:border-white hover:text-white"
          />
        </div>
      </div>
    )
  }

  const repeated = [...items, ...items, ...items, ...items]

  return (
    <>
      <style>{`
        @keyframes scrollMarquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-marquee {
          animation: scrollMarquee 40s linear infinite;
        }
      `}</style>
      <div className="pointer-events-none relative z-10 h-0 w-full overflow-x-clip overflow-y-visible">
        <div className="pointer-events-auto absolute -top-20 left-1/2 h-66 w-234 origin-center -translate-x-1/2 scale-[0.45] transition-all duration-300 sm:-top-14 sm:scale-[0.55] md:scale-75 lg:-top-7 lg:right-5 lg:left-auto lg:origin-right lg:translate-x-0 lg:scale-90 xl:scale-100">
          <img
            src="/svg/the-roll.svg"
            alt=""
            aria-hidden="true"
            className="absolute inset-0 h-full w-full object-contain object-right"
          />

          <div className="absolute top-8 right-2 left-8 flex h-48 items-center overflow-hidden">
            <div className="animate-marquee flex w-max items-center">
              {repeated.map((item, idx) => (
                <div key={idx} className="flex items-center">
                  <div className="flex items-center justify-center px-10">
                    <img
                      src={item.imageUrl}
                      alt={item.alt}
                      className="h-10 max-w-32 object-contain brightness-0 invert"
                    />
                  </div>
                  <div className="h-20 border-l-4 border-dotted border-white" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
