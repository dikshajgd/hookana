import { notFound } from "next/navigation"
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

type CategorySlug = "ai" | "static" | "videos"

const CATEGORY_META: Record<
  CategorySlug,
  { filter: "ai" | "static" | "video"; label: string; tagline: string; description: string }
> = {
  ai: {
    filter: "ai",
    label: "AI Creatives",
    tagline: "Machine-speed production. Human-level craft.",
    description:
      "Fast without sacrificing brand. Sharp hooks, on-brand visuals, and conversion-focused edits built to perform in the feed.",
  },
  static: {
    filter: "static",
    label: "Static Ads",
    tagline: "Every pixel earns its place.",
    description:
      "Scroll-stopping image creatives for D2C brands that know conversion starts with the first glance. Clean, on-brand, and designed to make people stop, read, and act.",
  },
  videos: {
    filter: "video",
    label: "Video Ads",
    tagline: "From hook to purchase.",
    description:
      "Real shoots, real results. We build video ads that stop the scroll, earn the watch, and convert — at whatever length the platform demands.",
  },
}

export function generateStaticParams() {
  return (Object.keys(CATEGORY_META) as CategorySlug[]).map((category) => ({
    category,
  }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ category: string }>
}) {
  const { category } = await params
  const meta = CATEGORY_META[category as CategorySlug]
  if (!meta) return {}
  return {
    title: `${meta.label} — Hookana Portfolio`,
    description: meta.description,
  }
}

export default async function CategoryPortfolioPage({
  params,
}: {
  params: Promise<{ category: string }>
}) {
  const { category } = await params
  const meta = CATEGORY_META[category as CategorySlug]
  if (!meta) notFound()

  const page: PortfolioPageContent | null =
    await client.fetch(PORTFOLIO_PAGE_QUERY)

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
        <div className="flex flex-col gap-5 pb-2">
          <p className="font-mono text-2xl font-semibold tracking-tight text-pink-500 sm:text-3xl 2xl:text-4xl">
            Portfolio
          </p>
          <h1 className="font-sans text-4xl leading-tight font-semibold tracking-[-1.5px] text-foreground sm:text-[42px] md:text-[64px] md:leading-12">
            {meta.label}
          </h1>
          <p className="max-w-2xl text-xl font-semibold tracking-tight text-foreground sm:text-2xl">
            {meta.tagline}
          </p>
          <p className="max-w-2xl text-base text-accent-foreground sm:text-lg">
            {meta.description}
          </p>
        </div>

        <PortfolioGallery
          bundles={bundles}
          defaultFilter={meta.filter}
          showFilters={false}
        />
      </div>
    </div>
  )
}
