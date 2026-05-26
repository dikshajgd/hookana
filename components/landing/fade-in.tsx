"use client"

import { useEffect, useRef, useState } from "react"
import { cn } from "@/lib/utils"

export function FadeIn({
  children,
  className,
  style,
}: {
  children: React.ReactNode
  className?: string
  style?: React.CSSProperties
}) {
  const ref = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true)
          observer.unobserve(entry.target)
        }
      },
      { threshold: 0, rootMargin: "0px 0px 15% 0px" }
    )

    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  return (
    <>
      <style>{`
        @keyframes blinkIn {
          0%   { opacity: 0; }
          20%  { opacity: 1; }
          40%  { opacity: 0.2; }
          60%  { opacity: 1; }
          80%  { opacity: 0.4; }
          100% { opacity: 1; }
        }
        .animate-blink-in { animation: blinkIn 0.7s ease-out both; }
      `}</style>
      <div
        ref={ref}
        style={style}
        className={cn(visible ? "animate-blink-in" : "opacity-0", className)}
      >
        {children}
      </div>
    </>
  )
}
