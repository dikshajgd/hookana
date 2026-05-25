import type { LogoItem } from "@/sanity/lib/types"

const FALLBACK_LOGOS: LogoItem[] = [
  { alt: "Nutrisense", imageUrl: "/logos/Nutrisense.png" },
  { alt: "Salt Labs", imageUrl: "/logos/SaltLabs.png" },
  // { alt: "SkinnyRx", imageUrl: "/logos/SkinnyRx.png" },
  { alt: "Studio Era", imageUrl: "/logos/StudioEra.png" },
  { alt: "TOB", imageUrl: "/logos/TOB.png" },
  { alt: "Veralane", imageUrl: "/logos/Veralane.png" },
  { alt: "Brainjolt", imageUrl: "/logos/brainjolt.png" },
  { alt: "Tata Fit", imageUrl: "/logos/tata-fit.png" },
  // { alt: "Jet Learn", imageUrl: "/logos/jet-learn.png" },
  { alt: "Intel", imageUrl: "/logos/intel.png" },
  { alt: "Dell", imageUrl: "/logos/dell.png" },
]

export function HeroCarousel({ logos }: { logos?: LogoItem[] }) {
  const items = logos && logos.length > 0 ? logos : FALLBACK_LOGOS
  const repeated = [...items, ...items, ...items, ...items]

  return (
    <>
      <style>{`
        @keyframes scrollMarquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-marquee {
          animation: scrollMarquee 40s linear infinite;
        }
      `}</style>
      <div className="pointer-events-none relative z-10 h-0 w-full overflow-x-clip overflow-y-visible">
        <div className="pointer-events-auto absolute -top-20 left-1/2 h-66 w-234 origin-center -translate-x-1/2 scale-[0.45] transition-all duration-300 sm:-top-14 sm:scale-[0.55] md:scale-75 lg:-top-7 lg:right-5 lg:left-auto lg:origin-right lg:translate-x-0 lg:scale-90 xl:scale-100">
          <img
            src="/svg/the-roll.svg"
            alt=""
            aria-hidden="true"
            className="absolute inset-0 h-full w-full object-contain object-right"
          />

          <div className="absolute top-8 right-2 left-8 flex h-48 items-center overflow-hidden">
            <div className="animate-marquee flex w-max items-center">
              {repeated.map((item, idx) => (
                <div key={idx} className="flex items-center">
                  <div className="flex items-center justify-center px-10">
                    <img
                      src={item.imageUrl}
                      alt={item.alt}
                      className="h-10 max-w-32 object-contain brightness-0 invert"
                    />
                  </div>
                  <div className="h-20 border-l-4 border-dotted border-white" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
