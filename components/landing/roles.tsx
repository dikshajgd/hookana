"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { ArrowUpRight } from "lucide-react"
import { useState } from "react"
import type { RoleItem, RolesContent } from "@/sanity/lib/types"

function ProblemDescription({ text }: { text: string }) {
  const closingQuotes = ["” ", '" ']
  let splitIdx = -1
  for (const q of closingQuotes) {
    const idx = text.indexOf(q)
    if (idx !== -1) { splitIdx = idx + 1; break }
  }
  const isLong = text.length > 300
  if (splitIdx < 0) {
    return <p className="type-paragraph-large mt-auto font-bold text-blue-950">{text}</p>
  }
  return (
    <div className="mt-auto flex flex-col gap-3">
      <p className={`${isLong ? "type-paragraph-regular" : "type-paragraph-large"} font-bold text-blue-950`}>
        {text.slice(0, splitIdx)}
      </p>
      <p className={`${isLong ? "type-paragraph-small" : "type-paragraph-regular"} text-blue-950/80`}>
        {text.slice(splitIdx + 1)}
      </p>
    </div>
  )
}

const FALLBACK: RolesContent = {
  heading: "We get it.",
  subheading: "We've been in your shoes.",
  roles: [
    {
      tab: "PERFORMANCE MARKETERS",
      problemTitle:
        "You know creative is the lever. You can't pull it fast enough.",
      problemDescription:
        "\"I know the lever is creative, but I can't pull it fast enough.\" Your ad accounts need fresh assets daily, not weekly. Your ROAS depends on constantly testing new hooks, formats, and angles. But your creative pipeline can't keep up with ad platform velocity.",
      solutionTitle: "Creatives that match your ad platform's speed.",
      solutionTags: [
        "48HR TURNAROUND",
        "UNLIMITED REVISIONS",
        "AD-PLATFORM NATIVE FORMATS",
        "CONSISTENT QUALITY AT SCALE",
      ],
      solutionDescription:
        "Hookana delivers creatives at the speed of your ad platform. Constant testing, zero bottlenecks, predictable output.",
      ctaText: "START A SPRINT",
    },
    {
      tab: "AGENCY FOUNDERS",
      problemTitle: "Clients keep growing. Your team doesn't scale with them.",
      problemDescription:
        "\"One bad month and clients start questioning us.\" Missed deadlines, burned-out designers, inconsistent quality across accounts. Hiring more people isn't fixing the problem. It's just making it more expensive.",
      solutionTitle: "Your creative backend that never drops the ball.",
      solutionTags: [
        "48HR TURNAROUND",
        "UNLIMITED REVISIONS",
        "AD-PLATFORM NATIVE FORMATS",
        "CONSISTENT QUALITY AT SCALE",
      ],
      solutionDescription:
        "Hookana acts as an extension of your delivery team. We absorb volume spikes without quality drops. Your reputation stays intact.",
      ctaText: "START A SPRINT",
    },
    {
      tab: "D2C FOUNDERS",
      problemTitle:
        "You built a product people love. Now you need ads that sell it.",
      problemDescription:
        "\"I'm spending $30K a month on ads and my creative is the weakest link.\" You know your product is good. Customer reviews prove it. But your ads don't capture that magic. You're stuck choosing between expensive agencies that don't understand D2C speed, or cheap freelancers who deliver inconsistent work. Meanwhile, your competitors are shipping 30 creatives a week while you're arguing over one carousel.",
      solutionTitle: "Your creative team without the full-time cost.",
      solutionTags: [
        "48HR TURNAROUND",
        "UNLIMITED REVISIONS",
        "AD-PLATFORM NATIVE FORMATS",
        "CONSISTENT QUALITY AT SCALE",
      ],
      solutionDescription:
        "Hookana gives you agency-quality creative production at founder-friendly pricing. We learn your brand once, then deliver a constant flow of ad-ready assets. You focus on product and growth. We handle the creative engine.",
      ctaText: "START A SPRINT",
    },
  ],
}

function ReceiptCorner() {
  return (
    <div className="absolute top-0 right-0 h-11 w-11 overflow-hidden bg-secondary">
      <div
        className="absolute -inset-1 bg-blue-50"
        style={{ clipPath: "polygon(100% 0, 0 0, 100% 100%)" }}
      />
    </div>
  )
}

function ReceiptTearEdge({
  background,
}: {
  background: "problem" | "solution"
}) {
  return (
    <div className="pointer-events-none absolute right-0 -bottom-7 left-0 h-7">
      <svg
        width="100%"
        height="28"
        viewBox="0 0 696 28"
        preserveAspectRatio="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M0,0 L25,28 L50,0 L75,28 L100,0 L125,28 L150,0 L175,28 L200,0 L225,28 L250,0 L275,28 L300,0 L325,28 L350,0 L375,28 L400,0 L425,28 L450,0 L475,28 L500,0 L525,28 L550,0 L575,28 L600,0 L625,28 L650,0 L675,28 L696,0 Z"
          fill={background === "solution" ? "#BFDEFF" : "#e9e9f4"}
        />
      </svg>
    </div>
  )
}

