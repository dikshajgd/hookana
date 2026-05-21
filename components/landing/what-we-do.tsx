import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import type { ServiceTab, ServicesContent } from "@/sanity/lib/types"

const FALLBACK: ServicesContent = {
  label: "What We Do?",
  heading: "Full-stack creative production.",
  tabs: [
    {
      value: "core-service",
      label: "Core Service",
      title: "Ad Creative Production",
      description:
        "Static ads, video ads, carousels, motion graphics. Optimized for Meta, TikTok, Snapchat, and YouTube.",
      deliverables: [
        "Hook variations and A/B test sets",
        "Static ad designs (feed, story, square, landscape)",
        "Short-form video cuts for Meta, TikTok, Snapchat",
        "Carousel ad sequences",
        "Motion graphics and animated assets",
        "Platform-specific resizes and adaptations",
      ],
      stats: [
        {
          label: "TURNAROUND",
          text: "Standard: 48 hours. Rush (same-day) available on Growth and Enterprise plans.",
        },
        {
          label: "REVISIONS",
          text: "Unlimited. First-draft approval rate above 85%.",
        },
        {
          label: "BEST FOR",
          text: "Performance marketers running paid acquisition who need consistent creative volume.",
        },
      ],
    },
    {
      value: "video-production",
      label: "UGC-Style Edits",
      title: "UGC-Style Edits",
      description:
        "Authentic creator-style video content that feels native to the feed.",
      deliverables: [
        "UGC-style video edits from raw creator footage",
        "Hook-first editing with pattern-interrupt openers",
        "Trending audio integration and timing",
        "Subtitle/caption overlays for silent viewing",
        "Performance-optimized cuts for paid placement",
      ],
      stats: [
        {
          label: "BEST FOR",
          text: "D2C brands running TikTok, Instagram Reels, and Snapchat campaigns.",
        },
        {
          label: "HOW IT WORKS",
          text: "Send us raw creator footage, product shots, or screen recordings. We handle everything.",
        },
      ],
    },
    {
      value: "strategy-layer",
      label: "Strategy Layer",
      title: "Creative Strategy",
      description:
        "Hook frameworks, angle testing roadmaps, competitor creative teardowns.",
      deliverables: [
        "Competitor creative analysis and teardowns",
        "Hook framework development for your brand",
        "Angle testing roadmap with prioritized concepts",
        "Creative brief templates customized to your brand",
      ],
      stats: [
        {
          label: "BEST FOR",
          text: "Teams who have production capacity but lack creative direction.",
        },
        {
          label: "PAIRS WITH",
          text: "Ad Creative Production + Creative Strategy = full-stack creative operations.",
        },
      ],
    },
    {
      value: "ai-augmented",
      label: "AI-Augmented",
      title: "AI Content Generation",
      description:
        "AI-assisted workflows that multiply output without multiplying costs.",
      deliverables: [
        "AI-generated concept mockups before production",
        "Rapid hook and headline variations",
        "Human review on every output before delivery",
      ],
      stats: [
        {
          label: "THE PRINCIPLE",
          text: "AI accelerates. Humans decide. No automated slop ships to your inbox.",
        },
        { label: "RESULT", text: "3x output at no additional cost." },
      ],
    },
  ],
}

function WhatWeDoPanel({ tab }: { tab: ServiceTab }) {
  return (
    <div className="flex h-full w-full flex-col gap-10 2xl:flex-row 2xl:items-end 2xl:justify-between 2xl:gap-0">
      <div className="flex h-full w-full flex-col justify-between gap-8 2xl:gap-0">
        <div>
          <h3 className="type-heading-2 2xl:type-heading-1 text-5xl! text-primary">
            {tab.title}
          </h3>
          <p className="type-heading-4 mt-3 max-w-full text-accent-foreground 2xl:max-w-170">
            {tab.description}
          </p>
        </div>

        <ul className="w-full overflow-hidden rounded-md 2xl:max-w-215">
          {tab.deliverables.map((item, index) => (
            <li
              key={item}
              className={`min-h-auto px-6 py-4 2xl:min-h-15 2xl:px-11 2xl:py-4 ${
                index % 2 === 0
                  ? "bg-linear-to-r from-background to-lime-500"
                  : "bg-linear-to-r from-lime-500 to-background"
              }`}
            >
              <p className="type-monospaced text-left text-sm text-accent-foreground 2xl:text-right 2xl:text-base">
                • {item}
              </p>
            </li>
          ))}
        </ul>
      </div>

      <div className="flex w-full flex-col gap-6 2xl:w-auto 2xl:min-w-178">
        {tab.stats.map((stat) => (
          <div
            key={stat.label}
            className="flex flex-col gap-3 border-l-10 border-pink-500 bg-background px-6 py-6 [clip-path:polygon(0_0,calc(100%-1.5rem)_0,100%_12%,calc(100%-1.5rem)_30%,100%_48%,calc(100%-1.5rem)_66%,100%_84%,calc(100%-1.5rem)_100%,0_100%)] 2xl:border-l-20 2xl:px-8 2xl:py-7"
          >
            <p className="font-mono text-xs leading-3 text-primary uppercase 2xl:text-sm">
              {stat.label}
            </p>
            <p className="type-heading-4 2xl:type-heading-3 text-accent-foreground">
              {stat.text}
            </p>
          </div>
        ))}
      </div>
    </div>
  )
}

