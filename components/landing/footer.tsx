import { Fragment } from "react"
import type { FooterContent } from "@/sanity/lib/types"

const FALLBACK: FooterContent = {
  tagline: "CREATIVE PRODUCTION FOR PERFORMANCE MARKETERS WHO REFUSE TO COMPROMISE.",
  socials: [
    { label: "INSTAGRAM", href: "https://www.instagram.com/hookana.social" },
    { label: "LINKEDIN", href: "https://www.linkedin.com/company/hookana/" },
    { label: "TIKTOK", href: "https://www.tiktok.com/@_hookana" },
    { label: "EMAIL US", href: "mailto:admin@hookana.com" },
  ],
  copyright: "© 2026 HOOKANA · ALL RIGHTS RESERVED",
}

export function Footer({ content }: { content: FooterContent | null }) {
  const { tagline, socials, copyright } = content ?? FALLBACK

  return (
    <footer className="flex flex-col items-center justify-center gap-5 border-t border-ash py-30 text-center uppercase">
      <p className="font-ease max-w-122 text-sm font-light tracking-[-0.02em] text-ink">
        {tagline}
      </p>
      <p className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1">
        {socials.map((s, i) => (
          <Fragment key={s.href}>
            {i > 0 && (
              <span aria-hidden="true" className="text-fog">
                ·
              </span>
            )}
            <a
              href={s.href}
              target={s.href.startsWith("mailto:") ? undefined : "_blank"}
              rel={s.href.startsWith("mailto:") ? undefined : "noreferrer"}
              className="font-ease text-sm font-light tracking-[-0.02em] text-voltage-blue underline decoration-dotted underline-offset-4 transition-opacity hover:opacity-60"
            >
              {s.label}
            </a>
          </Fragment>
        ))}
      </p>
      <p className="font-ease text-xs font-light tracking-[-0.02em] text-fog">{copyright}</p>
    </footer>
  )
}
