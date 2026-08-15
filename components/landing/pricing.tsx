"use client"

import { Button } from "@/components/ui/button"
import { ContactLink } from "@/components/ui/contact-link"
import { ArrowUpRight, DollarSign, X } from "lucide-react"
import type { PlanTier, PricingContent } from "@/sanity/lib/types"
import { useEditor, useEditable } from "@/components/admin/editor/editor-context"
import {
  useListControls,
  ListItemControls,
  AddItemButton,
} from "@/components/admin/editor/editable-list"
import { EditableText } from "@/components/admin/editor/editable-text"

const FALLBACK: PricingContent = {
  label: "Simple Pricing",
  heading: "Plans that grow with you.",
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
        { label: "No-poach guarantee", value: "In writing" },
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

function PlanTierCard({ tier, index }: { tier: PlanTier; index: number }) {
  const { editing } = useEditor()
  const featureControls = useListControls(`pricing.tiers.${index}.features`)

  return (
    <article className="relative w-full overflow-visible">
      <div className="overflow-hidden rounded-t-[5px] border border-ash bg-paper-white">
        <div className="relative flex items-center justify-between border-b border-ash bg-cream py-4 pl-10 text-ink 2xl:py-5 2xl:pl-15">
          <div
            className="absolute top-0 left-0 h-6 w-6 bg-ink"
            style={{ clipPath: "polygon(0 0, 0 100%, 100% 0)" }}
          />
          <EditableText
            as="p"
            path={`pricing.tiers.${index}.name`}
            value={tier.name}
            className="relative font-ease text-2xl font-normal tracking-[-0.03em] sm:text-3xl 2xl:text-[56px] 2xl:leading-12"
          />
          <DollarSign
            className="relative mr-4 size-6 shrink-0 sm:size-8 2xl:size-10"
            strokeWidth={1.75}
          />
        </div>

        <div className="px-6 pt-10 pb-20 2xl:px-12 2xl:pt-15 2xl:pb-40">
          <EditableText
            as="p"
            path={`pricing.tiers.${index}.description`}
            value={tier.description}
            multiline
            className="font-ease text-2xl font-normal tracking-[-0.03em] text-ink"
          />

          <div className="mt-8 2xl:mt-11">
            {tier.features.map((feature, fi) => (
              <div
                key={fi}
                className="relative flex flex-col justify-between border-t border-dotted border-ash py-5 2xl:block 2xl:py-11"
              >
                {editing && (
                  <button
                    type="button"
                    onClick={() => featureControls.remove(fi)}
                    className="absolute top-2 right-0 text-ink/40 hover:text-red-500"
                    aria-label="Remove feature"
                  >
                    <X className="size-4" />
                  </button>
                )}
                <EditableText
                  as="p"
                  path={`pricing.tiers.${index}.features.${fi}.label`}
                  value={feature.label}
                  className="font-ease text-sm font-normal tracking-[-0.02em] text-ink sm:text-base 2xl:text-[32px] 2xl:leading-[34px]"
                />
                <EditableText
                  as="p"
                  path={`pricing.tiers.${index}.features.${fi}.value`}
                  value={feature.value}
                  className="mt-1 font-ease text-xl font-normal tracking-[-0.03em] text-ink sm:text-2xl 2xl:mt-2 2xl:text-[52px] 2xl:leading-[48px]"
                />
              </div>
            ))}
            {editing && (
              <div className="mt-4">
                <AddItemButton
                  label="Add feature"
                  onClick={() => featureControls.add({ label: "New feature", value: "—" })}
                />
              </div>
            )}
          </div>

          <ContactLink disabled={editing}>
            <Button
              size="lg"
              variant="default"
              className="mt-4 w-full rounded-md px-6 py-6 2xl:mt-0 2xl:w-auto"
            >
              <EditableText
                path={`pricing.tiers.${index}.ctaText`}
                value={tier.ctaText ?? "GET 2 FREE CONCEPTS"}
              />
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
  const { editing } = useEditor()
  const { heading, tiers } = useEditable("pricing", content, FALLBACK)
  const displayTiers = tiers?.length > 0 ? tiers : FALLBACK.tiers
  const tierControls = useListControls("pricing.tiers")

  return (
    <div className="overflow-hidden pt-20 pb-10 md:pt-40 md:pb-16">
      <div className="mx-auto flex flex-col items-center gap-12 2xl:gap-20">
        {/* No md:px-* here: this box is already max-w constrained, so side
            padding would eat the line and stack the heading word-per-word.
            Width is set to hold the heading on one line at md:text-[64px]. */}
        <div className="flex max-w-142 flex-col items-center gap-6 px-5 text-center md:max-w-200">
          <EditableText
            as="h2"
            path="pricing.heading"
            value={heading}
            multiline
            className="font-editorial font-light text-[42px] leading-[0.95] tracking-[-0.02em] text-voltage-blue md:text-[64px] md:leading-[0.95]"
          />
        </div>

        <div className="flex w-full snap-x snap-mandatory gap-6 overflow-x-auto px-5 pb-8 [-ms-overflow-style:none] [scrollbar-width:none] md:px-36 2xl:grid 2xl:grid-cols-3 2xl:gap-6 2xl:overflow-visible 2xl:px-36 2xl:pb-0 [&::-webkit-scrollbar]:hidden">
          {displayTiers.map((tier, i) => (
            <div
              key={i}
              className="relative w-[85vw] max-w-[400px] shrink-0 snap-center 2xl:w-auto 2xl:max-w-none"
            >
              {editing && (
                <ListItemControls
                  index={i}
                  length={displayTiers.length}
                  onMove={tierControls.move}
                  onRemove={tierControls.remove}
                  className="-top-3 right-3"
                />
              )}
              <PlanTierCard tier={tier} index={i} />
            </div>
          ))}
        </div>
        {editing && (
          <AddItemButton
            label="Add plan"
            onClick={() =>
              tierControls.add({
                id: "growth",
                name: "New Plan",
                description: "Describe this plan.",
                features: [{ label: "Feature", value: "—" }],
                ctaText: "GET 2 FREE CONCEPTS",
              })
            }
          />
        )}
      </div>
    </div>
  )
}
