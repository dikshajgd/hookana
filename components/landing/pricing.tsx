import { Button } from "@/components/ui/button"
import { ContactLink } from "@/components/ui/contact-link"
import { ArrowUpRight, DollarSign } from "lucide-react"
import type { PlanTier, PricingContent } from "@/sanity/lib/types"

const FALLBACK: PricingContent = {
  label: "Simple Pricing",
  heading: "Plans that grow with\nyou.",
  tiers: [
    {
      id: "starter",
      name: "Starter Sprint",
      description: "For brands testing creative production outsourcing.",
      features: [
        { label: "Creatives / month", value: "30" },
        { label: "Turnaround time", value: "48Hr" },
        { label: "Brand", value: "1" },
        { label: "Support", value: "Slack / Email" },
        { label: "Revisions", value: "Unlimited" },
      ],
      ctaText: "GET 2 FREE CONCEPTS",
    },
    {
      id: "growth",
      name: "Growth Engine",
      description: "For teams scaling creative output aggressively.",
      features: [
        { label: "Creatives / month", value: "50+" },
        { label: "Turnaround time", value: "24-48Hr" },
        { label: "Brand", value: "Up to 3" },
        { label: "Support", value: "Priority queue" },
        { label: "Revisions", value: "Unlimited" },
      ],
      ctaText: "GET 2 FREE CONCEPTS",
    },
    {
      id: "enterprise",
      name: "Enterprise",
      description: "For agencies & large D2C with high-volume needs.",
      features: [
        { label: "Creatives / month", value: "Unlimited" },
        { label: "Turnaround time", value: "Same-day rush" },
        { label: "Brand", value: "Unlimited" },
        { label: "Support", value: "Dedicated team" },
        { label: "Revisions", value: "Unlimited" },
      ],
      ctaText: "GET 2 FREE CONCEPTS",
    },
  ],
}

function PlanTierTearEdge() {
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
          fill="var(--color-card)"
        />
      </svg>
    </div>
  )
}

function PlanTierCard({ tier }: { tier: PlanTier }) {
  const headerClasses =
    tier.id === "starter"
      ? "bg-spring-green text-ink"
      : tier.id === "growth"
        ? "bg-periwinkle text-ink"
        : "bg-sun-yellow text-ink"

  return (
    <article className="relative w-full overflow-visible">
      <div className="overflow-hidden rounded-t-[5px] border border-ink bg-paper-white">
        <div
          className={`relative flex items-center justify-between border-b border-ink py-4 pl-10 2xl:py-5 2xl:pl-15 ${headerClasses}`}
        >
          <div
            className="absolute top-0 left-0 h-6 w-6 bg-ink"
            style={{ clipPath: "polygon(0 0, 0 100%, 100% 0)" }}
          />
          <p className="relative font-ease text-2xl font-normal tracking-[-0.03em] sm:text-3xl 2xl:text-[56px] 2xl:leading-12">
            {tier.name}
          </p>
          <DollarSign
            className="relative mr-4 size-6 shrink-0 sm:size-8 2xl:size-10"
            strokeWidth={1.75}
          />
        </div>

        <div className="px-6 pt-10 pb-20 2xl:px-12 2xl:pt-15 2xl:pb-40">
          <p className="font-ease text-2xl font-normal tracking-[-0.03em] text-ink">{tier.description}</p>

          <div className="mt-8 2xl:mt-11">
            {tier.features.map((feature) => (
              <div
                key={feature.label}
                className="flex flex-col justify-between border-t border-dotted border-ink py-5 2xl:block 2xl:py-11"
              >
                <p className="font-ease text-sm font-normal tracking-[-0.02em] text-charcoal sm:text-base 2xl:text-[32px] 2xl:leading-[34px]">
                  {feature.label}
                </p>
                <p className="mt-1 font-ease text-xl font-normal tracking-[-0.03em] text-ink sm:text-2xl 2xl:mt-2 2xl:text-[52px] 2xl:leading-[48px]">
                  {feature.value}
                </p>
              </div>
            ))}
          </div>

          <ContactLink>
            <Button
              size="lg"
              variant="default"
              className="mt-4 w-full rounded-md px-6 py-6 2xl:mt-0 2xl:w-auto"
            >
              {tier.ctaText ?? "GET 2 FREE CONCEPTS"}
              <ArrowUpRight className="size-4" />
            </Button>
          </ContactLink>
        </div>
      </div>
      <PlanTierTearEdge />
    </article>
  )
}

export function Pricing({ content }: { content: PricingContent | null }) {
  const { label, heading, tiers } = content ?? FALLBACK
  const displayTiers = tiers?.length > 0 ? tiers : FALLBACK.tiers
  const headingLines = heading.split("\n")

  return (
    <div className="overflow-hidden py-20 md:py-40">
      <div className="mx-auto flex flex-col items-center gap-12 2xl:gap-20">
        <div className="flex max-w-142 flex-col items-center gap-6 px-5 text-center md:px-36">
          <h2 className="font-ease text-[42px] leading-[0.95] font-normal tracking-[-0.04em] text-ink md:text-[64px] md:leading-[0.95]">
            {headingLines.map((line, i) => (
              <span key={i}>
                {line}
                {i < headingLines.length - 1 && <br />}
              </span>
            ))}
          </h2>
        </div>

        <div className="flex w-full snap-x snap-mandatory gap-6 overflow-x-auto px-5 pb-8 [-ms-overflow-style:none] [scrollbar-width:none] md:px-36 2xl:grid 2xl:grid-cols-3 2xl:gap-6 2xl:overflow-visible 2xl:px-36 2xl:pb-0 [&::-webkit-scrollbar]:hidden">
          {displayTiers.map((tier) => (
            <div
              key={tier.id}
              className="w-[85vw] max-w-[400px] shrink-0 snap-center 2xl:w-auto 2xl:max-w-none"
            >
              <PlanTierCard tier={tier} />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
