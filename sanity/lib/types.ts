// Navbar & Footer
export type NavLink = { label: string; href: string }
export type NavbarContent = {
  logoText: string
  ctaText: string
  links: NavLink[]
}
export type SocialLink = { label: string; href: string }
export type FooterContent = {
  tagline: string
  socials: SocialLink[]
  copyright: string
}
export type SiteSettings = {
  navbar: NavbarContent
  footer: FooterContent
}

// Hero
export type VideoCard = { label: string; url?: string; type?: "video" | "image" | "youtube" }
export type HeroContent = {
  headline: string
  subheadline: string
  description: string
  ctaText: string
  watchReelText: string
  videoCards: VideoCard[]
}

// Problems
export type ReceiptItem = { qty: string; desc: string }
export type ProblemReceipt = {
  num: string
  problem: string
  total: string
  items: ReceiptItem[]
}
export type ProblemTab = {
  value: string
  label: string
  inactiveWidth: string
  headlineLine1: string
  headlineLine2: string
  subheading: string
  ask: string
  body: string
  receipt: ProblemReceipt
}

// Diagnostic
export type DiagnosticOption = { label: string; value: number }
export type DiagnosticQuestion = {
  id: string
  area: string
  text: string
  subtext: string
  weight: number
  options: DiagnosticOption[]
}
export type DiagnosticStat = { value: string; label: string }
export type DiagnosticFormContent = {
  brandNameLabel: string
  brandNameHelp: string
  brandNamePlaceholder: string
  industryLabel: string
  industryHelp: string
  industryOptions: string[]
  spendLabel: string
  spendHelp: string
  spendOptions: string[]
  startButtonText: string
}
export type DiagnosticContent = {
  headingLine1: string
  headingLine2: string
  descriptionText: string
  footerText: string
  stats: DiagnosticStat[]
  introSubcopy: string
  form: DiagnosticFormContent
  questions: DiagnosticQuestion[]
}

// How It Works
export type Step = { title: string; body: string; caption: string }
export type HowItWorksContent = {
  label: string
  heading: string
  ctaText: string
  steps: Step[]
}

// Services
export type ServiceStat = { label: string; text: string }
export type ServiceTab = {
  value: string
  label: string
  title: string
  description: string
  deliverables: string[]
  stats: ServiceStat[]
}
export type ServicesContent = {
  label: string
  heading: string
  tabs: ServiceTab[]
}

// Stats
export type StatItem = { value: string; label: string }
export type StatsContent = {
  tabLabel: string
  stats: StatItem[]
  marqueeItems: string[]
}

// Roles
export type RoleItem = {
  tab: string
  problemTitle: string
  problemDescription: string
  solutionTitle: string
  solutionTags: string[]
  solutionDescription: string
  ctaText: string
}
export type RolesContent = {
  heading: string
  subheading: string
  roles: RoleItem[]
}

// Pricing
export type PlanFeature = { label: string; value: string }
export type PlanTier = {
  id: "starter" | "growth" | "enterprise"
  name: string
  description: string
  features: PlanFeature[]
  ctaText: string
}
export type PricingContent = {
  label: string
  heading: string
  tiers: PlanTier[]
}

// FAQ
export type FaqItem = { question: string; answer: string }
export type FaqContent = {
  heading1: string
  heading2: string
  items: FaqItem[]
}

// Logo Ticker
export type LogoItem = { alt: string; imageUrl: string }
export type LogoTickerContent = { logos: LogoItem[] }

// Testimonial
export type TestimonialContent = {
  videoUrl?: string
}

// CTA
export type CtaContent = {
  heading: string
  description: string
  ctaText: string
}

// Contact Form
export type ContactContent = {
  heading: string
  subtext: string
  footerText: string
}

// Full page bundle
export type LandingPageContent = {
  hero: HeroContent
  problems: { tabs: ProblemTab[] }
  diagnostic: DiagnosticContent
  howItWorks: HowItWorksContent
  services: ServicesContent
  stats: StatsContent
  roles: RolesContent
  pricing: PricingContent
  faq: FaqContent
  testimonial: TestimonialContent
  cta: CtaContent
  contact: ContactContent
  logoTicker: LogoTickerContent
}
