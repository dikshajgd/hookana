import { describe, it, expect } from "vitest"
import {
  sha256Hex,
  classifyPath,
  authOutcome,
  LOGIN_PATH,
} from "./auth"

describe("sha256Hex", () => {
  it("produces the known sha256 hex of a string", async () => {
    // Reference value for "abc".
    expect(await sha256Hex("abc")).toBe(
      "ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad"
    )
  })

  it("is deterministic", async () => {
    expect(await sha256Hex("hookana")).toBe(await sha256Hex("hookana"))
  })
})

describe("classifyPath", () => {
  it("flags the login path", () => {
    expect(classifyPath(LOGIN_PATH).isLoginPath).toBe(true)
  })

  it("treats /admin and its children as a protected page", () => {
    expect(classifyPath("/admin").isProtectedPage).toBe(true)
    expect(classifyPath("/admin/anything").isProtectedPage).toBe(true)
  })

  it("treats /newsletter-admin subtree as protected", () => {
    expect(classifyPath("/newsletter-admin").isProtectedPage).toBe(true)
    expect(classifyPath("/newsletter-admin/campaigns").isProtectedPage).toBe(true)
  })

  it("flags protected API prefixes (upload/portfolio/settings)", () => {
    expect(classifyPath("/api/upload").isProtectedApi).toBe(true)
    expect(classifyPath("/api/portfolio/123").isProtectedApi).toBe(true)
    expect(classifyPath("/api/settings").isProtectedApi).toBe(true)
  })

  it("does not flag public routes", () => {
    const c = classifyPath("/portfolio")
    expect(c.isProtectedPage).toBe(false)
    expect(c.isProtectedApi).toBe(false)
    // A public API like /api/newsletter/subscribe is NOT gated.
    expect(classifyPath("/api/newsletter/subscribe").isProtectedApi).toBe(false)
  })

  it("does not let /adminXYZ masquerade as /admin", () => {
    expect(classifyPath("/administrator").isProtectedPage).toBe(false)
  })
})

describe("authOutcome", () => {
  const HASH = "expected-hash"

  it("always allows the login page", () => {
    expect(authOutcome(LOGIN_PATH, undefined, HASH)).toBe("allow")
  })

  it("allows public routes regardless of cookie", () => {
    expect(authOutcome("/portfolio", undefined, HASH)).toBe("allow")
  })

  it("allows a protected page when the cookie matches", () => {
    expect(authOutcome("/admin", HASH, HASH)).toBe("allow")
  })

  it("redirects a protected page to login when the cookie is missing/wrong", () => {
    expect(authOutcome("/admin", undefined, HASH)).toBe("redirect-login")
    expect(authOutcome("/newsletter-admin", "stale", HASH)).toBe("redirect-login")
  })

  it("returns 401 (unauthorized) for a protected API without a valid cookie", () => {
    expect(authOutcome("/api/upload", undefined, HASH)).toBe("unauthorized")
    expect(authOutcome("/api/portfolio/1", "wrong", HASH)).toBe("unauthorized")
  })

  it("allows a protected API when the cookie matches", () => {
    expect(authOutcome("/api/settings", HASH, HASH)).toBe("allow")
  })
})
