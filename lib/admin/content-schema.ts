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

import { THEME_DEFAULT_COLORS, THEME_DEFAULT_FONTS } from "./theme-tokens"

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
  problems: {
    tabs: [
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
    ],
  },
  howItWorks: {
    label: "The Hookana Way",
    heading: "Closer than an agency.\nFaster than a team.",
    ctaText: "Get 2 Free Concepts",
    steps: [
      { title: "BRIEF IT.", body: "Drop your brief via Slack, Notion, email. We adapt to your tools.", caption: "Day 0" },
      { title: "WE BUILD IT.", body: "Our creative team produces ad-ready assets in 48 hours or less.", caption: "24 - 48 hours" },
      { title: "YOU TEST IT.", body: "Launch, measure, iterate. We keep the creative pipeline flowing.", caption: "Ongoing" },
    ],
  },
  services: {
    label: "What We Do?",
    heading: "Full-stack creative production.",
    tabs: [
      {
        value: "core-service",
        label: "Core Service",
        title: "Ad Creative Production",
        description: "Static ads, video ads, carousels, motion graphics. Optimized for Meta, TikTok, Snapchat, and YouTube.",
        deliverables: [
          "Hook variations and A/B test sets",
          "Static ad designs (feed, story, square, landscape)",
          "Short-form video cuts for Meta, TikTok, Snapchat",
          "Carousel ad sequences",
          "Motion graphics and animated assets",
          "Platform-specific resizes and adaptations",
        ],
        stats: [
          { label: "TURNAROUND", text: "Standard: 48 hours. Rush (same-day) available on Growth and Enterprise plans." },
          { label: "REVISIONS", text: "Unlimited. First-draft approval rate above 85%." },
          { label: "BEST FOR", text: "Performance marketers running paid acquisition who need consistent creative volume." },
        ],
      },
      {
        value: "video-production",
        label: "UGC-Style Edits",
        title: "UGC-Style Edits",
        description: "Authentic creator-style video content that feels native to the feed.",
        deliverables: [
          "UGC-style video edits from raw creator footage",
          "Hook-first editing with pattern-interrupt openers",
          "Trending audio integration and timing",
          "Subtitle/caption overlays for silent viewing",
          "Performance-optimized cuts for paid placement",
        ],
        stats: [
          { label: "BEST FOR", text: "D2C brands running TikTok, Instagram Reels, and Snapchat campaigns." },
          { label: "HOW IT WORKS", text: "Send us raw creator footage, product shots, or screen recordings. We handle everything." },
        ],
      },
      {
        value: "strategy-layer",
        label: "Strategy Layer",
        title: "Creative Strategy",
        description: "Hook frameworks, angle testing roadmaps, competitor creative teardowns.",
        deliverables: [
          "Competitor creative analysis and teardowns",
          "Hook framework development for your brand",
          "Angle testing roadmap with prioritized concepts",
          "Creative brief templates customized to your brand",
        ],
        stats: [
          { label: "BEST FOR", text: "Teams who have production capacity but lack creative direction." },
          { label: "PAIRS WITH", text: "Ad Creative Production + Creative Strategy = full-stack creative operations." },
        ],
      },
      {
        value: "ai-augmented",
        label: "AI-Augmented",
        title: "AI Content Generation",
        description: "AI-assisted workflows that multiply output without multiplying costs.",
        deliverables: [
          "AI-generated concept mockups before production",
          "Rapid hook and headline variations",
          "Human review on every output before delivery",
        ],
        stats: [
          { label: "THE PRINCIPLE", text: "AI accelerates. Humans decide. No automated slop ships to your inbox." },
          { label: "RESULT", text: "3x output at no additional cost." },
        ],
      },
    ],
  },
  stats: {
    tabLabel: "Don't Take Our Word For It",
    stats: [
      { value: "80%", label: "Lower cost vs agencies" },
      { value: "3x", label: "Faster creative output" },
      { value: "48hr", label: "Average turnaround" },
      { value: "10K+", label: "Creatives shipped" },
    ],
    marqueeItems: [
      "US · AU · India",
      "4.9★ client rating",
      "48-hr avg turnaround",
      "10,000+ creatives shipped",
      "50+ D2C brands served",
    ],
  },
  pricing: {
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
  },
  theme: {
    colors: { ...THEME_DEFAULT_COLORS },
    fonts: { ...THEME_DEFAULT_FONTS },
  },
}
