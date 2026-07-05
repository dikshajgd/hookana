"use client"

import { useState, type FormEvent } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { ArrowUpRight } from "lucide-react"

const HEADING = "GET THE WEEKLY\nCREATIVE EDGE."
const SUBTEXT =
  "Ad breakdowns, winning hooks, and production tactics — straight to your inbox. No fluff, unsubscribe anytime."

type Status = "idle" | "submitting" | "success" | "error"

export function Newsletter() {
  const [email, setEmail] = useState("")
  const [status, setStatus] = useState<Status>("idle")
  const [errorMsg, setErrorMsg] = useState("")

  const lines = HEADING.split("\n")

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setStatus("submitting")
    setErrorMsg("")
    try {
      const res = await fetch("/api/newsletter/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      })
      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        setErrorMsg(body.error || "Something went wrong. Please try again.")
        setStatus("error")
        return
      }
      setEmail("")
      setStatus("success")
    } catch {
      setErrorMsg("Network error. Please try again.")
      setStatus("error")
    }
  }

  return (
    <section className="bg-warm-linen">
      <div className="mx-auto flex max-w-7xl flex-col items-center gap-6 px-5 py-20 text-center md:py-32">
        <h2 className="font-editorial font-light text-[40px] leading-[0.95] tracking-[-0.02em] text-voltage-blue break-words sm:text-[52px] sm:leading-[0.95] md:max-w-187.5 md:text-[80px] md:leading-[0.95]">
          {lines.map((line, i) => (
            <span key={i}>
              {line}
              {i < lines.length - 1 && <br />}
            </span>
          ))}
        </h2>

        <p className="type-heading-4 max-w-2xl px-4 text-foreground">{SUBTEXT}</p>

        {status === "success" ? (
          <div className="mt-4 w-full max-w-xl rounded-md border border-neutral-200 bg-white p-8">
            <p className="type-heading-3 text-foreground">You&apos;re in. 🎉</p>
            <p className="mt-3 font-mono text-xs text-blue-500">
              Check your inbox to confirm — the next issue is on its way.
            </p>
          </div>
        ) : (
          <form
            onSubmit={handleSubmit}
            className="mt-4 flex w-full max-w-xl flex-col gap-3 sm:flex-row"
          >
            <Input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@brand.com"
              aria-label="Email address"
              className="h-11 rounded-none border-ash bg-paper-white text-ink placeholder:text-fog sm:flex-1"
            />
            <Button
              type="submit"
              size="lg"
              className="h-11"
              disabled={status === "submitting"}
            >
              {status === "submitting" ? "Subscribing..." : "Subscribe"}
              <ArrowUpRight className="size-4" />
            </Button>
          </form>
        )}

        {status === "error" && (
          <p className="font-mono text-xs text-red-600">{errorMsg}</p>
        )}
      </div>
    </section>
  )
}
