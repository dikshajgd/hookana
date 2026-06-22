import { PortfolioGallery } from "@/components/landing/portfolio-gallery"
import {
  PORTFOLIO_BUNDLES_FALLBACK,
  toImageItems,
  toMixedItems,
  toVideoItems,
  type PortfolioBundles,
} from "@/lib/portfolio-media"
import { client } from "@/sanity/lib/client"
import { PORTFOLIO_PAGE_QUERY } from "@/sanity/lib/queries"
import type { PortfolioPageContent } from "@/sanity/lib/types"

export const metadata = {
  title: "Portfolio — Hookana",
  description:
    "A selection of video ads and static creatives produced by Hookana for D2C brands.",
}

export default async function PortfolioPage() {
  const page: PortfolioPageContent | null =
    await client.fetch(PORTFOLIO_PAGE_QUERY)

  // Each tab falls back to the bundled list independently, so a half-filled
  // CMS doc never leaves a tab blank for live visitors.
  const cms: PortfolioBundles = {
    all: toMixedItems(page?.allWorkItems),
    ai: toVideoItems(page?.aiItems, "ai"),
    static: toImageItems(page?.staticItems),
    video: toVideoItems(page?.videoItems, "video"),
  }
  const bundles: PortfolioBundles = {
    all: cms.all.length ? cms.all : PORTFOLIO_BUNDLES_FALLBACK.all,
    ai: cms.ai.length ? cms.ai : PORTFOLIO_BUNDLES_FALLBACK.ai,
    static: cms.static.length ? cms.static : PORTFOLIO_BUNDLES_FALLBACK.static,
    video: cms.video.length ? cms.video : PORTFOLIO_BUNDLES_FALLBACK.video,
  }

  return (
    <div className="mt-4 w-full overflow-x-clip bg-blue-50 pt-28 pb-20 lg:pt-24">
      <div className="mx-auto w-full max-w-7xl px-5 sm:px-6">
        <div className="flex flex-col gap-4">
          <h1 className="font-sans text-4xl leading-tight font-semibold tracking-[-1.5px] sm:text-[42px] md:text-[64px] md:leading-12 bg-gradient-to-r from-pink-500 via-pink-400 to-pink-300 bg-clip-text text-transparent">
            {page?.heading ?? "Creative that converts."}
          </h1>
          <p className="max-w-2xl text-base text-accent-foreground sm:text-lg">
            {page?.description ??
              "Video ads and static concepts we've produced for D2C brands. Hover any reel for a preview, or tap to watch it full screen."}
          </p>
        </div>

        <PortfolioGallery bundles={bundles} />
      </div>
    </div>
  )
}
