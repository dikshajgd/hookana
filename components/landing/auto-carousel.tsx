"use client"

import { Children, useEffect, useRef } from "react"
import { cn } from "@/lib/utils"

export function AutoCarousel({
  children,
  interval = 1000,
  className,
  slideClassName,
}: {
  children: React.ReactNode
  /** ms between auto-advances */
  interval?: number
  className?: string
  slideClassName?: string
}) {
  const ref = useRef<HTMLDivElement>(null)
  const pausedRef = useRef(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    const slides = () => Array.from(el.children) as HTMLElement[]
    if (slides().length <= 1) return

    // index of the slide currently closest to the left edge
    const currentIndex = () => {
      const left = el.getBoundingClientRect().left
      let idx = 0
      let min = Infinity
      slides().forEach((s, i) => {
        const d = Math.abs(s.getBoundingClientRect().left - left)
        if (d < min) {
          min = d
          idx = i
        }
      })
      return idx
    }

    const goTo = (i: number) => {
      const target = slides()[i]
      if (!target) return
      const delta =
        target.getBoundingClientRect().left - el.getBoundingClientRect().left
      el.scrollTo({ left: el.scrollLeft + delta, behavior: "smooth" })
    }

    const id = setInterval(() => {
      if (pausedRef.current) return
      const next = (currentIndex() + 1) % slides().length
      goTo(next)
    }, interval)

    // pause while the user is interacting, resume shortly after
    let resumeTimer: ReturnType<typeof setTimeout>
    const pause = () => {
      pausedRef.current = true
      clearTimeout(resumeTimer)
    }
    const resumeSoon = () => {
      clearTimeout(resumeTimer)
      resumeTimer = setTimeout(() => (pausedRef.current = false), 2500)
    }

    el.addEventListener("pointerdown", pause)
    el.addEventListener("pointerup", resumeSoon)
    el.addEventListener("pointercancel", resumeSoon)
    el.addEventListener("mouseenter", pause)
    el.addEventListener("mouseleave", resumeSoon)

    return () => {
      clearInterval(id)
      clearTimeout(resumeTimer)
      el.removeEventListener("pointerdown", pause)
      el.removeEventListener("pointerup", resumeSoon)
      el.removeEventListener("pointercancel", resumeSoon)
      el.removeEventListener("mouseenter", pause)
      el.removeEventListener("mouseleave", resumeSoon)
    }
  }, [interval])

  return (
    <div
      ref={ref}
      className={cn(
        "flex snap-x snap-mandatory gap-4 overflow-x-auto scroll-smooth",
        className
      )}
    >
      {Children.map(children, (child) => (
        <div className={cn("shrink-0 snap-center", slideClassName)}>{child}</div>
      ))}
    </div>
  )
}
