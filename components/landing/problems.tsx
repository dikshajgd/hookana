"use client"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import type { ProblemTab } from "@/sanity/lib/types"

const FALLBACK_TABS: ProblemTab[] = [
  {
    value: "bottleneck",
    label: "Bottleneck",
    inactiveWidth: "10.5rem",
    headlineLine1: "Scaling ad spend is easy.",
    headlineLine2: "Scaling creatives?",
    subheading: "Not so much.",
    ask: "Sound familiar?",
    body: "Your ad platforms move faster than your team can produce. Winning ads stale out before you can replace them.",
    receipt: {
      num: "#00412",
      problem: "BOTTLENECK",
      total: "$24,800",
      items: [
        { qty: "18 hrs", desc: "Team time lost chasing briefs" },
        { qty: "4 wk", desc: "Avg shelf life of a winning hook" },
        { qty: "7 ads", desc: "Missed test slots per platform" },
        { qty: "$11k", desc: "Wasted spend on fatigued creatives" },
        { qty: "2 sprint", desc: "Eng diverted to 'just a quick edit'" },
      ],
    },
  },
  {
    value: "lag",
    label: "Lag",
    inactiveWidth: "8.5rem",
    headlineLine1: "Briefs go out Monday.",
    headlineLine2: "Assets land next Thursday.",
    subheading: "By then the trend is gone.",
    ask: "Sound familiar?",
    body: "Traditional agencies take weeks. By the time creatives arrive, the testing window has closed.",
    receipt: {
      num: "#00567",
      problem: "LAG",
      total: "$31,200",
      items: [
        { qty: "10 days", desc: "Brief → live ad turnaround" },
        { qty: "3 trends", desc: "Missed this quarter" },
        { qty: "$18k", desc: "CPM inflation while waiting" },
        { qty: "42%", desc: "Drop in CTR after day 14" },
        { qty: "1 wk", desc: "Dead air between test cycles" },
      ],
    },
  },
  {
    value: "burnout",
    label: "Burnout",
    inactiveWidth: "10rem",
    headlineLine1: "Your best strategist is",
    headlineLine2: "trimming TikToks at 11pm.",
    subheading: "Again.",
    ask: "Sound familiar?",
    body: "In-house designers are stretched thin across revisions, resizes, and last-minute requests.",
    receipt: {
      num: "#00689",
      problem: "BURNOUT",
      total: "2 FTE",
      items: [
        { qty: "11:42pm", desc: "Avg export time on launch nights" },
        { qty: "6 apps", desc: "Tools your editor juggles nightly" },
        { qty: "2 FTE", desc: "Unbudgeted production hours / mo" },
        { qty: "1 dept", desc: "At risk of attrition this quarter" },
        { qty: "0 days", desc: "Your creative lead took off in Q1" },
      ],
    },
  },
  {
    value: "risk",
    label: "Risk",
    inactiveWidth: "9.75rem",
    headlineLine1: "One ad account,",
    headlineLine2: "three winners on rotation.",
    subheading: "Until they aren't.",
    ask: "Sound familiar?",
    body: "Freelancers and offshore teams deliver unpredictable quality. You spend more time fixing than launching.",
    receipt: {
      num: "#00741",
      problem: "RISK",
      total: "80% SPEND",
      items: [
        { qty: "3 ads", desc: "Carrying 80% of your account" },
        { qty: "9 days", desc: "Until the next fatigue curve hits" },
        { qty: "1 event", desc: "Between 'on track' and 'tanked quarter'" },
        { qty: "0 backup", desc: "Tested hooks ready to promote" },
        { qty: "$62k", desc: "Exposed spend on brittle rotation" },
      ],
    },
  },
]

function DiagnosticReceipt({ receipt }: { receipt: ProblemTab["receipt"] }) {
  return (
    <div className="relative w-full self-start rounded-sm bg-card px-5 pt-6 pb-8 sm:px-8 sm:pt-10 sm:pb-18 md:px-11">
      <div className="pointer-events-none absolute -top-3 right-2 -rotate-12 rounded-[10px] border-2 border-primary bg-card px-2 py-1 font-sans text-xs font-black tracking-wide text-primary uppercase opacity-90 sm:top-[25%] sm:right-2 sm:-translate-y-1/2 sm:border-3 sm:px-4 sm:py-2.5 sm:text-xl">
        SOUND FAMILIAR?
      </div>
      <div className="mb-3 flex items-start justify-between gap-4 border-b border-dashed border-black pb-3 sm:mb-4 sm:pb-4">
        <span className="type-heading-4 sm:type-heading-2 font-black! text-foreground uppercase">
          HOOKANA
          <br />
          DIAGNOSTIC
        </span>
        <span className="mt-1 font-mono text-[10px] tracking-widest text-primary uppercase sm:mt-2 sm:text-xs">
          {receipt.num}
        </span>
      </div>
      <div className="mb-1 font-mono text-[10px] tracking-widest text-foreground uppercase sm:text-xs">
        CASHIER · CREATIVE OPS
      </div>
      <div className="mb-3 font-mono text-[10px] tracking-widest text-foreground uppercase sm:mb-5 sm:text-xs">
        Hidden cost of{" "}
        <span className="font-bold text-primary">{receipt.problem}</span> /mo
      </div>
      <ul className="m-0 list-none p-0">
        {receipt.items.map((item, i) => (
          <li
            key={i}
            className="type-heading-4 sm:type-heading-3 grid grid-cols-[1fr_auto] gap-2 py-1.5 text-xs leading-snug sm:gap-3 sm:py-3 sm:text-sm"
          >
            <span className="text-foreground">{item.desc}</span>
            <span className="font-bold whitespace-nowrap text-foreground">
              {item.qty}
            </span>
          </li>
        ))}
      </ul>
      <div className="mt-3 flex items-baseline justify-between gap-3 border-t border-dashed border-white pt-3 sm:mt-5 sm:pt-5">
        <span className="font-mono text-[10px] tracking-widest text-foreground uppercase sm:text-xs">
          Total drag
        </span>
        <span className="font-sans text-2xl leading-none font-black tracking-tight text-primary sm:text-4xl">
          {receipt.total}
        </span>
      </div>
      <div className="mt-3 flex justify-between font-mono text-[9px] tracking-widest text-foreground uppercase sm:mt-4 sm:text-[11px]">
        <span>TY — COME AGAIN</span>
        <span>PAID · IN CPM</span>
      </div>
      <div className="absolute right-0 -bottom-6 left-0 h-7">
        <svg
          width="100%"
          height="28"
          viewBox="0 0 696 28"
          preserveAspectRatio="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            fill="var(--color-card)"
            d="M0,0 L25,28 L50,0 L75,28 L100,0 L125,28 L150,0 L175,28 L200,0 L225,28 L250,0 L275,28 L300,0 L325,28 L350,0 L375,28 L400,0 L425,28 L450,0 L475,28 L500,0 L525,28 L550,0 L575,28 L600,0 L625,28 L650,0 L675,28 L696,0 Z"
          />
        </svg>
      </div>
    </div>
  )
}

