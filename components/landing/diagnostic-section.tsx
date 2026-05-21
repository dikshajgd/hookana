import { Diagnostic } from "@/components/landing/diagnostic"
import { LiveCounter } from "./live-counter"
import type { DiagnosticContent } from "@/sanity/lib/types"

const FALLBACK: DiagnosticContent = {
  headingLine1: "HOW HEALTHY ARE YOUR AD CREATIVES?",
  headingLine2: "MOST BRANDS DON'T KNOW!",
  descriptionText: "7 questions designed by creative strategists who've shipped 10,000+ ad creatives for D2C brands.",
  footerText: "Your answers reveal the exact bottlenecks killing your ad performance.",
  stats: [
    { value: "73%", label: "Brands have blind spots" },
    { value: "Free", label: "AI-powered analysis" },
    { value: "3 Min", label: "To diagnose yours" },
  ],
  introSubcopy: "Tell us about your brand so we can calibrate the diagnostic.",
  form: {
    brandNameLabel: "Brand name *",
    brandNameHelp: "We use this to personalize your results. Your score means more when it's named.",
    brandNamePlaceholder: "e.g Glowup Skincare",
    industryLabel: "Industry *",
    industryHelp: "Creative benchmarks differ by vertical. A skincare brand and a fitness brand have very different hook standards.",
    industryOptions: ["Beauty & Skincare","Fashion & Apparel","Health & Wellness","Food & Beverage","Home & Living","Tech & Gadgets","Fitness & Sports","Pet Products","Other D2C"],
    spendLabel: "Monthly ad spend",
    spendHelp: 'Helps us calibrate expectations. What counts as "low volume" at $5K looks very different at $500K.',
    spendOptions: ["Under $5K","$5K - $25K","$25K - $100K","$100K - $500K","$500K+"],
    startButtonText: "Start Creative Health Check",
  },
  questions: [],
}

export function DiagnosticSection({ content }: { content: DiagnosticContent | null }) {
  const data = content ?? FALLBACK
  const stats = data.stats?.length > 0 ? data.stats : FALLBACK.stats

  return (
    <div className="grid w-full gap-3 px-5 pt-2 pb-12 sm:gap-14 sm:pt-8 2xl:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] 2xl:gap-10 2xl:px-20 2xl:pt-0 2xl:py-0">
      <div className="flex max-w-93 flex-col gap-3 sm:gap-8 2xl:mt-60 2xl:gap-15 text-center 2xl:text-left mx-auto 2xl:mx-0">
        <p className="font-sans text-3xl sm:text-4xl 2xl:text-[64px] leading-tight 2xl:leading-16 font-black tracking-tight text-white uppercase">
          {data.headingLine1}
        </p>
        <p className="font-sans text-3xl sm:text-4xl 2xl:text-[64px] leading-tight 2xl:leading-16 font-semibold tracking-tight text-primary uppercase">
          {data.headingLine2}
        </p>
      </div>

      <div className="w-full justify-self-center">
        <Diagnostic content={data} />
      </div>

      <div className="mt-8 flex max-w-116 flex-col gap-8 2xl:mt-60 2xl:gap-9 2xl:justify-self-end text-center 2xl:text-left mx-auto 2xl:mx-0 items-center 2xl:items-start">
        <p className="type-heading-4 text-white">{data.descriptionText}</p>
        <div className="flex w-full flex-wrap justify-center 2xl:justify-start gap-4">
          {stats.map((stat) => (
            <div key={stat.value} className="flex w-55 flex-col gap-2 rounded-md bg-secondary px-5 py-3 text-left">
              <p className="type-heading-3 text-secondary-foreground">{stat.value}</p>
              <p className="font-code text-xs tracking-tight text-secondary-foreground">{stat.label}</p>
            </div>
          ))}
        </div>
        <p className="font-code text-sm text-white">{data.footerText}</p>
        <LiveCounter />
      </div>
    </div>
  )
}
