"use client"

import { useState, type FormEvent } from "react"
import type { ContactContent } from "@/sanity/lib/types"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { useEditable } from "@/components/admin/editor/editor-context"
import { EditableText } from "@/components/admin/editor/editable-text"

const FALLBACK: Pick<ContactContent, "heading" | "subtext" | "footerText"> = {
  heading: "Get your\nfirst 2\n concepts\nfree.",
  subtext:
    "No strings. No credit card. Just tell us about your brand and we'll build two ad concepts on the house.",
  footerText:
    "We'll review your brand, build 2 sample concepts, and walk you through them on a quick call.",
}

type FormState = {
  name: string
  brandName: string
  website: string
  email: string
  ongoingSupport: string
  budget: string
  productDescription: string
  brief: string
  brandAssets: string
  adSpend: string
  deliveryEmail: string
}

const INITIAL: FormState = {
  name: "",
  brandName: "",
  website: "",
  email: "",
  ongoingSupport: "",
  budget: "",
  productDescription: "",
  brief: "",
  brandAssets: "",
  adSpend: "",
  deliveryEmail: "",
}

type Status = "idle" | "submitting" | "success" | "error"

export function CtaForm({ content }: { content: ContactContent | null }) {
  const c = useEditable("contact", content, FALLBACK)
  const [values, setValues] = useState<FormState>(INITIAL)
  const [status, setStatus] = useState<Status>("idle")
  const [errorMsg, setErrorMsg] = useState("")

  const update =
    (key: keyof FormState) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
      setValues((v) => ({ ...v, [key]: e.target.value }))

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setStatus("submitting")
    setErrorMsg("")
    try {
      const res = await fetch("/api/lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      })
      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        setErrorMsg(body.error || "Something went wrong. Please try again.")
        setStatus("error")
        return
      }
      setValues(INITIAL)
      setStatus("success")
    } catch {
      setErrorMsg("Network error. Please try again.")
      setStatus("error")
    }
  }

  return (
    <div className="flex w-full justify-center px-5 2xl:px-0">
      <section className="relative -mt-20 w-full max-w-180 rounded-t-[5px] border border-ash bg-paper-white px-6 py-12 2xl:px-19 2xl:py-18">
        <div className="mx-auto">
          <div className="grid gap-6 2xl:grid-cols-[255px_1fr] 2xl:gap-9">
            <EditableText
              as="h2"
              path="contact.heading"
              value={c.heading}
              multiline
              className="font-editorial font-light text-4xl leading-[0.95] tracking-[-0.02em] text-voltage-blue sm:text-[42px] 2xl:text-[64px] 2xl:leading-[0.95]"
            />
            <EditableText
              as="p"
              path="contact.subtext"
              value={c.subtext}
              className="font-ease text-xl tracking-[-0.02em] max-w-none text-ink 2xl:max-w-70.25"
            />
          </div>

          <div className="mt-12 border-t border-dotted border-ash 2xl:mt-20" />

          <div className="mt-12 2xl:mt-24">
            <div className="mb-8">
              <h3 className="font-ease text-2xl font-normal tracking-[-0.03em] text-ink">
                GET 2 FREE CONCEPTS
              </h3>
              <p className="mt-1 text-sm text-muted-foreground">
                for Meta, Snapchat & short-form ads
              </p>
              <p className="mt-3 text-sm text-foreground">
                We only take a limited number of brands each month.
              </p>
              <p className="mt-2 text-sm text-foreground">
                If it&rsquo;s a fit, we&rsquo;ll send 2 tailored concepts based on your
                product, creatives, and current ad direction.
              </p>
            </div>

            {status === "success" ? (
              <div className="rounded-none border border-ash bg-cream p-8 text-center">
                <p className="font-ease text-2xl font-normal tracking-[-0.03em] text-ink">Thanks — we got it.</p>
                <p className="mt-3 font-ease text-sm tracking-[-0.02em] text-ink/70">
                  We&apos;ll review your brand and be in touch within 1&ndash;2 business days.
                </p>
              </div>
            ) : (
            <form onSubmit={handleSubmit} className="flex flex-col gap-5">
              <Field label="Name" required>
                <Input
                  required
                  value={values.name}
                  onChange={update("name")}
                  placeholder="Your full name"
                  className="rounded-none border-ash bg-paper-white text-ink placeholder:text-fog"
                />
              </Field>

              <Field label="Brand name" required>
                <Input
                  required
                  value={values.brandName}
                  onChange={update("brandName")}
                  placeholder="e.g. Hookana"
                  className="rounded-none border-ash bg-paper-white text-ink placeholder:text-fog"
                />
              </Field>

              <Field label="Website / Landing Page">
                <Input
                  type="url"
                  value={values.website}
                  onChange={update("website")}
                  placeholder="https://yourbrand.com"
                  className="rounded-none border-ash bg-paper-white text-ink placeholder:text-fog"
                />
              </Field>

              <Field label="Email" required>
                <Input
                  type="email"
                  required
                  value={values.email}
                  onChange={update("email")}
                  placeholder="you@brand.com"
                  className="rounded-none border-ash bg-paper-white text-ink placeholder:text-fog"
                />
              </Field>

              <Field
                label="Are you looking for ongoing creative support if it's a fit?"
                required
              >
                <div className="flex flex-col gap-2">
                  <label className="flex items-center gap-2 text-sm text-foreground">
                    <input
                      type="radio"
                      name="ongoingSupport"
                      value="Yes — actively looking"
                      checked={values.ongoingSupport === "Yes — actively looking"}
                      onChange={update("ongoingSupport")}
                      required
                    />
                    Yes — actively looking
                  </label>
                  <label className="flex items-center gap-2 text-sm text-foreground">
                    <input
                      type="radio"
                      name="ongoingSupport"
                      value="Just exploring for now"
                      checked={values.ongoingSupport === "Just exploring for now"}
                      onChange={update("ongoingSupport")}
                    />
                    Just exploring for now
                  </label>
                </div>
              </Field>

              <Field label="Budget Per Creative (Design/Editing Only)">
                <Input
                  value={values.budget}
                  onChange={update("budget")}
                  placeholder="e.g. $150 per creative"
                  className="rounded-none border-ash bg-paper-white text-ink placeholder:text-fog"
                />
              </Field>

              <Field label="Product Description">
                <Textarea
                  value={values.productDescription}
                  onChange={update("productDescription")}
                  rows={3}
                  placeholder="What you sell, who it's for, and what makes it different"
                />
              </Field>

              <Field label="Brief/Concept you would like us to produce (LINKS ONLY)">
                <Textarea
                  value={values.brief}
                  onChange={update("brief")}
                  rows={2}
                  placeholder="Paste links to references, briefs, or boards (Drive, Notion, Figma, etc.)"
                />
              </Field>

              <Field
                label="Brand Assets — Product, UGC Footages, Brand Guide (LINKS ONLY)"
                required
              >
                <Textarea
                  required
                  value={values.brandAssets}
                  onChange={update("brandAssets")}
                  rows={2}
                  placeholder="Drive / Dropbox / Notion links to product shots, UGC, brand guide"
                />
              </Field>

              <Field label="Current Monthly Ad Spend">
                <Input
                  value={values.adSpend}
                  onChange={update("adSpend")}
                  placeholder="e.g. $10k / month on Meta + Snap"
                  className="rounded-none border-ash bg-paper-white text-ink placeholder:text-fog"
                />
              </Field>

              <Field label="Where should we send your concepts?">
                <Input
                  type="email"
                  value={values.deliveryEmail}
                  onChange={update("deliveryEmail")}
                  placeholder="best email to receive the concepts"
                  className="rounded-none border-ash bg-paper-white text-ink placeholder:text-fog"
                />
                <p className="mt-1 text-xs text-muted-foreground">
                  We usually deliver within 2&ndash;4 business days if selected.
                </p>
              </Field>

              {status === "error" && (
                <p className="font-mono text-xs text-red-600">{errorMsg}</p>
              )}

              <div className="mt-2">
                <Button
                  type="submit"
                  size="lg"
                  className="w-full sm:w-auto"
                  disabled={status === "submitting"}
                >
                  {status === "submitting" ? "Sending..." : "Send request"}
                </Button>
              </div>
            </form>
            )}
          </div>

          <div className="mt-12 border-t border-dotted border-ash 2xl:mt-24" />
          <EditableText
            as="p"
            path="contact.footerText"
            value={c.footerText}
            multiline
            className="mt-5 font-ease text-xs leading-relaxed tracking-[-0.02em] text-ink/70"
          />
        </div>

        <div className="absolute right-0 -bottom-6.75 left-0 h-7">
          <svg
            width="100%"
            height="28"
            viewBox="0 0 696 28"
            preserveAspectRatio="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M0,0 L25,28 L50,0 L75,28 L100,0 L125,28 L150,0 L175,28 L200,0 L225,28 L250,0 L275,28 L300,0 L325,28 L350,0 L375,28 L400,0 L425,28 L450,0 L475,28 L500,0 L525,28 L550,0 L575,28 L600,0 L625,28 L650,0 L675,28 L696,0 Z"
              fill="#fbf8f5"
            />
          </svg>
        </div>
      </section>
    </div>
  )
}

function Field({
  label,
  required,
  children,
}: {
  label: string
  required?: boolean
  children: React.ReactNode
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="font-ease text-sm font-normal tracking-[-0.02em] text-ink">
        {label}
        {required && <span className="ml-0.5 text-hot-pink">*</span>}
      </label>
      {children}
    </div>
  )
}

function Textarea(props: React.ComponentProps<"textarea">) {
  const { className, ...rest } = props
  return (
    <textarea
      {...rest}
      className={
        "w-full min-w-0 rounded-none border border-ash bg-paper-white px-3 py-2 text-base text-ink transition-[color,box-shadow,background-color] outline-none placeholder:text-fog focus-visible:ring-2 focus-visible:ring-ink/30 md:text-sm " +
        (className ?? "")
      }
    />
  )
}
