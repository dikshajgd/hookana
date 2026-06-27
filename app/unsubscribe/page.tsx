"use client"

import { useState, useEffect, type FormEvent } from "react"
import { Inter } from "next/font/google"

const inter = Inter({ subsets: ["latin"] })

export default function UnsubscribePage() {
  const [email, setEmail] = useState("")
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error" | "resubscribed">("idle")
  const [errorMsg, setErrorMsg] = useState("")

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const e = params.get("email")
    if (e) setEmail(e)
  }, [])

  const handleUnsubscribe = async (e: FormEvent) => {
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
    } else {
      setStatus("error")
      setErrorMsg(json.error ?? "Something went wrong. Please try again.")
    }
  }

  const handleResubscribe = async () => {
    const res = await fetch("/api/newsletter/subscribe", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    })
    if (res.ok) setStatus("resubscribed")
  }

  return (
    <div className={`${inter.className} min-h-screen bg-gray-50 flex flex-col`}>
      {/* Header */}
      <header className="py-6 px-8 border-b border-gray-200 bg-white">
        <a href="/" className="inline-flex items-center gap-2">
          <span className="text-[#0A1628] font-black text-lg tracking-[0.2em] uppercase">
            Hookana
          </span>
        </a>
      </header>

      {/* Content */}
      <div className="flex-1 flex items-center justify-center px-4 py-16">
        <div className="w-full max-w-md">

          {status === "success" ? (
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-6">
                <svg className="w-7 h-7 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 9v.906a2.25 2.25 0 01-1.183 1.981l-6.478 3.488M2.25 9v.906a2.25 2.25 0 001.183 1.981l6.478 3.488m8.839 2.51l-4.66-2.51m0 0l-1.023-.55a2.25 2.25 0 00-2.134 0l-1.022.55m0 0l-4.661 2.51m16.5 1.615a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V8.844a2.25 2.25 0 011.183-1.98l7.5-4.04a2.25 2.25 0 012.134 0l7.5 4.04a2.25 2.25 0 011.183 1.98V19.5z" />
                </svg>
              </div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">You've been unsubscribed</h1>
              <p className="text-gray-500 text-sm mb-1">
                <span className="font-medium text-gray-700">{email}</span> has been removed from the Hookana newsletter.
              </p>
              <p className="text-gray-400 text-sm mb-8">You won't receive any more emails from us.</p>

              <div className="bg-white border border-gray-200 rounded-xl p-5 text-left mb-6">
                <p className="text-sm text-gray-500 mb-3">Unsubscribed by mistake?</p>
                <button
                  onClick={handleResubscribe}
                  className="text-sm font-medium text-[#0A1628] underline underline-offset-2 hover:opacity-70 transition-opacity"
                >
                  Resubscribe to the newsletter
                </button>
              </div>

              <a href="/" className="text-xs text-gray-400 hover:text-gray-600 transition-colors">
                Return to hookana.com →
              </a>
            </div>
          ) : status === "resubscribed" ? (
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-[#0A1628] flex items-center justify-center mx-auto mb-6">
                <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                </svg>
              </div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">You're back!</h1>
              <p className="text-gray-500 text-sm mb-8">
                <span className="font-medium text-gray-700">{email}</span> has been resubscribed to the Hookana newsletter.
              </p>
              <a href="/" className="text-xs text-gray-400 hover:text-gray-600 transition-colors">
                Return to hookana.com →
              </a>
            </div>
          ) : (
            <>
              <div className="text-center mb-10">
                <h1 className="text-2xl font-bold text-gray-900 mb-3">Unsubscribe</h1>
                <p className="text-gray-500 text-sm leading-relaxed">
                  We're sorry to see you go. Confirm your email below and you won't hear from us again.
                </p>
              </div>

              <div className="bg-white border border-gray-200 rounded-2xl p-8 shadow-sm">
                <form onSubmit={handleUnsubscribe} className="space-y-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">
                      Email address
                    </label>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="your@email.com"
                      className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm text-gray-900 placeholder:text-gray-300 outline-none focus:ring-2 focus:ring-[#0A1628]/20 focus:border-[#0A1628] transition-all"
                    />
                  </div>

                  {status === "error" && (
                    <p className="text-red-500 text-xs">{errorMsg}</p>
                  )}

                  <button
                    type="submit"
                    disabled={status === "submitting"}
                    className="w-full bg-[#0A1628] text-white font-medium py-3 rounded-lg text-sm hover:bg-[#0A1628]/90 disabled:opacity-50 transition-colors"
                  >
                    {status === "submitting" ? "Unsubscribing…" : "Confirm unsubscribe"}
                  </button>
                </form>
              </div>

              <p className="text-center text-xs text-gray-400 mt-6">
                Changed your mind?{" "}
                <a href="/" className="text-gray-500 underline underline-offset-2 hover:text-gray-700">
                  Return to hookana.com
                </a>
              </p>
            </>
          )}
        </div>
      </div>

      {/* Footer */}
      <footer className="py-6 px-8 border-t border-gray-200 text-center">
        <p className="text-xs text-gray-400">
          © {new Date().getFullYear()} Hookana. All rights reserved.
        </p>
      </footer>
    </div>
  )
}
