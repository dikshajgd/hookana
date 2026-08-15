"use client"

import { Fragment } from "react"
import { X } from "lucide-react"
import type { FooterContent } from "@/sanity/lib/types"
import { useEditor, useEditable } from "@/components/admin/editor/editor-context"
import { useListControls, AddItemButton } from "@/components/admin/editor/editable-list"
import { EditableText } from "@/components/admin/editor/editable-text"

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
  const { editing } = useEditor()
  const { tagline, socials, copyright } = useEditable("footer", content, FALLBACK)
  const socialControls = useListControls("footer.socials")

  return (
    <footer className="type-monospaced flex flex-col items-center justify-center gap-2 py-6 text-primary-foreground uppercase md:py-5">
      <EditableText
        as="p"
        path="footer.tagline"
        value={tagline}
        multiline
        className="max-w-122 text-center"
      />
      <p className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1">
        {socials.map((s, i) => (
          <Fragment key={i}>
            {i > 0 && !editing && <span aria-hidden="true">·</span>}
            <span className="inline-flex items-center gap-1">
              <a
                href={s.href}
                onClick={editing ? (e) => e.preventDefault() : undefined}
                target={s.href.startsWith("mailto:") ? undefined : "_blank"}
                rel={s.href.startsWith("mailto:") ? undefined : "noreferrer"}
                className="underline decoration-dotted underline-offset-4"
              >
                <EditableText path={`footer.socials.${i}.label`} value={s.label} rich={false} />
              </a>
              {editing && (
                <>
                  <EditableText
                    path={`footer.socials.${i}.href`}
                    value={s.href}
                    rich={false}
                    className="text-[10px] normal-case opacity-50"
                  />
                  <button
                    type="button"
                    onClick={() => socialControls.remove(i)}
                    className="text-primary-foreground/50 hover:text-red-400"
                    aria-label="Remove link"
                  >
                    <X className="size-3" />
                  </button>
                </>
              )}
            </span>
          </Fragment>
        ))}
      </p>
      {editing && (
        <AddItemButton
          label="Add link"
          onClick={() => socialControls.add({ label: "NEW LINK", href: "https://" })}
          className="border-white/30 text-white/70 hover:border-white hover:text-white"
        />
      )}
      <EditableText as="p" path="footer.copyright" value={copyright} />
    </footer>
  )
}