export function WhatWeDo({ content }: { content: ServicesContent | null }) {
  const { label, heading, tabs } = content ?? FALLBACK
  const displayTabs = tabs?.length > 0 ? tabs : FALLBACK.tabs

  return (
    <div className="mx-auto w-full px-5 sm:px-6">
      <div className="flex flex-col gap-2 sm:gap-4 lg:px-30">
        <p className="font-mono text-2xl font-semibold tracking-tight text-pink-500 sm:text-3xl 2xl:text-4xl">
          {label}
        </p>
        <h2 className="font-sans text-4xl leading-tight font-semibold tracking-[-1.5px] text-foreground sm:text-[42px] md:text-[64px] md:leading-12">
          {heading}
        </h2>
      </div>

      {/* Mobile/Tablet Sticky Stack */}
      <div className="relative mt-8 mb-6 block lg:hidden">
        {displayTabs.map((tab, idx) => (
          <div
            key={tab.value}
            className="sticky w-full rounded-t-[2rem] rounded-b-[2rem] border-t border-white/40 bg-lime-200 px-5 pt-8 pb-10 shadow-[0_-8px_30px_-10px_rgba(0,0,0,0.1)] sm:rounded-t-[3rem] sm:rounded-b-[3rem] sm:px-8 sm:pt-14 sm:pb-16 md:px-12 md:pt-16"
            style={{ top: `calc(64px + ${idx * 8}px)` }}
          >
            <div className="mb-6 w-fit rounded-full bg-lime-50 px-5 py-2 font-sans text-xs font-bold tracking-widest text-lime-950 uppercase shadow-sm sm:px-6 sm:py-2.5 sm:text-sm">
              {tab.label}
            </div>
            <div className="flex flex-col gap-6 sm:gap-10">
              <div className="flex flex-col gap-3">
                <h3 className="type-heading-3 sm:type-heading-2 text-primary">
                  {tab.title}
                </h3>
                <p className="type-heading-4 font-semibold text-accent-foreground">
                  {tab.description}
                </p>
              </div>
              <ul className="w-full overflow-hidden rounded-md">
                {tab.deliverables.map((item, index) => (
                  <li
                    key={item}
                    className={`min-h-12 px-5 py-3 sm:px-8 sm:py-4 ${index % 2 === 0 ? "bg-linear-to-r from-background to-lime-500" : "bg-linear-to-r from-lime-500 to-background"}`}
                  >
                    <p className="type-monospaced text-left text-xs leading-snug text-accent-foreground sm:text-sm">
                      • {item}
                    </p>
                  </li>
                ))}
              </ul>
              <div className="flex w-full flex-col gap-4">
                {tab.stats.map((stat) => (
                  <div
                    key={stat.label}
                    className="flex flex-col gap-2 border-l-8 border-pink-500 bg-background px-5 py-5 [clip-path:polygon(0_0,calc(100%-1rem)_0,100%_12%,calc(100%-1rem)_30%,100%_48%,calc(100%-1rem)_66%,100%_84%,calc(100%-1rem)_100%,0_100%)] sm:border-l-[12px] sm:px-6 sm:py-6"
                  >
                    <p className="font-mono text-[10px] leading-3 text-primary uppercase sm:text-xs">
                      {stat.label}
                    </p>
                    <p className="type-heading-4 sm:type-heading-3 text-accent-foreground">
                      {stat.text}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Desktop Tabs */}
      <div className="hidden lg:block">
        <Tabs defaultValue={displayTabs[0]?.value} className="mt-2">
          <div className="flex justify-end pr-17">
            <TabsList className="ml-8 h-auto gap-0 rounded-none bg-transparent p-0">
              {displayTabs.map((tab) => (
                <TabsTrigger
                  key={tab.value}
                  value={tab.value}
                  className="type-heading-4 relative z-0 h-15 w-60! rounded-none rounded-t-md border-2 border-lime-500! bg-lime-50 text-accent-foreground [clip-path:polygon(0_0,calc(100%-2.5rem)_0,100%_100%,0_100%)] not-first:-ml-8 data-[state=active]:z-20 data-[state=active]:-translate-y-0.5 data-[state=active]:bg-lime-200"
                >
                  {tab.label}
                </TabsTrigger>
              ))}
            </TabsList>
          </div>

          {displayTabs.map((tab) => (
            <TabsContent
              key={tab.value}
              value={tab.value}
              className="z-40 h-auto w-full flex-none rounded-md rounded-b-2xl bg-lime-200 px-10 pt-16 pb-16 2xl:h-200 2xl:pt-30 2xl:pr-20 2xl:pb-20 2xl:pl-30"
            >
              <WhatWeDoPanel tab={tab} />
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </div>
  )
}
