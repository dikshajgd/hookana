import { getSiteSettings } from "@/lib/supabase/queries"
import { Cta } from "@/components/landing/cta"
import { CtaForm } from "@/components/landing/cta-form"
import { Faq } from "@/components/landing/faq"
import { Footer } from "@/components/landing/footer"
import { Hero } from "@/components/landing/hero"
import { HeroCarousel } from "@/components/landing/hero-carousel"
import { HookanaWay } from "@/components/landing/hookana-way"
import { Newsletter } from "@/components/landing/newsletter"
import { NewsletterSubscribeBar } from "@/components/landing/newsletter-subscribe-bar"
import { Pricing } from "@/components/landing/pricing"
import { Problems } from "@/components/landing/problems"
// import { Roles } from "@/components/landing/roles"
import { StatsMarquee } from "@/components/landing/stats-marquee"
import { Stats } from "@/components/landing/stats"
import { Testimonial } from "@/components/landing/testimonial"
import { WhatWeDo } from "@/components/landing/what-we-do"

export default async function Page() {
  const settings = await getSiteSettings()

  return (
    <div className="w-full overflow-x-clip">
      <Hero content={settings.hero ?? null} />
      <HeroCarousel logos={settings.logoTicker?.logos} />

      <div className="flex flex-col">
        <Problems
          tabs={settings.problems?.tabs ?? []}
        />

        <div className="mt-26 w-full bg-charcoal md:mt-50">
          <div id="contact" className="scroll-mt-24 bg-charcoal pt-24 lg:pt-0">
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
              <div className="relative z-10">
                <CtaForm content={settings.contact ?? null} />
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
          </div>
          <div id="how-it-works" className="scroll-mt-24">
            <HookanaWay content={settings.howItWorks ?? null} />
          </div>
        </div>
      </div>

      <StatsMarquee items={settings.stats?.marqueeItems ?? []} />

      <section className="w-full bg-warm-linen pt-12 pb-15 sm:pt-30">
        <div id="services" className="scroll-mt-24">
          <WhatWeDo content={settings.services ?? null} />
        </div>
        {/* <div id="who-its-for" className="scroll-mt-24">
          <Roles content={settings.roles ?? null} />
        </div> */}
        <div className="px-6">
          <Stats content={settings.stats ?? null} />
          <Testimonial content={settings.testimonial ?? null} />
        </div>
      </section>

      <section className="bg-warm-linen">
        <div id="pricing" className="scroll-mt-24">
          <Pricing content={settings.pricing ?? null} />
        </div>
      </section>

      <section className="bg-warm-linen">
        <Cta content={settings.cta ?? null} />
      </section>

      <section className="bg-warm-linen">
        <Faq content={settings.faq ?? null} />
      </section>

      <Newsletter />

      <section className="bg-charcoal">
        <Footer content={settings.footer ?? null} />
      </section>

      <NewsletterSubscribeBar />
    </div>
  )
}
