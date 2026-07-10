/**
 * Content schema — the single source that drives the admin content editor.
 *
 * Each Section maps 1:1 to a row in the `site_settings` table (key = Section.key)
 * and to the `content` prop of a landing/portfolio component. A schema-driven,
 * recursive form renderer turns this into labeled inputs, so adding a new
 * editable section is just another entry here — no bespoke form code.
 *
 * `CONTENT_DEFAULTS` mirrors each component's built-in fallback copy so the
 * editor pre-fills with the text that's live today, before anything is saved.
 */

export type FieldType = "text" | "textarea" | "list" | "group"

export type Field = {
  key: string
  label: string
  type: FieldType
  help?: string
  /** singular noun for list/group rows, e.g. "Question", "Tier" */
  itemLabel?: string
  /** subfields for a `group` (array of objects) */
  fields?: Field[]
}

export type Section = {
  key: string
  label: string
  description?: string
  fields: Field[]
}

export const SECTIONS: Section[] = [
  {
    key: "hero",
    label: "Hero (top of homepage)",
    description: "The big headline and intro at the very top of the site.",
    fields: [
      { key: "headline", label: "Headline", type: "text" },
      { key: "subheadline", label: "Subheadline (pink line)", type: "text" },
      { key: "description", label: "Description paragraph", type: "textarea" },
      { key: "ctaText", label: "Button text", type: "text" },
    ],
  },
  {
    key: "portfolio",
    label: "Portfolio page — heading",
    description: "The title and intro on the /portfolio page.",
    fields: [
      { key: "heading", label: "Heading", type: "text" },
      { key: "description", label: "Intro paragraph", type: "textarea" },
    ],
  },
  {
    key: "cta",
    label: "Call-to-action band",
    description: "The big 'stop letting creative be the bottleneck' band near the bottom.",
    fields: [
      {
        key: "heading",
        label: "Heading",
        type: "textarea",
        help: "Each new line becomes a new line on the site.",
      },
      { key: "description", label: "Description", type: "textarea" },
      { key: "ctaText", label: "Button text", type: "text" },
    ],
  },
  {
    key: "contact",
    label: "Contact form — copy",
    description: "The headings around the 'get 2 free concepts' form.",
    fields: [
      { key: "heading", label: "Heading", type: "textarea", help: "New lines become new lines on the site." },
      { key: "subtext", label: "Subtext", type: "textarea" },
      { key: "footerText", label: "Footer note", type: "textarea" },
    ],
  },
  {
    key: "faq",
    label: "FAQ",
    description: "Frequently asked questions.",
    fields: [
      { key: "heading1", label: "Heading line 1", type: "textarea", help: "New lines become new lines." },
      { key: "heading2", label: "Heading line 2", type: "text" },
      {
        key: "items",
        label: "Questions",
        type: "group",
        itemLabel: "Question",
        fields: [
          { key: "question", label: "Question", type: "text" },
          { key: "answer", label: "Answer", type: "textarea" },
        ],
      },
    ],
  },
  {
    key: "footer",
    label: "Footer",
    description: "Bottom-of-page tagline, links, and copyright.",
    fields: [
      { key: "tagline", label: "Tagline", type: "textarea" },
      {
        key: "socials",
        label: "Social links",
        type: "group",
        itemLabel: "Link",
        fields: [
          { key: "label", label: "Label", type: "text" },
          { key: "href", label: "URL", type: "text" },
        ],
      },
      { key: "copyright", label: "Copyright line", type: "text" },
    ],
  },
]

