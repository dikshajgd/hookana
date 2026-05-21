import { client } from "@/sanity/lib/client"
import { LANDING_PAGE_QUERY, SITE_SETTINGS_QUERY } from "@/sanity/lib/queries"
import type { LandingPageContent, SiteSettings } from "@/sanity/lib/types"
import { Cta } from "@/components/landing/cta"
import { CtaForm } from "@/components/landing/cta-form"
import { DiagnosticSection } from "@/components/landing/diagnostic-section"
import { Faq } from "@/components/landing/faq"
import { Footer } from "@/components/landing/footer"
import { Hero } from "@/components/landing/hero"
import { HeroCarousel } from "@/components/landing/hero-carousel"
import { HookanaWay } from "@/components/landing/hookana-way"
import { Pricing } from "@/components/landing/pricing"
import { Problems } from "@/components/landing/problems"
import { Roles } from "@/components/landing/roles"
import { StatsMarquee } from "@/components/landing/stats-marquee"
import { Stats } from "@/components/landing/stats"
import { Testimonial } from "@/components/landing/testimonial"
import { WhatWeDo } from "@/components/landing/what-we-do"

export default async function Page() {
  const [page, settings]: [LandingPageContent | null, SiteSettings | null] =
    await Promise.all([
      client.fetch(LANDING_PAGE_QUERY),
      client.fetch(SITE_SETTINGS_QUERY),
    ])

  return (
    <div className="w-full overflow-x-clip">
      <Hero content={page?.hero ?? null} />
      <HeroCarousel logos={page?.logoTicker?.logos} />

      <div className="flex flex-col">
        <Problems
          tabs={page?.problems?.tabs ?? []}
          className="order-2 md:order-1"
        />

        <div className="order-1 mt-26 w-full bg-blue-950 md:order-2 md:mt-50">
          <div id="free-check" className="scroll-mt-44">
            <DiagnosticSection content={page?.diagnostic ?? null} />
          </div>
          <div id="how-it-works" className="scroll-mt-24">
            <HookanaWay content={page?.howItWorks ?? null} />
          </div>
        </div>
      </div>

      <StatsMarquee items={page?.stats?.marqueeItems ?? []} />

      <section className="w-full bg-blue-50 pt-12 pb-15 sm:pt-30">
        <div id="services" className="scroll-mt-24">
          <WhatWeDo content={page?.services ?? null} />
        </div>
        <div id="who-its-for" className="scroll-mt-24">
          <Roles content={page?.roles ?? null} />
        </div>
        <div className="px-6">
          <Stats content={page?.stats ?? null} />
          <Testimonial content={page?.testimonial ?? null} />
        </div>
      </section>

      <section className="bg-blue-950">
        <div id="pricing" className="scroll-mt-24">
          <Pricing content={page?.pricing ?? null} />
        </div>
        <Faq content={page?.faq ?? null} />
      </section>

      <section className="bg-blue-50">
        <Cta content={page?.cta ?? null} />
      </section>

      <section className="bg-secondary pt-8 md:pt-0">
        <div className="relative">
          <img
            src="/svg/guy.svg"
            alt=""
            aria-hidden="true"
            className="pointer-events-none absolute top-1/2 left-1/2 z-0 hidden w-160 max-w-none -translate-x-200 -translate-y-40 2xl:block"
          />
          <img
            src="/svg/girl.svg"
            alt=""
            aria-hidden="true"
            className="pointer-events-none absolute top-1/2 left-1/2 z-0 hidden w-108 max-w-none translate-x-78 -translate-y-44 2xl:block"
          />
          <div id="contact" className="relative z-10 scroll-mt-24">
            <CtaForm content={page?.contact ?? null} />
          </div>

          <div className="mt-12 flex items-end justify-center gap-12 px-5 pb-20 2xl:hidden">
            <img
              src="/svg/guy.svg"
              alt=""
              aria-hidden="true"
              className="hidden w-160 scale-50 md:block md:scale-75"
            />
            <img
              src="/svg/girl.svg"
              alt=""
              aria-hidden="true"
              className="hidden w-108 scale-50 md:block md:scale-75"
            />
          </div>
        </div>
        <Footer content={settings?.footer ?? null} />
      </section>
    </div>
  )
}
