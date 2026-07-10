"use client"

import { useState, type FormEvent } from "react"
import { ArrowRight } from "lucide-react"

export function NewsletterSubscribeBar() {
  const [email, setEmail] = useState("")
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle")
  const [errorMsg, setErrorMsg] = useState("")

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setStatus("submitting")
    setErrorMsg("")

    const res = await fetch("/api/newsletter/subscribe", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    })

    if (res.ok) {
      setStatus("success")
      setEmail("")
    } else {
      const body = await res.json().catch(() => ({}))
      setErrorMsg(body.error ?? "Something went wrong. Please try again.")
      setStatus("error")
    }
  }

  return (
    <section className="border-t border-ash bg-cream py-8">
      <div className="mx-auto flex max-w-5xl flex-col items-center gap-5 px-5 sm:flex-row sm:gap-8">
        <div className="text-center sm:flex-1 sm:text-left">
          <p className="font-ease mb-1 text-[10px] font-light tracking-[3px] text-voltage-blue uppercase">
            Creative Edge Weekly
          </p>
          <p className="font-ease text-sm leading-snug tracking-[-0.02em] text-ink">
            Ad breakdowns, winning hooks &amp; production tactics — straight to your inbox.
          </p>
        </div>

        {status === "success" ? (
          <div className="font-ease text-sm font-light text-brand-green">
            ✓ You&apos;re subscribed!
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex w-full max-w-sm gap-2">
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@brand.com"
              className="font-ease min-w-0 flex-1 rounded-full border-[1.5px] border-ash bg-paper-white px-4 py-2.5 text-sm text-ink outline-none transition-colors placeholder:text-fog focus:border-voltage-blue"
            />
            <button
              type="submit"
              disabled={status === "submitting"}
              className="font-ease flex shrink-0 items-center gap-1.5 rounded-full border-[1.5px] border-voltage-blue px-5 py-2.5 text-sm font-light text-voltage-blue uppercase transition-colors hover:bg-voltage-blue/5 disabled:opacity-60"
            >
              {status === "submitting" ? "..." : (
                <>Subscribe <ArrowRight className="size-3.5" /></>
              )}
            </button>
          </form>
        )}
      </div>

      {status === "error" && (
        <p className="font-ease mt-3 px-5 text-center text-xs text-red-600">{errorMsg}</p>
      )}
    </section>
  )
}
