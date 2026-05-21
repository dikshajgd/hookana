"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowUpRight } from "lucide-react"
import type { CtaContent } from "@/sanity/lib/types"

const FALLBACK: CtaContent = {
  heading: "STOP LETTING\nCREATIVE BE THE\nBOTTLENECK.",
  description: "See how Hookana can 3x your creative output in just 48 hours.",
  ctaText: "GET 2 FREE CONCEPTS",
}

export function Cta({ content }: { content: CtaContent | null }) {
  const { heading, description, ctaText } = content ?? FALLBACK
  const lines = heading.split("\n")

  return (
    <div className="mx-auto flex max-w-7xl flex-col items-center gap-6 px-5 py-20 text-center md:pt-36 md:pb-65">
      <h2 className="font-sans text-[40px] leading-[0.95] font-black tracking-[-1px] text-primary uppercase break-words sm:text-[52px] sm:leading-[0.9] sm:tracking-[-1.5px] md:max-w-187.5 md:text-[96px] md:leading-17">
        {lines.map((line, i) => (
          <span key={i}>
            {line}
            {i < lines.length - 1 && <br />}
          </span>
        ))}
      </h2>

      <p className="type-heading-4 px-4 text-foreground">{description}</p>

      <Button size="lg" className="rounded-md" asChild>
        <Link
          href="#contact"
          onClick={(e) => {
            e.preventDefault()
            document.getElementById("contact")?.scrollIntoView({ behavior: "smooth" })
          }}
        >
          {ctaText}
          <ArrowUpRight className="size-4" />
        </Link>
      </Button>
    </div>
  )
}
