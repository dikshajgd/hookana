"use client"

import { useState, useEffect, useRef } from "react"
import Link from "next/link"
import { ArrowUpRight, ArrowDown, Play, X, ChevronLeft, ChevronRight, Tag } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { cldImage, cldVideo, cldPoster } from "@/lib/cloudinary"
import type { HeroContent } from "@/sanity/lib/types"

const FALLBACK: HeroContent = {
  headline: "Creativity at Volume.",
  subheadline: "Without the compromise.",
  description:
    "D2C brands and performance teams need fresh creatives, fast, on-brand, and at scale. Hookana is the creative production engine that keeps your pipeline full without blowing your budget or burning out your team.",
  ctaText: "GET 2 FREE CONCEPTS",
  watchReelText: "WATCH THE REEL",
  videoCards: [
    { label: "Brand Films", url: "https://res.cloudinary.com/ddbynpktj/video/upload/v1779285205/web_1_neyohx.mp4", type: "video" },
    { label: "Ad Creatives", url: "https://res.cloudinary.com/ddbynpktj/video/upload/v1779285220/web_2_jqspsb.mp4", type: "video" },
    { label: "Social Content", url: "https://res.cloudinary.com/ddbynpktj/video/upload/v1779285217/web_3__srdr8v.mp4", type: "video" },
    { label: "Brand Films", url: "https://res.cloudinary.com/ddbynpktj/video/upload/v1779285224/web_4_hskvt6.mp4", type: "video" },
    { label: "Ad Creatives", url: "https://res.cloudinary.com/ddbynpktj/video/upload/v1779285194/web_5_u6jm0u.mp4", type: "video" },
    { label: "Social Content", url: "https://res.cloudinary.com/ddbynpktj/video/upload/v1779285212/web_6__w4q8zh.mp4", type: "video" },
    { label: "Brand Films", url: "https://res.cloudinary.com/ddbynpktj/video/upload/v1779285213/web_7_mp8jqo.mp4", type: "video" },
    { label: "Ad Creatives", url: "https://res.cloudinary.com/ddbynpktj/video/upload/v1779285199/web_8_b8kyka.mp4", type: "video" },
    { label: "Social Content", url: "https://res.cloudinary.com/ddbynpktj/video/upload/v1779285217/web_9_bvyerz.mp4", type: "video" },
    { label: "Brand Films", url: "https://res.cloudinary.com/ddbynpktj/video/upload/v1779285219/web_10_nuhkfe.mp4", type: "video" },
    { label: "Ad Creatives", url: "https://res.cloudinary.com/ddbynpktj/video/upload/v1779285216/web_11_wdxwuy.mp4", type: "video" },
  ],
}

const CARD_STYLES = [
  { bg: "bg-neutral-100", labelColor: "text-neutral-950/60" },
  { bg: "bg-neutral-100", labelColor: "text-neutral-950/60" },
  { bg: "bg-neutral-100", labelColor: "text-neutral-950/60" },
]

const VISIBLE = 3

function ytId(url: string) {
  return url.split("/shorts/")[1]?.split("?")[0] ?? ""
}

