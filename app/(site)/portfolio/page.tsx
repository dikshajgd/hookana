import { PortfolioGallery } from "@/components/landing/portfolio-gallery"
import { PORTFOLIO_BUNDLES_FALLBACK, type PortfolioBundles } from "@/lib/portfolio-media"
import { getPortfolioBundles, getSiteSettings } from "@/lib/supabase/queries"

export const metadata = {
  title: "Portfolio — Hookana",
  description:
    "A selection of video ads and static creatives produced by Hookana for D2C brands.",
}

export default async function PortfolioPage() {
  const [bundles, settings] = await Promise.all([getPortfolioBundles(), getSiteSettings()])

  const portfolioSettings = settings.portfolio || {}
  const heading = portfolioSettings.heading || "Creative that converts."
  const description =
    portfolioSettings.description ||
    "Video ads and static concepts we've produced for D2C brands. Hover any reel for a preview, or tap to watch it full screen."

  // Fall back to default media if Supabase is empty
  const finalBundles: PortfolioBundles = {
    all: bundles.all.length ? bundles.all : PORTFOLIO_BUNDLES_FALLBACK.all,
    ai: bundles.ai.length ? bundles.ai : PORTFOLIO_BUNDLES_FALLBACK.ai,
    static: bundles.static.length ? bundles.static : PORTFOLIO_BUNDLES_FALLBACK.static,
    video: bundles.video.length ? bundles.video : PORTFOLIO_BUNDLES_FALLBACK.video,
  }

  return (
    <div className="mt-4 w-full overflow-x-clip bg-blue-50 pt-28 pb-20 lg:pt-24">
      <div className="mx-auto w-full max-w-7xl px-5 sm:px-6">
        <div className="flex flex-col gap-4">
          <h1 className="font-sans text-4xl leading-tight font-semibold tracking-[-1.5px] sm:text-[42px] md:text-[64px] md:leading-12 bg-gradient-to-r from-pink-500 via-pink-400 to-pink-300 bg-clip-text text-transparent">
            {heading}
          </h1>
          <p className="max-w-2xl text-base text-accent-foreground sm:text-lg">{description}</p>
        </div>

        <PortfolioGallery bundles={finalBundles} />
      </div>
    </div>
  )
}
