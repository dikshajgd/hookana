"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowUpRight } from "lucide-react"
import type { CtaContent } from "@/sanity/lib/types"
import { useEditor, useEditable } from "@/components/admin/editor/editor-context"
import { EditableText } from "@/components/admin/editor/editable-text"

const FALLBACK: CtaContent = {
  heading: "STOP LETTING\nCREATIVE BE THE\nBOTTLENECK.",
  description: "See how Hookana can 3x your creative output in just 48 hours.",
  ctaText: "GET 2 FREE CONCEPTS",
}

export function Cta({ content }: { content: CtaContent | null }) {
  const { editing } = useEditor()
  const { heading, description, ctaText } = useEditable("cta", content, FALLBACK)

  return (
    <div className="mx-auto flex max-w-7xl flex-col items-center gap-6 px-5 py-12 text-center md:py-24">
      <EditableText
        as="h2"
        path="cta.heading"
        value={heading}
        multiline
        className="font-editorial font-light text-[40px] leading-[0.95] tracking-[-0.02em] text-voltage-blue break-words sm:text-[52px] sm:leading-[0.95] md:max-w-187.5 md:text-[96px] md:leading-[0.92]"
      />

      <EditableText
        as="p"
        path="cta.description"
        value={description}
        className="font-ease text-lg tracking-[-0.02em] px-4 text-ink"
      />

      <Button size="lg" className="rounded-md" asChild>
        <Link
          href="#contact"
          onClick={(e) => {
            e.preventDefault()
            if (!editing)
              document.getElementById("contact")?.scrollIntoView({ behavior: "smooth" })
          }}
        >
          <EditableText path="cta.ctaText" value={ctaText} />
          <ArrowUpRight className="size-4" />
        </Link>
      </Button>
    </div>
  )
}
