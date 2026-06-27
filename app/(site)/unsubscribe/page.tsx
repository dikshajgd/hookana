"use client"

import { useState, useEffect, type FormEvent } from "react"

export default function UnsubscribePage() {
  const [email, setEmail] = useState("")
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle")
  const [message, setMessage] = useState("")

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const e = params.get("email")
    if (e) setEmail(e)
  }, [])

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setStatus("submitting")

    const res = await fetch("/api/newsletter/unsubscribe", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    })
    const json = await res.json()

    if (res.ok) {
      setStatus("success")
      setMessage("You've been unsubscribed from the Hookana newsletter.")
    } else {
      setStatus("error")
      setMessage(json.error ?? "Something went wrong. Please try again.")
    }
  }

  return (
    <div className="min-h-screen bg-[#0A1628] flex items-center justify-center p-4">
      <div className="w-full max-w-sm text-center">
        <span className="font-mono text-white text-xl font-bold tracking-widest">HOOKANA</span>

        <div className="mt-10 bg-white/5 rounded-xl p-8 border border-white/10 text-left">
          {status === "success" ? (
            <div className="text-center py-4">
              <div className="text-4xl mb-4">👋</div>
              <p className="text-white font-semibold mb-2">Unsubscribed</p>
              <p className="text-white/60 text-sm">{message}</p>
              <a
                href="/"
                className="inline-block mt-6 text-xs font-mono text-blue-300 hover:text-blue-200 underline"
              >
                Return to hookana.com
              </a>
            </div>
          ) : (
            <>
              <h1 className="text-white font-bold mb-2">Unsubscribe</h1>
              <p className="text-white/50 text-sm mb-6">
                Enter your email to unsubscribe from the Hookana newsletter.
              </p>

              <form onSubmit={handleSubmit} className="space-y-4">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white placeholder:text-white/30 outline-none focus:border-blue-400"
                />

                {status === "error" && (
                  <p className="text-red-400 text-xs font-mono">{message}</p>
                )}

                <button
                  type="submit"
                  disabled={status === "submitting"}
                  className="w-full bg-white/10 border border-white/20 text-white font-medium py-3 rounded-lg text-sm hover:bg-white/15 disabled:opacity-50 transition-colors"
                >
                  {status === "submitting" ? "Unsubscribing..." : "Unsubscribe"}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
