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

const STEP_ROTATIONS = ["md:-rotate-2", "md:rotate-1", "md:-rotate-2"]

function HookanaStepCard({
  title,
  body,
  caption,
  className,
}: {
  title: string
  body: string
  caption: string
  className?: string
}) {
  return (
    <article
      className={`rounded-md border border-pink-500 p-6 text-center ${className ?? ""}`}
    >
      <p className="type-heading-3 font-black! text-primary">{title}</p>
      <p className="type-paragraph-regular mt-3 font-semibold text-primary-foreground">
        {body}
      </p>
      <p className="type-monospaced mt-3 text-primary-foreground/95">
        {caption}
      </p>
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
        <h2 className="font-sans text-4xl leading-tight font-semibold tracking-tight text-primary-foreground sm:text-[42px] sm:leading-9 sm:tracking-[-1.5px] md:text-[64px] md:leading-12">
          {headingLines.map((line, i) => (
            <span key={i}>
              {line}
              {i < headingLines.length - 1 && <br />}
            </span>
          ))}
        </h2>

        <ContactLink>
          <Button
            size="lg"
            variant="outline"
            className="rounded-md px-6 text-primary-foreground"
          >
            {ctaText}
            <ArrowUpRight className="size-4" />
          </Button>
        </ContactLink>
      </div>

      <div className="mx-auto mt-12 grid max-w-237.5 gap-2 md:mt-24 md:grid-cols-3">
        {displaySteps.map((step, i) => (
          <HookanaStepCard
            key={i}
            className={STEP_ROTATIONS[i % STEP_ROTATIONS.length]}
            title={step.title}
            body={step.body}
            caption={step.caption}
          />
        ))}
      </div>
    </section>
  )
}