function ReceiptCard({
  children,
  background,
}: {
  children: React.ReactNode
  background: "problem" | "solution"
}) {
  return (
    <article
      className={`relative w-full overflow-visible px-6 py-8 sm:px-8 sm:py-10 md:min-h-102 md:py-20 2xl:w-auto 2xl:max-w-175 2xl:px-9 2xl:py-8 ${
        background === "problem" ? "bg-blue-100" : "bg-[#BFDEFF]"
      }`}
    >
      <ReceiptCorner />
      {children}
      <ReceiptTearEdge background={background} />
    </article>
  )
}

export function Roles({ content }: { content: RolesContent | null }) {
  const { heading, subheading, roles } = content ?? FALLBACK
  const displayRoles = roles?.length > 0 ? roles : FALLBACK.roles
  const [activeIndex, setActiveIndex] = useState(0)
  const active: RoleItem = displayRoles[activeIndex] ?? displayRoles[0]

  return (
    <section className="mt-10 flex w-full flex-col items-center justify-center px-6 sm:mt-20 2xl:mt-40 2xl:px-0 2xl:pl-6">
      <div className="flex w-full flex-col items-center justify-center gap-2 text-center sm:gap-4 2xl:gap-10">
        <p className="font-sans text-5xl leading-tight font-black text-foreground uppercase sm:text-7xl 2xl:text-[128px] 2xl:leading-12">
          {heading}
        </p>
        <p className="type-heading-3 2xl:type-heading-2 text-foreground">
          {subheading}
        </p>
      </div>

      <div className="mt-8 w-full sm:mt-16 2xl:mt-30">
        <div className="flex w-full flex-col justify-between gap-12 2xl:flex-row 2xl:gap-0">
          {/* Mobile tab selector */}
          <div className="flex w-full gap-2 pb-4 sm:gap-3 2xl:hidden">
            {displayRoles.map((role, i) => {
              const isActive = i === activeIndex
              return (
                <button
                  key={role.tab}
                  type="button"
                  onClick={() => setActiveIndex(i)}
                  className={cn(
                    "flex min-h-17 flex-1 shrink items-center justify-center px-2 py-2 text-center font-mono text-[11px] leading-tight whitespace-normal uppercase transition-all sm:min-h-20 sm:px-4 sm:text-xs",
                    isActive
                      ? "bg-secondary font-bold text-secondary-foreground [clip-path:polygon(0_0,100%_0,100%_calc(100%-0.75rem),50%_100%,0_calc(100%-0.75rem))]"
                      : "rounded-md bg-secondary/40 text-secondary-foreground/60 hover:bg-secondary/60"
                  )}
                  aria-pressed={isActive}
                >
                  {role.tab}
                </button>
              )
            })}
          </div>

          <div className="flex w-full flex-col gap-16 2xl:flex-row 2xl:gap-6">
            <ReceiptCard background="problem">
              <div className="flex h-full flex-col gap-6 2xl:gap-0">
                <h2 className="font-sans text-3xl leading-tight font-semibold tracking-tight text-secondary sm:text-4xl 2xl:text-[56px] 2xl:leading-none">
                  {active.problemTitle}
                </h2>
                <ProblemDescription text={active.problemDescription} />
              </div>
            </ReceiptCard>

            <ReceiptCard background="solution">
              <div className="flex h-full flex-col gap-6 2xl:gap-8">
                <h2 className="font-sans text-3xl leading-tight font-semibold tracking-tight text-blue-950 sm:text-4xl 2xl:text-[56px] 2xl:leading-none">
                  {active.solutionTitle}
                </h2>

                <div className="mt-auto">
                  <div className="flex flex-wrap gap-2 2xl:gap-3">
                    {active.solutionTags.map((tag) => (
                      <span
                        key={tag}
                        className="rounded-md bg-linear-to-r from-[#BFDEFF] to-lime-500 px-3 py-1 font-mono text-[12px] leading-tight text-foreground sm:text-[14px] 2xl:py-0 2xl:text-[16px] 2xl:leading-6"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>

                  <p className="type-paragraph-large mt-6 font-bold text-blue-950 2xl:mt-8">
                    {active.solutionDescription}
                  </p>

                  <Button
                    size="lg"
                    variant="secondary"
                    className="mt-6 w-full rounded-md px-6 2xl:mt-8 2xl:w-auto"
                    asChild
                  >
                    <Link
                      href="#contact"
                      onClick={(e) => {
                        e.preventDefault()
                        document.getElementById("contact")?.scrollIntoView({ behavior: "smooth" })
                      }}
                    >
                      {active.ctaText ?? "START A SPRINT"}
                      <ArrowUpRight className="size-4" />
                    </Link>
                  </Button>
                </div>
              </div>
            </ReceiptCard>
          </div>

          {/* Desktop side selector */}
          <div className="hidden flex-col gap-4 2xl:flex">
            {displayRoles.map((role, i) => {
              const isActive = i === activeIndex
              return (
                <button
                  key={role.tab}
                  type="button"
                  onClick={() => setActiveIndex(i)}
                  className={cn(
                    "relative h-15 w-full min-w-90 cursor-pointer bg-secondary px-8 text-left font-mono text-base text-secondary-foreground uppercase transition-all",
                    isActive
                      ? "[clip-path:polygon(1.5rem_0,100%_0,100%_100%,1.5rem_100%,0_50%)]"
                      : "ml-20"
                  )}
                  aria-pressed={isActive}
                >
                  {role.tab}
                </button>
              )
            })}
          </div>
        </div>
      </div>
    </section>
  )
}
