"use client"

import { Button } from "@/components/ui/button"
import { ContactLink } from "@/components/ui/contact-link"
import { ArrowUpRight } from "lucide-react"
import type { HowItWorksContent } from "@/sanity/lib/types"
import { useEditor, useEditable } from "@/components/admin/editor/editor-context"
import {
  useListControls,
  ListItemControls,
  AddItemButton,
} from "@/components/admin/editor/editable-list"
import { EditableText } from "@/components/admin/editor/editable-text"

// `subhead` is optional on the type (rows saved before it existed lack it), so
// keep the default as its own non-optional const to fall back to.
const SUBHEAD = "Ad editing and design for performance teams — right on the first draft."

const FALLBACK: HowItWorksContent = {
  label: "The Hookana Way",
  heading: "Closer than an agency.\nFaster than a team.",
  subhead: SUBHEAD,
  ctaText: "Get 2 Free Concepts",
  steps: [
    {
      title: "BRIEF IT.",
      body: "Send briefs via Slack, Notion, or email — we adapt to your tools.",
      caption: "Day 0",
    },
    {
      title: "OR DON'T.",
      body: "Out of briefs? We'll study your account and pitch you a concept batch instead.",
      caption: "Day 0",
    },
    {
      title: "WE BUILD IT.",
      body: "Launch-ready assets, hook variants included, in 24–48 hours.",
      caption: "24–48h",
    },
    {
      title: "YOU TEST IT.",
      body: "Launch, measure, iterate. We keep the pipeline flowing.",
      caption: "Ongoing",
    },
  ],
}

// Streamtime: each step is a colored paper cutout — the fill is the container,
// hairline ink border, ink text, a playful tilt.
const STEP_STYLES = [
  { rotate: "md:-rotate-2", bg: "bg-cream" },
  { rotate: "md:rotate-1", bg: "bg-cream" },
  { rotate: "md:-rotate-2", bg: "bg-cream" },
  { rotate: "md:rotate-1", bg: "bg-cream" },
]

function HookanaStepCard({
  index,
  title,
  body,
  caption,
  bg,
  rotate,
}: {
  index: number
  title: string
  body: string
  caption: string
  bg: string
  rotate: string
}) {
  return (
    <article className={`relative rounded-none border border-ash p-6 text-left ${bg} ${rotate}`}>
      <EditableText
        as="p"
        path={`howItWorks.steps.${index}.title`}
        value={title}
        className="font-ease text-2xl font-normal tracking-[-0.03em] text-ink"
      />
      <EditableText
        as="p"
        path={`howItWorks.steps.${index}.body`}
        value={body}
        multiline
        className="font-ease mt-3 text-base leading-snug tracking-[-0.02em] text-ink"
      />
      <EditableText
        as="p"
        path={`howItWorks.steps.${index}.caption`}
        value={caption}
        rich={false}
        className="font-ease mt-4 text-xs tracking-[-0.02em] text-ink/70 uppercase"
      />
    </article>
  )
}

export function HookanaWay({ content }: { content: HowItWorksContent | null }) {
  const { editing } = useEditor()
  const { heading, subhead, ctaText, steps } = useEditable("howItWorks", content, FALLBACK)
  const displaySteps = steps?.length > 0 ? steps : FALLBACK.steps
  const stepControls = useListControls("howItWorks.steps")

  return (
    <section className="mt-20 px-5 pb-14 md:mt-40 md:pb-28">
      <div className="mx-auto flex flex-col items-center gap-4 text-center md:gap-6">
        <EditableText
          as="h2"
          path="howItWorks.heading"
          value={heading}
          multiline
          className="font-editorial font-light text-4xl leading-[0.95] tracking-[-0.02em] text-voltage-blue sm:text-[42px] md:text-[64px] md:leading-[0.95]"
        />

        <EditableText
          as="p"
          path="howItWorks.subhead"
          value={subhead ?? SUBHEAD}
          multiline
          className="font-ease max-w-160 text-base leading-snug tracking-[-0.02em] text-ink md:text-lg"
        />

        <ContactLink disabled={editing}>
          <Button size="lg" variant="secondary" className="px-6">
            <EditableText path="howItWorks.ctaText" value={ctaText} />
            <ArrowUpRight className="size-4" />
          </Button>
        </ContactLink>
      </div>

      <div className="mx-auto mt-12 grid max-w-300 gap-4 sm:grid-cols-2 md:mt-24 lg:grid-cols-4">
        {displaySteps.map((step, i) => (
          <div key={i} className="relative">
            {editing && (
              <ListItemControls
                index={i}
                length={displaySteps.length}
                onMove={stepControls.move}
                onRemove={stepControls.remove}
                className="-top-3 right-2"
              />
            )}
            <HookanaStepCard
              index={i}
              bg={STEP_STYLES[i % STEP_STYLES.length].bg}
              rotate={STEP_STYLES[i % STEP_STYLES.length].rotate}
              title={step.title}
              body={step.body}
              caption={step.caption}
            />
          </div>
        ))}
      </div>
      {editing && (
        <div className="mt-6 flex justify-center">
          <AddItemButton
            label="Add step"
            onClick={() =>
              stepControls.add({ title: "NEW STEP.", body: "Describe this step.", caption: "When" })
            }
          />
        </div>
      )}
    </section>
  )
}