export function Hero({ content }: { content: HeroContent | null }) {
  const [activeVideo, setActiveVideo] = useState<number | null>(null)
  const [carouselStart, setCarouselStart] = useState(0)
  const [isMobile, setIsMobile] = useState(() => {
    if (typeof window === "undefined") return true
    return window.matchMedia("(max-width: 1023px)").matches
  })
  const [mobileVideoInView, setMobileVideoInView] = useState(false)
  const carouselRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
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

  const { headline, subheadline, description, ctaText, videoCards } =
    content ?? FALLBACK
  const cards = videoCards?.length > 0 ? videoCards : FALLBACK.videoCards
  const maxStart = Math.max(0, cards.length - VISIBLE)
  const visibleCards = cards.slice(carouselStart, carouselStart + VISIBLE)

  useEffect(() => {
    if (isMobile && !mobileVideoInView) return
    const timer = setInterval(() => {
      setCarouselStart((s) => (s >= maxStart ? 0 : s + 1))
    }, isMobile ? 4000 : 3000)
    return () => clearInterval(timer)
  }, [maxStart, isMobile, mobileVideoInView])
  const activeCard = activeVideo !== null ? cards[activeVideo] : undefined
  const activeUrl = activeCard?.url
  const activeType = activeCard?.type ?? "video"

  return (
    <>
      <div className="px-2 lg:px-5">
        <div className="mt-5 flex min-h-[600px] w-full flex-col overflow-hidden rounded-t-[1.5rem] rounded-b-[2.5rem] bg-pink-50 px-5 pt-20 pb-24 md:mt-10 md:rounded-t-md md:rounded-b-[3rem] md:px-10 md:pt-24 lg:mt-20 lg:h-220 lg:min-h-0 lg:rounded-md lg:px-12 lg:pt-24 lg:pb-0 xl:px-20 xl:pt-30">
          {/* Hero Content */}
          <div className="flex w-full flex-col items-center gap-10 text-center lg:flex-row lg:items-start lg:justify-center lg:gap-16 lg:text-left xl:gap-34">
            <div className="flex max-w-120 flex-col gap-2 md:gap-3 lg:max-w-96 xl:max-w-120">
              <p className="font-sans text-5xl leading-[0.9] font-black tracking-tighter text-neutral-950 uppercase sm:text-6xl lg:text-[52px] lg:leading-[1.05] lg:tracking-tight xl:text-[64px] xl:leading-16">
                {headline}
              </p>
              <p className="type-heading-3 xl:type-heading-2 text-pink-500 uppercase lg:text-2xl">
                {subheadline}
              </p>
            </div>

            <div className="flex max-w-160 flex-col gap-8 lg:max-w-120 lg:gap-6 xl:max-w-160">
              <p className="type-paragraph-regular md:type-paragraph-large px-2 text-accent-foreground lg:px-0">
                {description}
              </p>

              <div className="flex w-full flex-col justify-center gap-4 sm:flex-row lg:justify-start lg:gap-5">
                <Button
                  size="lg"
                  className="w-full rounded-md sm:w-auto"
                  variant="default"
                  asChild
                >
                  <Link
                    href="#contact"
                    onClick={(e) => {
                      e.preventDefault()
                      document
                        .getElementById("contact")
                        ?.scrollIntoView({ behavior: "smooth" })
                    }}
                  >
                    {ctaText}
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
                const { bg, labelColor } = CARD_STYLES[(carouselStart + i) % CARD_STYLES.length]
                if (isMobile && i !== 0) return null
                const mediaWidth = isMobile ? 480 : 720
                const aspectClass = "aspect-[4/5]"
                const mediaFitClass = card.type === "image" ? "object-contain" : "object-cover"
                return (
                  <div
                    key={carouselStart + i}
                    className={cn(
                      "group cursor-pointer transition-transform duration-300 hover:-translate-y-2",
                      "animate-in fade-in-0 slide-in-from-right-8 duration-500 ease-out fill-mode-both",
                      i === 0 ? "block w-full" : "hidden",
                      "lg:block lg:w-auto"
                    )}
                    style={{ animationDelay: `${i * 80}ms` }}
                    onClick={() => setActiveVideo(carouselStart + i)}
                  >
                    <div className="mb-3 flex">
                      <span className="type-monospaced inline-flex items-center gap-1 rounded-full border border-neutral-950/15 bg-pink-200 px-1.5 py-px text-[7px] font-bold tracking-[0.1em] text-neutral-950 uppercase shadow-sm leading-tight">
                        <Tag className="size-2.5" strokeWidth={2.5} />
                        {card.label}
                      </span>
                    </div>
                    <div
                      className={cn(
                        "relative overflow-hidden rounded-md transition-shadow duration-300 group-hover:shadow-2xl",
                        aspectClass,
                        "lg:h-[460px] lg:w-auto",
                        bg
                      )}
                    >
                      {card.url && (
                        <div className="absolute inset-0">
                          {card.type === "image" ? (
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
                          ) : isMobile && !mobileVideoInView ? (
                            <img
                              src={cldPoster(card.url, mediaWidth)}
                              alt=""
                              loading="lazy"
                              decoding="async"
                              className={cn("pointer-events-none h-full w-full", mediaFitClass)}
                            />
                          ) : (
                            <video
                              key={card.url}
                              src={cldVideo(card.url, mediaWidth)}
                              poster={cldPoster(card.url, mediaWidth)}
                              className={cn("pointer-events-none h-full w-full", mediaFitClass)}
                              autoPlay
                              muted
                              loop={!isMobile}
                              playsInline
                              preload="metadata"
                            />
                          )}
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
          <div className="absolute bottom-8 left-8 z-20">
            <ArrowDown className="size-6 text-accent-foreground" />
          </div>
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
                poster={cldPoster(activeUrl, isMobile ? 720 : 1080)}
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
