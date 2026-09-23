"use client"

import { useEffect, useState, useSyncExternalStore } from "react"
import Link from "next/link"
import { GoogleAnalytics } from "@next/third-parties/google"

const KEY = "hookana-analytics-consent" // "granted" | "denied"
const OPEN_EVENT = "hookana:open-cookie-settings"
const CHANGE_EVENT = "hookana:consent-changed"

function subscribe(onChange: () => void) {
  window.addEventListener(CHANGE_EVENT, onChange)
  window.addEventListener("storage", onChange) // other tabs
  return () => {
    window.removeEventListener(CHANGE_EVENT, onChange)
    window.removeEventListener("storage", onChange)
  }
}

type Choice = "granted" | "denied" | null

/** Remove Google Analytics cookies (used when someone withdraws consent). */
function clearGaCookies() {
  const host = window.location.hostname
  const domains = ["", host, `.${host}`, `.${host.replace(/^www\./, "")}`]
  for (const c of document.cookie.split(";")) {
    const name = c.split("=")[0].trim()
    if (!name.startsWith("_ga")) continue
    for (const d of domains) {
      document.cookie = `${name}=; Max-Age=0; path=/${d ? `; domain=${d}` : ""}`
    }
  }
}

/**
 * Cookie banner + consent-gated Google Analytics. GA is only rendered after the
 * visitor clicks Allow; nothing is loaded before that. The choice is stored in
 * localStorage so the banner doesn't come back on every page.
 */
export function AnalyticsConsent({ gaId }: { gaId: string }) {
  // Read the saved choice straight from localStorage. On the server there is
  // no choice yet ("unknown"), so nothing renders until the browser takes over.
  const choice = useSyncExternalStore<Choice | "unknown">(
    subscribe,
    () => window.localStorage.getItem(KEY) as Choice,
    () => "unknown"
  )
  const [reopened, setReopened] = useState(false)
  const open = choice === null || reopened

  useEffect(() => {
    const reopen = () => setReopened(true)
    window.addEventListener(OPEN_EVENT, reopen)
    return () => window.removeEventListener(OPEN_EVENT, reopen)
  }, [])

  const decide = (next: "granted" | "denied") => {
    const wasGranted = choice === "granted"
    window.localStorage.setItem(KEY, next)
    window.dispatchEvent(new Event(CHANGE_EVENT))
    setReopened(false)
    if (next === "denied" && wasGranted) {
      // GA's script is already running on this page; clear its cookies and
      // reload so it's gone for the rest of the visit.
      clearGaCookies()
      window.location.reload()
    }
  }

  return (
    <>
      {choice === "granted" && <GoogleAnalytics gaId={gaId} />}
      {open && (
        <div
          role="region"
          aria-label="Cookie choice"
          className="fixed inset-x-4 bottom-4 z-[60] mx-auto flex max-w-2xl flex-col gap-4 rounded-md border border-ash bg-paper-white p-5 text-sm text-ink shadow-lg sm:flex-row sm:items-center"
        >
          <p className="flex-1 leading-relaxed">
            Can we use analytics cookies to see how the site is used? The site works fine either
            way.{" "}
            <Link href="/privacy#cookies" className="underline underline-offset-4">
              Learn more
            </Link>
          </p>
          <div className="flex shrink-0 gap-2">
            <button
              type="button"
              onClick={() => decide("denied")}
              className="rounded-none border border-ink px-4 py-2 font-mono text-xs uppercase hover:bg-ink/5 focus-visible:ring-2 focus-visible:ring-ink focus-visible:outline-none"
            >
              No thanks
            </button>
            <button
              type="button"
              onClick={() => decide("granted")}
              className="rounded-none border border-ink bg-ink px-4 py-2 font-mono text-xs text-paper-white uppercase hover:bg-ink/90 focus-visible:ring-2 focus-visible:ring-ink focus-visible:ring-offset-2 focus-visible:outline-none"
            >
              Allow
            </button>
          </div>
        </div>
      )}
    </>
  )
}

/** A link-styled button that reopens the cookie banner. */
export function CookieSettingsLink({ className }: { className?: string }) {
  return (
    <button
      type="button"
      onClick={() => window.dispatchEvent(new Event(OPEN_EVENT))}
      className={className ?? "underline underline-offset-4"}
    >
      cookie settings
    </button>
  )
}
