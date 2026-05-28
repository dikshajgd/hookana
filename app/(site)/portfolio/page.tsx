import { PortfolioGallery } from "@/components/landing/portfolio-gallery"
import { PORTFOLIO_MEDIA } from "@/lib/portfolio-media"

export const metadata = {
  title: "Portfolio — Hookana",
  description:
    "A selection of video ads and static creatives produced by Hookana for D2C brands.",
}

export default function PortfolioPage() {
  return (
    <div className="w-full overflow-x-clip bg-blue-50 pt-28 pb-20 lg:pt-40">
      <div className="mx-auto w-full max-w-7xl px-5 sm:px-6">
        <div className="flex flex-col gap-4">
          <p className="font-mono text-2xl font-semibold tracking-tight text-pink-500 sm:text-3xl 2xl:text-4xl">
            Portfolio
          </p>
          <h1 className="font-sans text-4xl leading-tight font-semibold tracking-[-1.5px] text-foreground sm:text-[42px] md:text-[64px] md:leading-12">
            Creative that converts.
          </h1>
          <p className="max-w-2xl text-base text-accent-foreground sm:text-lg">
            Video ads and static concepts we&apos;ve produced for D2C brands.
            Hover any reel for a preview, or tap to watch it full screen.
          </p>
        </div>

        <PortfolioGallery items={PORTFOLIO_MEDIA} />
      </div>
    </div>
  )
}
