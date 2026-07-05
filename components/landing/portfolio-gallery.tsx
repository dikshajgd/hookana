"use client"

import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { Play, X, ChevronLeft, ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"
import type { MediaItem, PortfolioBundles } from "@/lib/portfolio-media"

type Filter = "all" | "ai" | "static" | "video"

const FILTERS: { value: Filter; label: string }[] = [
  { value: "all", label: "All work" },
  { value: "ai", label: "AI" },
  { value: "static", label: "Static" },
  { value: "video", label: "Videos" },
]

export function PortfolioGallery({
  bundles,
  defaultFilter = "all",
  showFilters = true,
}: {
  bundles: PortfolioBundles
  defaultFilter?: Filter
  showFilters?: boolean
}) {
  const [filter, setFilter] = useState<Filter>(defaultFilter)
  const [activeIndex, setActiveIndex] = useState<number | null>(null)

  const visible = useMemo<MediaItem[]>(() => bundles[filter], [bundles, filter])

  // Reset the lightbox whenever the filtered set changes underneath it.
  useEffect(() => {
    setActiveIndex(null)
  }, [filter])

  const open = useCallback((i: number) => setActiveIndex(i), [])
  const close = useCallback(() => setActiveIndex(null), [])
  const step = useCallback(
    (dir: number) =>
      setActiveIndex((i) =>
        i === null ? i : (i + dir + visible.length) % visible.length
      ),
    [visible.length]
  )

  return (
    <div>
      {/* Filters */}
      {showFilters && <div className="mt-10 flex flex-wrap items-center gap-2">
        {FILTERS.map((f) => {
          const count = bundles[f.value].length
          const active = filter === f.value
          return (
            <button
              key={f.value}
              type="button"
              onClick={() => setFilter(f.value)}
              className={cn(
                "font-ease inline-flex items-center gap-1.5 rounded-full border-[1.5px] px-5 py-2 text-sm font-light uppercase tracking-[-0.02em] transition-colors",
                active
                  ? "border-voltage-blue text-voltage-blue"
                  : "border-ash text-ink hover:border-voltage-blue hover:text-voltage-blue"
              )}
            >
              {f.label}
              <span
                className={cn(
                  "text-xs tabular-nums",
                  active ? "text-background/70" : "text-muted-foreground"
                )}
              >
                {count}
              </span>
            </button>
          )
        })}
      </div>}

      {/* Grid */}
      <div className="mt-8 grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-4">
        {visible.map((item, i) => (
          <MediaCard key={item.id} item={item} onOpen={() => open(i)} />
        ))}
      </div>

      {activeIndex !== null && (
        <Lightbox
          item={visible[activeIndex]}
          onClose={close}
          onPrev={() => step(-1)}
          onNext={() => step(1)}
        />
      )}
    </div>
  )
}

function MediaCard({
  item,
  onOpen,
}: {
  item: MediaItem
  onOpen: () => void
}) {
  const wrapRef = useRef<HTMLButtonElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const [loadVideo, setLoadVideo] = useState(false)
  const [playing, setPlaying] = useState(false)

  const isVideo = item.kind === "video"

  const play = useCallback(() => {
    if (!isVideo) return
    setLoadVideo(true)
    const v = videoRef.current
    if (v) {
      v.play().then(() => setPlaying(true)).catch(() => {})
    }
  }, [isVideo])

  const stop = useCallback(() => {
    const v = videoRef.current
    if (v) {
      v.pause()
      v.currentTime = 0
    }
    setPlaying(false)
  }, [])

  // On touch devices there's no hover: play the preview while the card is
  // centered in the viewport, pause it once it scrolls away.
  useEffect(() => {
    if (!isVideo) return
    const el = wrapRef.current
    if (!el) return
    const hasHover = window.matchMedia("(hover: hover)").matches
    if (hasHover) return

    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && entry.intersectionRatio > 0.7) play()
        else stop()
      },
      { threshold: [0, 0.7, 1] }
    )
    obs.observe(el)
    return () => obs.disconnect()
  }, [isVideo, play, stop])

  return (
    <button
      ref={wrapRef}
      type="button"
      onClick={onOpen}
      onMouseEnter={play}
      onMouseLeave={stop}
      className="group relative block aspect-[4/5] w-full overflow-hidden rounded-none border border-ash bg-sand transition-transform hover:-translate-y-0.5 focus-visible:ring-2 focus-visible:ring-ink focus-visible:outline-none"
      aria-label={isVideo ? "Play video" : "View image"}
    >
      {/* Poster — always present, keeps the grid stable and cheap */}
      <img
        src={item.poster}
        alt=""
        loading="lazy"
        decoding="async"
        className={cn(
          "absolute inset-0 h-full w-full object-cover transition-opacity duration-300",
          playing ? "opacity-0" : "opacity-100"
        )}
      />

      {isVideo && loadVideo && (
        <video
          ref={videoRef}
          src={item.preview}
          poster={item.poster}
          muted
          loop
          playsInline
          autoPlay
          preload="none"
          onPlaying={() => setPlaying(true)}
          className={cn(
            "absolute inset-0 h-full w-full object-cover transition-opacity duration-300",
            playing ? "opacity-100" : "opacity-0"
          )}
        />
      )}

      {/* Subtle gradient + play affordance for videos */}
      {isVideo && (
        <>
          <div
            className={cn(
              "pointer-events-none absolute inset-0 bg-gradient-to-t from-black/30 to-transparent transition-opacity",
              playing ? "opacity-0" : "opacity-100"
            )}
          />
          <div
            className={cn(
              "pointer-events-none absolute right-2.5 bottom-2.5 flex h-9 w-9 items-center justify-center rounded-full bg-white/90 text-black shadow-md transition-opacity",
              playing ? "opacity-0" : "opacity-100"
            )}
          >
            <Play className="size-4 translate-x-px fill-current" />
          </div>
        </>
      )}

      <span className="pointer-events-none absolute top-2.5 left-2.5 rounded-none border border-ink bg-lime-brand px-2 py-0.5 font-ease text-[10px] font-light tracking-widest text-ink uppercase opacity-0 transition-opacity group-hover:opacity-100">
        {isVideo ? "Reel" : "Static"}
      </span>
    </button>
  )
}