// Public base for homepage media on Supabase Storage — mirrors the SITE_MEDIA
// const in the landing components so the editor seeds with exactly what's live.
const SITE_MEDIA = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/portfolio-media/site`

export const CONTENT_DEFAULTS: Record<string, any> = {
  hero: {
    headline: "Creativity at Volume.",
    subheadline: "Without the compromise.",
    description:
      "D2C brands and performance teams need fresh creatives, fast, on-brand, and at scale. Hookana is the creative production engine that keeps your pipeline full without blowing your budget or burning out your team.",
    ctaText: "GET 2 FREE CONCEPTS",
    videoCards: [
      { label: "Brand Films", url: `${SITE_MEDIA}/hero/web-1-neyohx.mp4`, poster: `${SITE_MEDIA}/hero/web-1-neyohx.jpg`, type: "video" },
      { label: "Ad Creatives", url: `${SITE_MEDIA}/hero/web-2-jqspsb.mp4`, poster: `${SITE_MEDIA}/hero/web-2-jqspsb.jpg`, type: "video" },
      { label: "Social Content", url: `${SITE_MEDIA}/hero/web-3-srdr8v.mp4`, poster: `${SITE_MEDIA}/hero/web-3-srdr8v.jpg`, type: "video" },
      { label: "Brand Films", url: `${SITE_MEDIA}/hero/web-4-hskvt6.mp4`, poster: `${SITE_MEDIA}/hero/web-4-hskvt6.jpg`, type: "video" },
      { label: "Ad Creatives", url: `${SITE_MEDIA}/hero/web-5-u6jm0u.mp4`, poster: `${SITE_MEDIA}/hero/web-5-u6jm0u.jpg`, type: "video" },
      { label: "Social Content", url: `${SITE_MEDIA}/hero/web-6-w4q8zh.mp4`, poster: `${SITE_MEDIA}/hero/web-6-w4q8zh.jpg`, type: "video" },
      { label: "Brand Films", url: `${SITE_MEDIA}/hero/web-7-mp8jqo.mp4`, poster: `${SITE_MEDIA}/hero/web-7-mp8jqo.jpg`, type: "video" },
      { label: "Ad Creatives", url: `${SITE_MEDIA}/hero/web-8-b8kyka.mp4`, poster: `${SITE_MEDIA}/hero/web-8-b8kyka.jpg`, type: "video" },
      { label: "Social Content", url: `${SITE_MEDIA}/hero/web-9-bvyerz.mp4`, poster: `${SITE_MEDIA}/hero/web-9-bvyerz.jpg`, type: "video" },
      { label: "Brand Films", url: `${SITE_MEDIA}/hero/web-10-nuhkfe.mp4`, poster: `${SITE_MEDIA}/hero/web-10-nuhkfe.jpg`, type: "video" },
      { label: "Ad Creatives", url: `${SITE_MEDIA}/hero/web-11-wdxwuy.mp4`, poster: `${SITE_MEDIA}/hero/web-11-wdxwuy.jpg`, type: "video" },
    ],
  },
  portfolio: {
    heading: "Creative that converts.",
    description:
      "Video ads and static concepts we've produced for D2C brands. Hover any reel for a preview, or tap to watch it full screen.",
  },
  cta: {
    heading: "STOP LETTING\nCREATIVE BE THE\nBOTTLENECK.",
    description: "See how Hookana can 3x your creative output in just 48 hours.",
    ctaText: "GET 2 FREE CONCEPTS",
  },
  contact: {
    heading: "Get your\nfirst 2\n concepts\nfree.",
    subtext:
      "No strings. No credit card. Just tell us about your brand and we'll build two ad concepts on the house.",
    footerText:
      "We'll review your brand, build 2 sample concepts, and walk you through them on a quick call.",
  },
  faq: {
    heading1: "Got\nquestions?",
    heading2: "Good.",
    items: [
      {
        question: "How fast can you deliver?",
        answer:
          "Most projects ship within 48 hours. Rush delivery (same-day) is available on Growth and Enterprise plans.",
      },
      {
        question: "What types of creatives do you produce?",
        answer:
          "Static ads, video ads, carousel ads, UGC-style edits, motion graphics, creative concepts, and ad iterations. If it runs on Meta, TikTok, Snapchat, or YouTube, we make it.",
      },
      {
        question: "Do you offer revisions?",
        answer: "Unlimited revisions on all plans. First-draft approval rate sits above 85%.",
      },
      {
        question: 'What does "concept to variation" mean?',
        answer:
          "A concept is a fresh creative idea with its own angle, hook, and visual approach. A variation is a spin on a winning concept: different headline, different opening frame, different CTA, or different pacing. We build the original concept, test it, and when it performs, we rapidly produce 3-5 variations to extend its lifespan before fatigue sets in. That's concept to variation, and it's how the best performance teams keep ROAS stable week after week.",
      },
      {
        question: "How is Hookana different from a freelancer or agency?",
        answer:
          "Freelancers are unpredictable. Agencies are slow and expensive. Hookana gives you dedicated creative production at agency quality, at a fraction of the cost, and we actually hit deadlines.",
      },
    ],
  },
  footer: {
    tagline: "CREATIVE PRODUCTION FOR PERFORMANCE MARKETERS WHO REFUSE TO COMPROMISE.",
    socials: [
      { label: "INSTAGRAM", href: "https://www.instagram.com/hookana.social" },
      { label: "LINKEDIN", href: "https://www.linkedin.com/company/hookana/" },
      { label: "TIKTOK", href: "https://www.tiktok.com/@_hookana" },
      { label: "EMAIL US", href: "mailto:admin@hookana.com" },
    ],
    copyright: "© 2026 HOOKANA · ALL RIGHTS RESERVED",
  },
  logoTicker: {
    logos: [
      { alt: "Nutrisense", imageUrl: "/logos/Nutrisense.png" },
      { alt: "Salt Labs", imageUrl: "/logos/SaltLabs.png" },
      { alt: "Studio Era", imageUrl: "/logos/StudioEra.png" },
      { alt: "TOB", imageUrl: "/logos/TOB.png" },
      { alt: "Veralane", imageUrl: "/logos/Veralane.png" },
      { alt: "Brainjolt", imageUrl: "/logos/brainjolt.png" },
      { alt: "Tata Fit", imageUrl: "/logos/tata-fit.png" },
      { alt: "Intel", imageUrl: "/logos/intel.png" },
      { alt: "Dell", imageUrl: "/logos/dell.png" },
    ],
  },
  testimonial: {
    videoUrl: `${SITE_MEDIA}/testimonial/Testimonials-Deeanimators-qkytj7.mp4`,
    posterUrl: `${SITE_MEDIA}/testimonial/Testimonials-Deeanimators-qkytj7.jpg`,
  },
}
