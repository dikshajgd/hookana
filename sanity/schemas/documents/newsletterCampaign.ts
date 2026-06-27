import { defineField, defineType } from "sanity"

export const newsletterCampaign = defineType({
  name: "newsletterCampaign",
  title: "Newsletter Campaign",
  type: "document",
  fields: [
    defineField({ name: "title", title: "Internal Title", type: "string" }),
    defineField({ name: "subject", title: "Email Subject Line", type: "string" }),
    defineField({ name: "htmlContent", title: "HTML Content", type: "text" }),
    defineField({ name: "plainText", title: "Plain Text", type: "text" }),
    defineField({
      name: "mode",
      title: "Mode",
      type: "string",
      options: {
        list: [
          { title: "Manual / Paste", value: "manual" },
          { title: "AI Generated", value: "generated" },
        ],
      },
    }),
    defineField({ name: "prompt", title: "Generation Prompt", type: "text" }),
    defineField({
      name: "status",
      title: "Status",
      type: "string",
      options: {
        list: [
          { title: "Draft", value: "draft" },
          { title: "Sent", value: "sent" },
        ],
      },
      initialValue: "draft",
    }),
    defineField({ name: "sentAt", title: "Sent At", type: "datetime" }),
    defineField({ name: "sentCount", title: "Emails Sent", type: "number", initialValue: 0 }),
    defineField({ name: "recipientCount", title: "Total Recipients", type: "number", initialValue: 0 }),
  ],
  preview: {
    select: {
      title: "subject",
      subtitle: "status",
    },
  },
})
