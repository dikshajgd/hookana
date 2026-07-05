import { AnimatedStat } from "@/components/landing/animated-stat"
import type { StatsContent } from "@/sanity/lib/types"

const FALLBACK: StatsContent = {
  tabLabel: "Don't Take Our Word For It",
  stats: [
    { value: "80%", label: "Lower cost vs agencies" },
    { value: "3x", label: "Faster creative output" },
    { value: "48hr", label: "Average turnaround" },
    { value: "10K+", label: "Creatives shipped" },
  ],
  marqueeItems: [],
}

export function Stats({ content }: { content: StatsContent | null }) {
  const { tabLabel, stats } = content ?? FALLBACK
  const items = stats?.length > 0 ? stats : FALLBACK.stats

  return (
    <section className="mt-16 2xl:mt-30">
      {/* Stats */}
      <div className="overflow-hidden rounded-none border border-ash bg-cream px-6 py-10 sm:px-10 md:py-20 2xl:px-0 2xl:py-20">
        <h2 className="mb-10 text-center font-ease text-3xl font-normal tracking-[-0.03em] text-ink sm:text-4xl md:mb-16 2xl:mb-20 2xl:text-5xl">
          {tabLabel}
        </h2>
        <div className="mx-auto grid w-full grid-cols-2 gap-8 sm:gap-12 lg:grid-cols-4 2xl:flex 2xl:justify-center 2xl:gap-30">
          {items.map((item) => (
            <div
              key={item.value}
              className="flex flex-col items-center gap-2 text-center 2xl:items-start 2xl:text-left"
            >
              <AnimatedStat
                value={item.value}
                className="inline-flex items-center border-b-4 border-lime-brand pb-1 font-editorial text-5xl font-light tracking-[-0.02em] text-voltage-blue sm:text-6xl 2xl:text-7xl"
              />
              <p className="max-w-[120px] font-ease text-sm font-normal tracking-[-0.02em] text-ink sm:text-base 2xl:max-w-none 2xl:text-xl">
                {item.label}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