export function Problems({ tabs, className }: { tabs: ProblemTab[]; className?: string }) {
  const displayTabs = tabs?.length > 0 ? tabs : FALLBACK_TABS

  return (
    <div className={`px-5 ${className ?? ""}`}>
      <div className="relative mt-24 mb-10 block lg:hidden">
        {displayTabs.map((tab, idx) => (
          <div
            key={tab.value}
            className="sticky w-full rounded-t-[2rem] rounded-b-[2rem] border-t border-white/40 bg-lime-200 px-5 pt-8 pb-10 shadow-[0_-8px_30px_-10px_rgba(0,0,0,0.1)] sm:rounded-t-[3rem] sm:rounded-b-[3rem] sm:px-8 sm:pt-14 sm:pb-16 md:px-12 md:pt-16"
            style={{ top: `calc(64px + ${idx * 8}px)` }}
          >
            <div className="mb-6 w-fit rounded-full bg-lime-50 px-5 py-2 font-sans text-xs font-bold tracking-widest text-lime-950 uppercase shadow-sm sm:mb-8 sm:px-6 sm:py-2.5 sm:text-sm">
              {tab.label}
            </div>
            <div className="flex flex-col gap-6 sm:gap-10">
              <div className="flex flex-col gap-4 sm:gap-6">
                <p className="type-heading-3 sm:type-heading-2 text-primary">
                  {tab.headlineLine1}
                  <br />
                  {tab.headlineLine2}
                </p>
                <p className="type-heading-4 font-semibold text-accent-foreground">
                  {tab.subheading}
                </p>
              </div>
              <div className="flex flex-col gap-2 sm:gap-3">
                <p className="text-sm text-accent-foreground sm:text-base md:text-lg">
                  {tab.body}
                </p>
              </div>
              <div className="mt-2 flex w-full justify-center sm:mt-4 sm:max-w-lg sm:self-center">
                <DiagnosticReceipt receipt={tab.receipt} />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="hidden lg:block">
        <Tabs defaultValue={displayTabs[0]?.value} className="mt-40 gap-0">
          <TabsList className="ml-8 h-auto gap-0 rounded-none bg-transparent p-0">
            {displayTabs.map((tab) => (
              <TabsTrigger
                key={tab.value}
                value={tab.value}
                className="type-heading-4 relative z-0 h-15 w-60! rounded-none rounded-t-md border-2 border-lime-500! bg-lime-50 text-accent-foreground [clip-path:polygon(0_0,calc(100%-2.5rem)_0,100%_100%,0_100%)] not-first:-ml-8 data-[state=active]:z-20 data-[state=active]:-translate-y-0.5 data-[state=active]:bg-lime-200"
                style={{ width: tab.inactiveWidth }}
              >
                {tab.label}
              </TabsTrigger>
            ))}
          </TabsList>
          {displayTabs.map((tab) => (
            <TabsContent
              key={tab.value}
              value={tab.value}
              className="z-40 min-h-[800px] w-full flex-none rounded-md bg-lime-200 py-18 pr-8 pl-20"
            >
              <div className="grid h-full grid-cols-1 gap-12 lg:grid-cols-2">
                <div className="flex min-h-120 flex-col justify-between">
                  <div className="flex max-w-120 flex-col gap-6">
                    <p className="type-heading-1 text-primary">
                      {tab.headlineLine1}
                      <br />
                      {tab.headlineLine2}
                    </p>
                    <p className="type-heading-3 text-accent-foreground">
                      {tab.subheading}
                    </p>
                  </div>
                  <div className="flex flex-col gap-2">
                    <p className="type-heading-4 max-w-172 text-accent-foreground">
                      {tab.body}
                    </p>
                  </div>
                </div>
                <div className="flex justify-end">
                  <DiagnosticReceipt receipt={tab.receipt} />
                </div>
              </div>
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </div>
  )
}
