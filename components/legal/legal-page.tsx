import type { ReactNode } from "react"
import Link from "next/link"
import { legal, legalReady } from "@/lib/legal"

/** Shared shell for /privacy, /terms and /refunds: plain, readable, one column. */
export function LegalPage({ title, children }: { title: string; children: ReactNode }) {
  return (
    <main id="main" className="mx-auto w-full max-w-3xl px-6 pt-36 pb-24 text-ink lg:pt-44">
      <h1 className="type-heading-2">{title}</h1>
      {legalReady ? (
        <p className="mt-3 font-mono text-xs text-muted-foreground uppercase">
          Last updated {legal.effectiveDate}
        </p>
      ) : (
        <p className="mt-3 font-mono text-xs text-muted-foreground uppercase">
          This page is being finalised. Questions? Email{" "}
          <a className="underline underline-offset-4" href={`mailto:${legal.contactEmail}`}>
            {legal.contactEmail}
          </a>
        </p>
      )}
      <div className="mt-10 space-y-8 text-base leading-relaxed [&_h2]:mb-3 [&_h2]:text-xl [&_h2]:font-semibold [&_a]:underline [&_a]:underline-offset-4 [&_li]:ml-5 [&_li]:list-disc [&_ul]:space-y-1">
        {children}
      </div>
      <nav
        aria-label="Legal"
        className="mt-16 flex flex-wrap gap-x-6 gap-y-2 border-t border-ash pt-6 font-mono text-xs uppercase"
      >
        <Link href="/">Home</Link>
        <Link href="/privacy">Privacy</Link>
        <Link href="/terms">Terms</Link>
        <Link href="/refunds">Refunds</Link>
      </nav>
    </main>
  )
}

/** Renders a legal detail, or nothing if it's still waiting on the owner. */
export function Detail({ value, children }: { value: string; children: ReactNode }) {
  if (!value || value === "PENDING") return null
  return <>{children}</>
}
