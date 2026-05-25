
import { defineArrayMember, defineField, defineType } from "sanity"

const planFeature = defineArrayMember({
  type: "object",
  name: "planFeature",
  fields: [
    defineField({ name: "label", title: "Feature Label", type: "string" }),
    defineField({ name: "value", title: "Feature Value", type: "string" }),
  ],
  preview: { select: { title: "label", subtitle: "value" } },
})

const planTier = defineArrayMember({
  type: "object",
  name: "planTier",
  fields: [
    defineField({
      name: "id",
      title: "Tier ID",
      type: "string",
      options: { list: ["starter", "growth", "enterprise"] },
      description: "Controls the color theme of the card header",
    }),
    defineField({ name: "name", title: "Tier Name", type: "string" }),
    defineField({ name: "description", title: "Description", type: "text", rows: 2 }),
    defineField({ name: "features", title: "Features", type: "array", of: [planFeature] }),
    defineField({ name: "ctaText", title: "CTA Button Text", type: "string" }),
  ],
  preview: { select: { title: "name" } },
})

export const pricingSection = defineType({
  name: "pricingSection",
  title: "Pricing Section",
  type: "object",
  fields: [
    defineField({ name: "label", title: "Label (monospaced tag)", type: "string" }),
    defineField({ name: "heading", title: "Heading", type: "text", rows: 2 }),
    defineField({ name: "tiers", title: "Plan Tiers", type: "array", of: [planTier] }),
  ],
})
