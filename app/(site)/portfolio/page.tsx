import { PortfolioGallery } from "@/components/landing/portfolio-gallery"
import { PORTFOLIO_MEDIA, toMediaItems } from "@/lib/portfolio-media"
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

  // Fall back to the bundled media list if the CMS doc has no items yet.
  const cmsItems = toMediaItems(page?.items)
  const items = cmsItems.length > 0 ? cmsItems : PORTFOLIO_MEDIA

  return (
    <div className="w-full overflow-x-clip bg-blue-50 pt-28 pb-20 lg:pt-40">
      <div className="mx-auto w-full max-w-7xl px-5 sm:px-6">
        <div className="flex flex-col gap-4">
          <p className="font-mono text-2xl font-semibold tracking-tight text-pink-500 sm:text-3xl 2xl:text-4xl">
            {page?.eyebrow ?? "Portfolio"}
          </p>
          <h1 className="font-sans text-4xl leading-tight font-semibold tracking-[-1.5px] text-foreground sm:text-[42px] md:text-[64px] md:leading-12">
            {page?.heading ?? "Creative that converts."}
          </h1>
          <p className="max-w-2xl text-base text-accent-foreground sm:text-lg">
            {page?.description ??
              "Video ads and static concepts we've produced for D2C brands. Hover any reel for a preview, or tap to watch it full screen."}
          </p>
        </div>

        <PortfolioGallery items={items} />
      </div>
    </div>
  )
}
