export default function PortfolioPage() {
  const placeholders = Array.from({ length: 6 })

  return (
    <div className="w-full overflow-x-clip bg-blue-50 pt-28 pb-20 lg:pt-40">
      <div className="mx-auto w-full max-w-7xl px-5 sm:px-6">
        <div className="flex flex-col gap-4">
          <p className="font-mono text-2xl font-semibold tracking-tight text-pink-500 sm:text-3xl 2xl:text-4xl">
            Portfolio
          </p>
          <h1 className="font-sans text-4xl leading-tight font-semibold tracking-[-1.5px] text-foreground sm:text-[42px] md:text-[64px] md:leading-12">
            Selected work, coming soon.
          </h1>
          <p className="max-w-2xl text-base text-accent-foreground sm:text-lg">
            We&apos;re putting together case studies and creative samples from
            recent D2C campaigns. Check back shortly.
          </p>
        </div>

        <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {placeholders.map((_, i) => (
            <div
              key={i}
              className="flex aspect-[4/5] flex-col justify-end rounded-2xl border border-blue-950/10 bg-lime-200 p-6 shadow-sm"
            >
              <p className="font-mono text-[10px] tracking-widest text-primary uppercase">
                Case #{String(i + 1).padStart(2, "0")}
              </p>
              <p className="type-heading-4 mt-2 text-accent-foreground">
                Placeholder project title
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
