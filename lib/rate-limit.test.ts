import { describe, it, expect, beforeEach } from "vitest"
import { rateLimit, clientIp, _resetRateLimit } from "./rate-limit"

describe("rateLimit", () => {
  beforeEach(() => _resetRateLimit())

  it("allows hits up to the limit, then blocks", () => {
    for (let i = 0; i < 3; i++) {
      expect(rateLimit("k", 3, 60_000).ok).toBe(true)
    }
    const blocked = rateLimit("k", 3, 60_000)
    expect(blocked.ok).toBe(false)
    expect(blocked.retryAfterSec).toBeGreaterThan(0)
  })

  it("keeps separate counts per key", () => {
    expect(rateLimit("a", 1, 60_000).ok).toBe(true)
    expect(rateLimit("a", 1, 60_000).ok).toBe(false)
    // A different key is unaffected.
    expect(rateLimit("b", 1, 60_000).ok).toBe(true)
  })

  it("lets hits through again once the window has passed", () => {
    expect(rateLimit("w", 1, 10).ok).toBe(true)
    expect(rateLimit("w", 1, 10).ok).toBe(false)
    const start = Date.now()
    while (Date.now() - start < 15) { /* spin past the 10ms window */ }
    expect(rateLimit("w", 1, 10).ok).toBe(true)
  })
})

describe("clientIp", () => {
  it("takes the first address from x-forwarded-for", () => {
    const req = new Request("http://x", {
      headers: { "x-forwarded-for": "1.2.3.4, 5.6.7.8" },
    })
    expect(clientIp(req)).toBe("1.2.3.4")
  })

  it("falls back to 'unknown' with no proxy headers", () => {
    expect(clientIp(new Request("http://x"))).toBe("unknown")
  })
})
