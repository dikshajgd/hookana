import { defineArrayMember, defineField, defineType } from "sanity"

/**
 * Each tab on the portfolio page is backed by its own independently-ordered
 * array. Drag-and-drop within an array = on-page order for that tab.
 *
 *  - aiItems       -> "AI" tab (rendered as video)
 *  - staticItems   -> "Static" tab (rendered as image)
 *  - videoItems    -> "Videos" tab (rendered as video)
 *  - allWorkItems  -> "All work" tab (mixed; each entry declares its kind)
 *
 * "All work" is intentionally its own list so the editor has full custom
 * control over the showcase order, rather than being a derived merge.
 */

const mediaItemFields = [
  defineField({
    name: "url",
    title: "Media URL",
    type: "url",
    description:
      "Direct Cloudinary URL (.mp4/.mov for video, .png/.jpg for image).",
    validation: (rule) => rule.required(),
  }),
  defineField({
    name: "title",
    title: "Title / Alt text",
    type: "string",
    description: "Optional, used for accessibility and internal reference.",
  }),
]

const videoItem = defineArrayMember({
  type: "object",
  name: "portfolioVideo",
  title: "Video",
  fields: mediaItemFields,
  preview: {
    select: { title: "title", url: "url" },
    prepare({ title, url }) {
      return { title: title || url || "Untitled video", subtitle: "Video" }
    },
  },
})

const imageItem = defineArrayMember({
  type: "object",
  name: "portfolioImage",
  title: "Image",
  fields: mediaItemFields,
  preview: {
    select: { title: "title", url: "url" },
    prepare({ title, url }) {
      return { title: title || url || "Untitled image", subtitle: "Static" }
    },
  },
})

// All-work entries need to declare kind since they can be either.
const mixedItem = defineArrayMember({
  type: "object",
  name: "portfolioMixed",
  title: "Item",
  fields: [
    defineField({
      name: "kind",
      title: "Type",
      type: "string",
      options: {
        list: [
          { title: "Video / Reel", value: "video" },
          { title: "Static / Image", value: "image" },
        ],
        layout: "radio",
      },
      initialValue: "video",
      validation: (rule) => rule.required(),
    }),
    ...mediaItemFields,
  ],
  preview: {
    select: { title: "title", kind: "kind", url: "url" },
    prepare({ title, kind, url }) {
      return {
        title: title || url || "Untitled item",
        subtitle: kind === "image" ? "Static" : "Video",
      }
    },
  },
})

export const portfolioPage = defineType({
  name: "portfolioPage",
  title: "Portfolio Page",
  type: "document",
  groups: [
    { name: "header", title: "Header" },
    { name: "all", title: "All work" },
    { name: "ai", title: "AI" },
    { name: "static", title: "Static" },
    { name: "video", title: "Videos" },
  ],
  fields: [
    defineField({
      name: "eyebrow",
      title: "Eyebrow",
      type: "string",
      description: "Small label above the headline (e.g. \"Portfolio\").",
      group: "header",
    }),
    defineField({
      name: "heading",
      title: "Headline",
      type: "string",
      group: "header",
    }),
    defineField({
      name: "description",
      title: "Description",
      type: "text",
      rows: 3,
      group: "header",
    }),
    defineField({
      name: "allWorkItems",
      title: "All work — order",
      type: "array",
      description:
        "Custom order for the \"All work\" tab. Add and reorder freely; each entry declares whether it's a video or a static image.",
      of: [mixedItem],
      group: "all",
    }),
    defineField({
      name: "aiItems",
      title: "AI — order",
      type: "array",
      description: "Drag to reorder. All entries are rendered as videos.",
      of: [videoItem],
      group: "ai",
    }),
    defineField({
      name: "staticItems",
      title: "Static — order",
      type: "array",
      description: "Drag to reorder. All entries are rendered as static images.",
      of: [imageItem],
      group: "static",
    }),
    defineField({
      name: "videoItems",
      title: "Videos — order",
      type: "array",
      description:
        "Real (non-AI) videos. Drag to reorder. All entries are rendered as videos.",
      of: [videoItem],
      group: "video",
    }),
  ],
  preview: {
    prepare() {
      return { title: "Portfolio Page" }
    },
  },
})
