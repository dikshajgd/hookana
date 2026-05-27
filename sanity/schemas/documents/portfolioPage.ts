import { defineArrayMember, defineField, defineType } from "sanity"

export const portfolioPage = defineType({
  name: "portfolioPage",
  title: "Portfolio Page",
  type: "document",
  fields: [
    defineField({
      name: "eyebrow",
      title: "Eyebrow",
      type: "string",
      description: "Small label above the headline (e.g. \"Portfolio\").",
    }),
    defineField({
      name: "heading",
      title: "Headline",
      type: "string",
    }),
    defineField({
      name: "description",
      title: "Description",
      type: "text",
      rows: 3,
    }),
    defineField({
      name: "items",
      title: "Work / Media",
      type: "array",
      description:
        "Each piece of work. Paste a Cloudinary URL (videos auto-generate a short, muted preview + a poster frame; statics are optimized). Order here is the order on the page.",
      of: [
        defineArrayMember({
          type: "object",
          name: "portfolioItem",
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
          ],
          preview: {
            select: { title: "title", subtitle: "kind", url: "url" },
            prepare({ title, subtitle, url }) {
              return {
                title: title || url || "Untitled item",
                subtitle: subtitle === "image" ? "Static" : "Video",
              }
            },
          },
        }),
      ],
    }),
  ],
  preview: {
    prepare() {
      return { title: "Portfolio Page" }
    },
  },
})
