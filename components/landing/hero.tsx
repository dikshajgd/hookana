"use client"

import { useState, useEffect, useRef } from "react"
import Link from "next/link"
import { ArrowUpRight, ArrowDown, Play, X, ChevronLeft, ChevronRight, Tag, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { cldImage, cldVideo, cldPoster } from "@/lib/cloudinary"
import type { HeroContent } from "@/sanity/lib/types"
import { useEditor, useEditable } from "@/components/admin/editor/editor-context"
import { useListControls, AddItemButton } from "@/components/admin/editor/editable-list"
import { EditableText } from "@/components/admin/editor/editable-text"
import { EditableMedia } from "@/components/admin/editor/editable-media"

// Public base for the homepage media re-hosted on Supabase Storage.
const SITE_MEDIA = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/portfolio-media/site`

const FALLBACK: HeroContent = {
  headline: "Creativity at Volume.",
  subheadline: "Without the compromise.",
  description:
    "D2C brands and performance teams need fresh creatives, fast, on-brand, and at scale. Hookana is the creative production engine that keeps your pipeline full without blowing your budget or burning out your team.",
  ctaText: "GET 2 FREE CONCEPTS",
  watchReelText: "WATCH THE REEL",
  // Re-hosted on Supabase Storage (migrated off Cloudinary via
  // scripts/migrate-site-videos.mjs). `poster` is the still frame Cloudinary
  // used to generate; Supabase can't derive it on the fly so we store it.
  videoCards: [
    { label: "Brand Films", url: `${SITE_MEDIA}/hero/web-1-neyohx.mp4`, poster: `${SITE_MEDIA}/hero/web-1-neyohx.jpg`, type: "video" },
    { label: "Ad Creatives", url: `${SITE_MEDIA}/hero/web-2-jqspsb.mp4`, poster: `${SITE_MEDIA}/hero/web-2-jqspsb.jpg`, type: "video" },
    { label: "Social Content", url: `${SITE_MEDIA}/hero/web-3-srdr8v.mp4`, poster: `${SITE_MEDIA}/hero/web-3-srdr8v.jpg`, type: "video" },
    { label: "Brand Films", url: `${SITE_MEDIA}/hero/web-4-hskvt6.mp4`, poster: `${SITE_MEDIA}/hero/web-4-hskvt6.jpg`, type: "video" },
    { label: "Ad Creatives", url: `${SITE_MEDIA}/hero/web-5-u6jm0u.mp4`, poster: `${SITE_MEDIA}/hero/web-5-u6jm0u.jpg`, type: "video" },
    { label: "Social Content", url: `${SITE_MEDIA}/hero/web-6-w4q8zh.mp4`, poster: `${SITE_MEDIA}/hero/web-6-w4q8zh.jpg`, type: "video" },
    { label: "Brand Films", url: `${SITE_MEDIA}/hero/web-7-mp8jqo.mp4`, poster: `${SITE_MEDIA}/hero/web-7-mp8jqo.jpg`, type: "video" },
    { label: "Ad Creatives", url: `${SITE_MEDIA}/hero/web-8-b8kyka.mp4`, poster: `${SITE_MEDIA}/hero/web-8-b8kyka.jpg`, type: "video" },
    { label: "Social Content", url: `${SITE_MEDIA}/hero/web-9-bvyerz.mp4`, poster: `${SITE_MEDIA}/hero/web-9-bvyerz.jpg`, type: "video" },
    { label: "Brand Films", url: `${SITE_MEDIA}/hero/web-10-nuhkfe.mp4`, poster: `${SITE_MEDIA}/hero/web-10-nuhkfe.jpg`, type: "video" },
    { label: "Ad Creatives", url: `${SITE_MEDIA}/hero/web-11-wdxwuy.mp4`, poster: `${SITE_MEDIA}/hero/web-11-wdxwuy.jpg`, type: "video" },
  ],
}

// Drive Capital: flat cream cards, hairline ash border, square corners.
const CARD_STYLES = [
  { bg: "bg-cream", labelColor: "text-ink" },
  { bg: "bg-cream", labelColor: "text-ink" },
  { bg: "bg-cream", labelColor: "text-ink" },
]

const VISIBLE = 3

function ytId(url: string) {
  return url.split("/shorts/")[1]?.split("?")[0] ?? ""
}

export function Hero({ content }: { content: HeroContent | null }) {
  const [activeVideo, setActiveVideo] = useState<number | null>(null)
  const [carouselStart, setCarouselStart] = useState(0)
  // Deterministic first render: server and client-first-paint must agree, so we
  // can't read window during render (that caused the hydration mismatch — server
  // rendered the mobile poster <img>, desktop client rendered <video>). Start
  // non-mobile + unmounted, then correct after mount.
  const [isMobile, setIsMobile] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [mobileVideoInView, setMobileVideoInView] = useState(false)
  const carouselRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setMounted(true)
    const check = () => setIsMobile(window.matchMedia("(max-width: 1023px)").matches)
    check()
    window.addEventListener("resize", check)
    return () => window.removeEventListener("resize", check)
  }, [])

  useEffect(() => {
    if (!isMobile || mobileVideoInView) return
    const el = carouselRef.current
    if (!el) return

    let hasScrolled = false
    let observer: IntersectionObserver | null = null

    const arm = () => {
      observer = new IntersectionObserver(
        (entries) => {
          if (!hasScrolled) return
          if (entries.some((e) => e.isIntersecting)) {
            setMobileVideoInView(true)
            observer?.disconnect()
          }
        },
        { threshold: 0.25 }
      )
      observer.observe(el)
    }

    const onScroll = () => {
      hasScrolled = true
      const rect = el.getBoundingClientRect()
      const vh = window.innerHeight || document.documentElement.clientHeight
      if (rect.top < vh * 0.75 && rect.bottom > 0) {
        setMobileVideoInView(true)
        observer?.disconnect()
        window.removeEventListener("scroll", onScroll)
      }
    }

    arm()
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => {
      observer?.disconnect()
      window.removeEventListener("scroll", onScroll)
    }
  }, [isMobile, mobileVideoInView])

  const { editing } = useEditor()
  const { headline, subheadline, description, ctaText, videoCards } = useEditable(
    "hero",
    content,
    FALLBACK
  )
  const cardControls = useListControls("hero.videoCards")
  const cards = videoCards?.length > 0 ? videoCards : FALLBACK.videoCards
  const maxStart = Math.max(0, cards.length - VISIBLE)
  const visibleCards = cards.slice(carouselStart, carouselStart + VISIBLE)

  useEffect(() => {
    if (editing) return // hold the carousel still while she edits the cards
    if (isMobile && !mobileVideoInView) return
    const timer = setInterval(() => {
      setCarouselStart((s) => (s >= maxStart ? 0 : s + 1))
    }, isMobile ? 4000 : 3000)
    return () => clearInterval(timer)
  }, [editing, maxStart, isMobile, mobileVideoInView])
  const activeCard = activeVideo !== null ? cards[activeVideo] : undefined
  const activeUrl = activeCard?.url
  const activeType = activeCard?.type ?? "video"

  return (
    <>
      <div className="px-2 lg:px-5">
        <div className="relative mt-5 flex min-h-[600px] w-full flex-col overflow-hidden rounded-none border border-ash bg-cream px-5 pt-14 pb-24 md:mt-10 md:px-10 md:pt-18 lg:mt-14 lg:h-220 lg:min-h-0 lg:px-12 lg:pt-16 lg:pb-0 xl:px-20 xl:pt-22">
          {/* Hero Content */}
          <div className="flex w-full flex-col items-center gap-10 text-center lg:flex-row lg:items-start lg:justify-center lg:gap-16 lg:text-left xl:gap-34">
            <div className="flex max-w-120 flex-col gap-4 md:gap-4 lg:max-w-96 xl:max-w-120">
              <EditableText
                as="p"
                path="hero.headline"
                value={headline}
                className="font-editorial text-6xl leading-[0.95] font-light tracking-[-0.02em] text-voltage-blue sm:text-7xl lg:text-[72px] lg:leading-[0.95] xl:text-[88px] xl:leading-[0.95]"
              />
              <EditableText
                as="p"
                path="hero.subheadline"
                value={subheadline}
                className="font-ease w-fit border-b-[3px] border-lime-brand pb-1 text-xl font-light tracking-[-0.02em] text-voltage-blue lg:text-2xl"
              />
            </div>

            <div className="flex max-w-160 flex-col gap-8 lg:max-w-120 lg:gap-6 xl:max-w-160">
              <EditableText
                as="p"
                path="hero.description"
                value={description}
                multiline
                className="font-ease text-lg leading-[1.5] font-normal tracking-[-0.02em] text-ink lg:px-0"
              />

              <div className="flex w-full flex-col justify-center gap-4 sm:flex-row lg:justify-start lg:gap-5">
                <Button
                  size="lg"
                  className="w-full px-11 py-6 text-base uppercase sm:w-auto"
                  variant="default"
                  asChild
                >
                  <Link
                    href="#contact"
                    onClick={(e) => {
                      e.preventDefault()
                      if (!editing)
                        document
                          .getElementById("contact")
                          ?.scrollIntoView({ behavior: "smooth" })
                    }}
                  >
                    <EditableText path="hero.ctaText" value={ctaText} />
                    <ArrowUpRight className="size-4" />
                  </Link>
                </Button>
              </div>
            </div>
          </div>

          <div ref={carouselRef} className="relative mt-12 w-full lg:mt-20">
            <button
              onClick={() => setCarouselStart((s) => Math.max(0, s - 1))}
              disabled={carouselStart === 0}
              className="absolute right-9 top-0 z-40 flex size-7 items-center justify-center rounded-full bg-neutral-950/10 transition hover:bg-neutral-950/20 disabled:pointer-events-none disabled:opacity-20 lg:right-auto lg:left-0 lg:top-1/2 lg:size-10 lg:-translate-y-1/2"
              aria-label="Previous"
            >
              <ChevronLeft className="size-4 lg:size-5" />
            </button>

            <div className="mx-auto w-full lg:flex lg:max-w-none lg:flex-row lg:justify-center lg:gap-4 lg:px-14">
              {visibleCards.map((card, i) => {
                const absIdx = carouselStart + i
                const { bg, labelColor } = CARD_STYLES[absIdx % CARD_STYLES.length]
                if (isMobile && i !== 0) return null
                const mediaWidth = isMobile ? 480 : 720
                const aspectClass = "aspect-[4/5]"
                const mediaFitClass = card.type === "image" ? "object-contain" : "object-cover"
                return (
                  <div
                    key={absIdx}
                    className={cn(
                      "group relative transition-transform duration-300",
                      "animate-in fade-in-0 slide-in-from-right-8 duration-500 ease-out fill-mode-both",
                      i === 0 ? "block w-full" : "hidden",
                      "lg:block lg:w-auto",
                      editing ? "cursor-default" : "cursor-pointer hover:-translate-y-2"
                    )}
                    style={{ animationDelay: `${i * 80}ms` }}
                    onClick={editing ? undefined : () => setActiveVideo(absIdx)}
                  >
                    {editing && (
                      <button
                        type="button"
                        onClick={() => cardControls.remove(absIdx)}
                        className="absolute -top-2 -right-2 z-50 flex size-7 items-center justify-center rounded-full bg-neutral-900 text-white shadow-lg transition-colors hover:bg-red-600"
                        aria-label="Remove card"
                      >
                        <Trash2 className="size-3.5" />
                      </button>
                    )}
                    <div className="mb-3 flex">
                      <span className="font-ease inline-flex items-center gap-1 rounded-none border border-ink bg-lime-brand px-2 py-0.5 text-[9px] font-normal tracking-[-0.02em] text-ink uppercase leading-tight">
                        <Tag className="size-2.5" strokeWidth={2} />
                        <EditableText path={`hero.videoCards.${absIdx}.label`} value={card.label} />
                      </span>
                    </div>
                    <div
                      className={cn(
                        "relative overflow-hidden rounded-none border border-ash transition-transform duration-300",
                        aspectClass,
                        "lg:h-[460px] lg:w-auto",
                        bg
                      )}
                    >
                      {(card.url || editing) && (
                        <div className="absolute inset-[6px] overflow-hidden rounded-none">
                          <EditableMedia
                            path={`hero.videoCards.${absIdx}.url`}
                            posterPath={`hero.videoCards.${absIdx}.poster`}
                            typePath={`hero.videoCards.${absIdx}.type`}
                            kind="video"
                            className="absolute inset-0"
                          >
                          {!card.url ? (
                            <div className="flex h-full w-full items-center justify-center bg-cream text-xs tracking-wide text-ink/40 uppercase">
                              No media
                            </div>
                          ) : card.type === "image" ? (
                            <img
                              src={cldImage(card.url, mediaWidth)}
                              alt=""
                              loading="lazy"
                              decoding="async"
                              className={cn("h-full w-full", mediaFitClass)}
                              onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = "none" }}
                            />
                          ) : card.type === "youtube" ? (
                            <iframe
                              src={`https://www.youtube.com/embed/${ytId(card.url)}?autoplay=1&mute=1&loop=1&playlist=${ytId(card.url)}&controls=0&rel=0&playsinline=1`}
                              className="pointer-events-none absolute top-1/2 left-0 h-[177.78%] w-full -translate-y-1/2"
                              allow="autoplay; encrypted-media"
                              loading="lazy"
                            />
                          ) : !mounted || (isMobile && !mobileVideoInView) ? (
                            <img
                              src={card.poster ?? cldPoster(card.url, mediaWidth)}
                              alt=""
                              loading="lazy"
                              decoding="async"
                              className={cn("pointer-events-none h-full w-full", mediaFitClass)}
                            />
                          ) : (
                            <video
                              key={card.url}
                              src={cldVideo(card.url, mediaWidth)}
                              poster={card.poster ?? cldPoster(card.url, mediaWidth)}
                              className={cn("pointer-events-none h-full w-full", mediaFitClass)}
                              autoPlay
                              muted
                              loop={!isMobile}
                              playsInline
                              preload="metadata"
                            />
                          )}
                          </EditableMedia>
                        </div>
                      )}

                      {/* Play button — videos only */}
                      {card.type !== "image" && (
                        <div className="absolute inset-0 flex items-center justify-center opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                          <div className="flex size-18 items-center justify-center rounded-full bg-black/20 ring-1 ring-white/20 backdrop-blur-sm transition-transform duration-300 group-hover:scale-110">
                            <Play className="size-8 fill-white text-white" />
                          </div>
                        </div>
                      )}
                      <div className="absolute top-4 right-4 size-2 rounded-full bg-white/30 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                    </div>
                  </div>
                )
              })}
            </div>

            {editing && (
              <div className="mt-6 flex justify-center">
                <AddItemButton
                  label="Add card"
                  onClick={() =>
                    cardControls.add({ label: "New card", url: "", poster: "", type: "video" })
                  }
                />
              </div>
            )}

            {/* Right arrow — anchored to the right edge of the hero inner area */}
            <button
              onClick={() => setCarouselStart((s) => Math.min(maxStart, s + 1))}
              disabled={carouselStart >= maxStart}
              className="absolute right-0 top-0 z-40 flex size-7 items-center justify-center rounded-full bg-neutral-950/10 transition hover:bg-neutral-950/20 disabled:pointer-events-none disabled:opacity-20 lg:top-1/2 lg:size-10 lg:-translate-y-1/2"
              aria-label="Next"
            >
              <ChevronRight className="size-4 lg:size-5" />
            </button>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="relative hidden lg:block">
          <button
            type="button"
            aria-label="Scroll down"
            onClick={() =>
              window.scrollBy({ top: window.innerHeight * 0.9, behavior: "smooth" })
            }
            className="absolute bottom-8 left-8 z-20 flex size-11 items-center justify-center rounded-full border border-voltage-blue bg-cream text-voltage-blue transition-colors hover:bg-voltage-blue/5"
          >
            <ArrowDown className="size-5 animate-bounce" />
          </button>
        </div>
      </div>

      {/* Full-screen video modal */}
      <div
        className={cn(
          "fixed inset-0 z-100 flex items-center justify-center transition-all duration-300",
          activeVideo !== null
            ? "pointer-events-auto opacity-100"
            : "pointer-events-none opacity-0"
        )}
      >
        <div
          className="absolute inset-0 bg-black/75 backdrop-blur-xl"
          onClick={() => setActiveVideo(null)}
        />
        <div className="relative flex flex-col items-end">
          <button
            className="mb-3 flex size-11 items-center justify-center rounded-full bg-white/10 text-white ring-1 ring-white/20 transition-colors hover:bg-white/20"
            onClick={() => setActiveVideo(null)}
            aria-label="Close video"
          >
            <X className="size-5" />
          </button>
          <div
            className="overflow-hidden rounded-md bg-neutral-900"
            style={
              activeType !== "image"
                ? { height: "min(78vh, calc(90vw * 16 / 9))", width: "min(calc(78vh * 9 / 16), 90vw)" }
                : undefined
            }
          >
            {activeUrl && activeType === "image" ? (
              <img
                key={activeVideo}
                src={cldImage(activeUrl, 1400)}
                alt=""
                className="block max-h-[85vh] max-w-[90vw] object-contain"
              />
            ) : activeUrl && activeType === "youtube" ? (
              <iframe
                key={activeVideo}
                src={`https://www.youtube.com/embed/${ytId(activeUrl)}?autoplay=1&rel=0`}
                className="h-full w-full"
                allow="autoplay; encrypted-media; fullscreen"
                allowFullScreen
              />
            ) : activeUrl ? (
              <video
                key={activeVideo}
                src={cldVideo(activeUrl, isMobile ? 720 : 1080)}
                poster={activeCard?.poster ?? cldPoster(activeUrl, isMobile ? 720 : 1080)}
                className="h-full w-full object-contain"
                autoPlay
                controls
                playsInline
                preload="metadata"
              />
            ) : (
              <div className="flex h-full flex-col items-center justify-center gap-3">
                <div className="flex size-16 items-center justify-center rounded-full bg-white/10">
                  <Play className="size-7 fill-white/40 text-white/40" />
                </div>
                <p className="type-monospaced text-xs tracking-widest text-white/30 uppercase">
                  Video coming soon
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  )
}
