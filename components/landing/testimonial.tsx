"use client"

import { useEffect, useRef, useState } from "react"
import { Play, Pause } from "lucide-react"
import { cn } from "@/lib/utils"
import { cldVideo, cldPoster } from "@/lib/cloudinary"
import type { TestimonialContent } from "@/sanity/lib/types"
import { useEditor, useEditable } from "@/components/admin/editor/editor-context"
import { EditableMedia } from "@/components/admin/editor/editable-media"

// Re-hosted on Supabase Storage (migrated off Cloudinary via
// scripts/migrate-site-videos.mjs).
const SITE_MEDIA = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/portfolio-media/site`
const FALLBACK_URL = `${SITE_MEDIA}/testimonial/Testimonials-Deeanimators-qkytj7.mp4`
const FALLBACK_POSTER = `${SITE_MEDIA}/testimonial/Testimonials-Deeanimators-qkytj7.jpg`
const FALLBACK: TestimonialContent = { videoUrl: FALLBACK_URL, posterUrl: FALLBACK_POSTER }

export function Testimonial({ content }: { content: TestimonialContent | null }) {
  const sectionRef = useRef<HTMLElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const [visible, setVisible] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const [paused, setPaused] = useState(false)

  const togglePlay = () => {
    const v = videoRef.current
    if (!v) return
    if (v.paused) {
      v.play()
      setPaused(false)
    } else {
      v.pause()
      setPaused(true)
    }
  }

  const { editing } = useEditor()
  const resolved = useEditable("testimonial", content, FALLBACK)
  const url = resolved?.videoUrl || FALLBACK_URL

  useEffect(() => {
    const check = () => setIsMobile(window.matchMedia("(max-width: 1023px)").matches)
    check()
    window.addEventListener("resize", check)
    return () => window.removeEventListener("resize", check)
  }, [])

  useEffect(() => {
    const el = sectionRef.current
    if (!el) return
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true)
          observer.disconnect()
        }
      },
      { threshold: 0.3 }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  const w = isMobile ? 640 : 1080
  // Supabase-hosted assets can't be transformed on the fly, so use the stored
  // poster for the fallback; a Cloudinary videoUrl from the CMS still derives one.
  const poster =
    resolved?.posterUrl ?? (resolved?.videoUrl ? cldPoster(url, w) : FALLBACK_POSTER)

  return (
    <section
      ref={sectionRef}
      className="mx-auto mt-8 2xl:mt-15 w-fit max-w-full overflow-hidden rounded-none border border-ash bg-cream p-2.5"
    >
      <div className="group relative cursor-pointer" onClick={editing ? undefined : togglePlay}>
        <EditableMedia
          path="testimonial.videoUrl"
          posterPath="testimonial.posterUrl"
          kind="video"
        >
          <video
            ref={videoRef}
            src={visible ? cldVideo(url, w) : undefined}
            poster={poster}
            className="block h-auto max-h-[55vh] w-auto max-w-full rounded-sm lg:max-h-[80vh]"
            autoPlay
            muted
            loop
            playsInline
            preload="metadata"
            onPlay={() => setPaused(false)}
            onPause={() => setPaused(true)}
          />
        </EditableMedia>
        <div
          className={cn(
            "pointer-events-none absolute inset-0 flex items-center justify-center transition-opacity duration-300",
            paused ? "opacity-100" : "opacity-0"
          )}
        >
          <div className="flex size-18 items-center justify-center rounded-full bg-black/30 ring-1 ring-white/20 backdrop-blur-sm">
            <Play className="size-8 fill-white text-white" />
          </div>
        </div>
      </div>
    </section>
  )
}