function Lightbox({
  item,
  onClose,
  onPrev,
  onNext,
}: {
  item: MediaItem
  onClose: () => void
  onPrev: () => void
  onNext: () => void
}) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose()
      else if (e.key === "ArrowLeft") onPrev()
      else if (e.key === "ArrowRight") onNext()
    }
    window.addEventListener("keydown", onKey)
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = "hidden"
    return () => {
      window.removeEventListener("keydown", onKey)
      document.body.style.overflow = prevOverflow
    }
  }, [onClose, onPrev, onNext])

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/85 p-4 backdrop-blur-sm sm:p-8"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <button
        type="button"
        onClick={onClose}
        className="absolute top-4 right-4 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20"
        aria-label="Close"
      >
        <X className="size-5" />
      </button>

      <NavButton side="left" onClick={onPrev} />
      <NavButton side="right" onClick={onNext} />

      <div
        className="flex max-h-full max-w-full items-center justify-center"
        onClick={(e) => e.stopPropagation()}
      >
        {item.kind === "video" ? (
          <video
            key={item.id}
            src={item.full}
            poster={item.poster}
            controls
            autoPlay
            playsInline
            className="max-h-[85vh] max-w-full rounded-xl shadow-2xl"
          />
        ) : (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            key={item.id}
            src={item.full}
            alt=""
            className="max-h-[85vh] max-w-full rounded-xl object-contain shadow-2xl"
          />
        )}
      </div>
    </div>
  )
}

function NavButton({
  side,
  onClick,
}: {
  side: "left" | "right"
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation()
        onClick()
      }}
      className={cn(
        "absolute top-1/2 z-10 hidden h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20 sm:flex",
        side === "left" ? "left-4" : "right-4"
      )}
      aria-label={side === "left" ? "Previous" : "Next"}
    >
      {side === "left" ? (
        <ChevronLeft className="size-6" />
      ) : (
        <ChevronRight className="size-6" />
      )}
    </button>
  )
}
