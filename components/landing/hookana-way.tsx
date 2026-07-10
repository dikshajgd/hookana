import { Button } from "@/components/ui/button"
import { ContactLink } from "@/components/ui/contact-link"
import { ArrowUpRight } from "lucide-react"
import type { HowItWorksContent } from "@/sanity/lib/types"

const FALLBACK: HowItWorksContent = {
  label: "The Hookana Way",
  heading: "Closer than an agency.\nFaster than a team.",
  ctaText: "Get 2 Free Concepts",
  steps: [
    {
      title: "BRIEF IT.",
      body: "Drop your brief via Slack, Notion, email. We adapt to your tools.",
      caption: "Day 0",
    },
    {
      title: "WE BUILD IT.",
      body: "Our creative team produces ad-ready assets in 48 hours or less.",
      caption: "24 - 48 hours",
    },
    {
      title: "YOU TEST IT.",
      body: "Launch, measure, iterate. We keep the creative pipeline flowing.",
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
]

function HookanaStepCard({
  title,
  body,
  caption,
  bg,
  rotate,
}: {
  title: string
  body: string
  caption: string
  bg: string
  rotate: string
}) {
  return (
    <article className={`rounded-none border border-ash p-6 text-left ${bg} ${rotate}`}>
      <p className="font-ease text-2xl font-normal tracking-[-0.03em] text-ink">{title}</p>
      <p className="font-ease mt-3 text-base leading-snug tracking-[-0.02em] text-ink">{body}</p>
      <p className="font-ease mt-4 text-xs tracking-[-0.02em] text-ink/70 uppercase">{caption}</p>
    </article>
  )
}

export function HookanaWay({ content }: { content: HowItWorksContent | null }) {
  const { label, heading, ctaText, steps } = content ?? FALLBACK
  const headingLines = heading.split("\n")
  const displaySteps = steps?.length > 0 ? steps : FALLBACK.steps

  return (
    <section className="mt-20 px-5 pb-14 md:mt-40 md:pb-28">
      <div className="mx-auto flex flex-col items-center gap-4 text-center md:gap-6">
        <h2 className="font-editorial font-light text-4xl leading-[0.95] tracking-[-0.02em] text-brand-green sm:text-[42px] md:text-[64px] md:leading-[0.95]">
          {headingLines.map((line, i) => (
            <span key={i}>
              {line}
              {i < headingLines.length - 1 && <br />}
            </span>
          ))}
        </h2>

        <ContactLink>
          <Button size="lg" variant="secondary" className="px-6">
            {ctaText}
            <ArrowUpRight className="size-4" />
          </Button>
        </ContactLink>
      </div>

      <div className="mx-auto mt-12 grid max-w-237.5 gap-4 md:mt-24 md:grid-cols-3">
        {displaySteps.map((step, i) => (
          <HookanaStepCard
            key={i}
            bg={STEP_STYLES[i % STEP_STYLES.length].bg}
            rotate={STEP_STYLES[i % STEP_STYLES.length].rotate}
            title={step.title}
            body={step.body}
            caption={step.caption}
          />
        ))}
      </div>
    </section>
  )
}
