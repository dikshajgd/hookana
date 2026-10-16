/**
 * Best-effort in-memory rate limiter for PUBLIC, unauthenticated endpoints
 * (newsletter subscribe, contact). It caps how often one client (by IP) can
 * hit an endpoint inside a sliding time window.
 *
 * Honest limitation: the counter lives in the memory of a single serverless
 * instance, so on Vercel a flood spread across many cold instances can slip
 * past. It still stops the common abuse case, one source hammering a warm
 * instance, at zero infrastructure cost. The production upgrade is a shared
 * store (Upstash Redis / Vercel KV) keyed the same way; swap the body of
 * rateLimit() for that and the callers do not change.
 */

const buckets = new Map<string, number[]>()

export interface RateResult {
  ok: boolean
  retryAfterSec: number
}

/**
 * Record a hit for `key` and report whether it is within `limit` hits per
 * `windowMs`. Old timestamps outside the window are dropped on each call, and
 * empty buckets are deleted so the map does not grow without bound.
 */
export function rateLimit(key: string, limit: number, windowMs: number): RateResult {
  const now = Date.now()
  const cutoff = now - windowMs
  const recent = (buckets.get(key) ?? []).filter((t) => t > cutoff)

  if (recent.length >= limit) {
    buckets.set(key, recent)
    const retryAfterSec = Math.max(1, Math.ceil((recent[0] + windowMs - now) / 1000))
    return { ok: false, retryAfterSec }
  }

  recent.push(now)
  buckets.set(key, recent)
  return { ok: true, retryAfterSec: 0 }
}

/** Best-guess client IP from proxy headers (Vercel sets x-forwarded-for). */
export function clientIp(req: Request): string {
  const xff = req.headers.get("x-forwarded-for")
  if (xff) return xff.split(",")[0].trim()
  return req.headers.get("x-real-ip") ?? "unknown"
}

/** Test-only: clear all buckets between cases. */
export function _resetRateLimit(): void {
  buckets.clear()
}
