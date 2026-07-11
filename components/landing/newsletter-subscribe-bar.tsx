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
    <section className="bg-[#0A1628] border-t border-white/10 py-8">
      <div className="mx-auto max-w-5xl px-5 flex flex-col sm:flex-row items-center gap-5 sm:gap-8">
        <div className="sm:flex-1 text-center sm:text-left">
          <p className="font-mono text-[10px] tracking-[3px] text-blue-300/60 uppercase mb-1">
            Creative Edge Weekly
          </p>
          <p className="text-white/80 text-sm leading-snug">
            Ad breakdowns, winning hooks &amp; production tactics — straight to your inbox.
          </p>
        </div>

        {status === "success" ? (
          <div className="text-green-400 text-sm font-mono">
            ✓ You&apos;re subscribed!
          </div>
        ) : (
          <form
            onSubmit={handleSubmit}
            className="flex w-full max-w-sm gap-2"
          >
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@brand.com"
              className="flex-1 min-w-0 bg-white/10 border border-white/20 rounded-lg px-3 py-2.5 text-sm text-white placeholder:text-white/30 outline-none focus:border-blue-400 transition-colors"
            />
            <button
              type="submit"
              disabled={status === "submitting"}
              className="flex items-center gap-1.5 bg-white text-[#0A1628] font-bold px-4 py-2.5 rounded-lg text-sm hover:bg-blue-50 disabled:opacity-60 transition-colors shrink-0"
            >
              {status === "submitting" ? "..." : (
                <>Subscribe <ArrowRight className="size-3.5" /></>
              )}
            </button>
          </form>
        )}
      </div>

      {status === "error" && (
        <p className="text-center text-xs text-red-400 font-mono mt-3 px-5">{errorMsg}</p>
      )}
    </section>
  )
}
