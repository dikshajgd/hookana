"use client"

import { useEffect, useLayoutEffect, useRef, useState } from "react"

function parseValue(raw: string): { number: number; suffix: string; prefix: string } | null {
  const match = raw.match(/^([^0-9]*)(\d+(?:\.\d+)?)(.*)$/)
  if (!match) return null
  return { prefix: match[1], number: parseFloat(match[2]), suffix: match[3] }
}

// SSR and the browser must agree on the first paint, so useLayoutEffect can only
// run client-side.
const useIsomorphicLayoutEffect = typeof window !== "undefined" ? useLayoutEffect : useEffect

/**
 * Counts up to a number on scroll — but never renders a zero.
 *
 * The count starts at `null`, which renders the *final* value. Only once the
 * animation actually begins does the display drop to 0 and climb. So if the
 * IntersectionObserver never fires (unsupported, element already scrolled past,
 * reduced-motion, a paint before hydration), the reader sees "48hr", not "0hr".
 */
export function AnimatedStat({ value, className }: { value: string; className?: string }) {
  const parsed = parseValue(value)
  const number = parsed?.number ?? 0
  const [display, setDisplay] = useState<number | null>(null)
  const ref = useRef<HTMLSpanElement>(null)
  const started = useRef(false)
  const frame = useRef<number | undefined>(undefined)

  useIsomorphicLayoutEffect(() => {
    const el = ref.current
    if (!el || !parsed) return

    const reduceMotion = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches
    if (reduceMotion) return

    const run = () => {
      if (started.current) return
      started.current = true
      const duration = 1200
      const start = performance.now()
      setDisplay(0)
      const tick = (now: number) => {
        const progress = Math.min((now - start) / duration, 1)
        const eased = 1 - Math.pow(1 - progress, 3)
        setDisplay(Math.round(eased * number))
        if (progress < 1) frame.current = requestAnimationFrame(tick)
        // At progress 1 display === number, so we land exactly on the target and
        // then stop touching it.
      }
      frame.current = requestAnimationFrame(tick)
    }

    // Already on screen at mount? Start right away — this runs before paint, so
    // the count begins at 0 without the final value flashing first.
    const rect = el.getBoundingClientRect()
    const vh = window.innerHeight || document.documentElement.clientHeight
    if (rect.top < vh && rect.bottom > 0) {
      run()
      return () => {
        if (frame.current !== undefined) cancelAnimationFrame(frame.current)
      }
    }

    if (typeof IntersectionObserver === "undefined") return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return
        observer.disconnect()
        run()
      },
      // Any sliver counts. A 0.3 threshold silently never fires when the element
      // is taller than the viewport or sits in a scroll container.
      { threshold: 0 }
    )
    observer.observe(el)
    return () => {
      observer.disconnect()
      if (frame.current !== undefined) cancelAnimationFrame(frame.current)
    }
    // `parsed` is a fresh object each render — key the effect off the raw value.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value])

  // No digits in the value ("Unlimited") — nothing to count, render it as-is.
  if (!parsed) return <span className={className}>{value}</span>

  return (
    <span ref={ref} className={className}>
      {parsed.prefix}
      {display ?? parsed.number}
      {parsed.suffix}
    </span>
  )
}
