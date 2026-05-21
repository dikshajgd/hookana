"use client"

import { useState, type FormEvent } from "react"
import type { ContactContent } from "@/sanity/lib/types"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

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
  const c = content ?? FALLBACK
  const headingLines = c.heading.split("\n")
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
      <section className="relative -mt-20 w-full max-w-180 bg-card px-6 py-12 2xl:px-19 2xl:py-18">
        <div className="absolute top-0 -right-px h-16 w-16 overflow-hidden bg-blue-50">
          <div
            className="absolute inset-0 bg-muted-foreground"
            style={{ clipPath: "polygon(0 0, 0 100%, 100% 100%)" }}
          />
        </div>

        <div className="mx-auto">
          <div className="grid gap-6 2xl:grid-cols-[255px_1fr] 2xl:gap-9">
            <h2 className="font-sans text-4xl leading-tight font-semibold tracking-tight text-card-foreground sm:text-[42px] sm:tracking-[-1.5px] 2xl:text-[64px] 2xl:leading-12">
              {headingLines.map((line, i) => (
                <span key={i}>
                  {line}
                  {i < headingLines.length - 1 && <br />}
                </span>
              ))}
            </h2>
            <p className="type-heading-3 max-w-none text-foreground 2xl:max-w-70.25">
              {c.subtext}
            </p>
          </div>

          <div className="mt-12 border-t border-dotted border-neutral-950 2xl:mt-20" />

          <div className="mt-12 2xl:mt-24">
            <div className="mb-8">
              <h3 className="font-sans text-2xl font-semibold tracking-tight text-card-foreground">
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
              <div className="rounded-md border border-neutral-200 bg-white p-8 text-center">
                <p className="type-heading-3 text-foreground">Thanks — we got it.</p>
                <p className="mt-3 font-mono text-xs text-blue-500">
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
                  className="rounded-md border-neutral-300 bg-white text-neutral-900 placeholder:text-neutral-400"
                />
              </Field>

              <Field label="Brand name" required>
                <Input
                  required
                  value={values.brandName}
                  onChange={update("brandName")}
                  placeholder="e.g. Hookana"
                  className="rounded-md border-neutral-300 bg-white text-neutral-900 placeholder:text-neutral-400"
                />
              </Field>

              <Field label="Website / Landing Page">
                <Input
                  type="url"
                  value={values.website}
                  onChange={update("website")}
                  placeholder="https://yourbrand.com"
                  className="rounded-md border-neutral-300 bg-white text-neutral-900 placeholder:text-neutral-400"
                />
              </Field>

              <Field label="Email" required>
                <Input
                  type="email"
                  required
                  value={values.email}
                  onChange={update("email")}
                  placeholder="you@brand.com"
                  className="rounded-md border-neutral-300 bg-white text-neutral-900 placeholder:text-neutral-400"
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
                  className="rounded-md border-neutral-300 bg-white text-neutral-900 placeholder:text-neutral-400"
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
                  className="rounded-md border-neutral-300 bg-white text-neutral-900 placeholder:text-neutral-400"
                />
              </Field>

              <Field label="Where should we send your concepts?">
                <Input
                  type="email"
                  value={values.deliveryEmail}
                  onChange={update("deliveryEmail")}
                  placeholder="best email to receive the concepts"
                  className="rounded-md border-neutral-300 bg-white text-neutral-900 placeholder:text-neutral-400"
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

          <div className="mt-12 border-t border-dotted border-neutral-950 2xl:mt-24" />
          <p className="mt-5 font-mono text-xs leading-3.5 text-blue-500">
            {c.footerText}
          </p>
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
              fill="#fff"
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
      <label className="text-sm font-medium text-card-foreground">
        {label}
        {required && <span className="ml-0.5 text-destructive">*</span>}
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
        "w-full min-w-0 rounded-md border border-neutral-300 bg-white px-3 py-2 text-base text-neutral-900 transition-[color,box-shadow,background-color] outline-none placeholder:text-neutral-400 focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/30 md:text-sm " +
        (className ?? "")
      }
    />
  )
}
