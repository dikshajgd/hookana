import { describe, it, expect, beforeEach, afterEach, vi } from "vitest"

describe("mailer", () => {
  const original = { ...process.env }

  beforeEach(() => {
    vi.resetModules()
    delete process.env.RESEND_API_KEY
    delete process.env.NEWSLETTER_FROM
  })
  afterEach(() => {
    process.env = { ...original }
  })

  it("getResend throws a clear error when RESEND_API_KEY is missing", async () => {
    const { getResend } = await import("./mailer")
    expect(() => getResend()).toThrow(/RESEND_API_KEY/)
  })

  it("getResend returns a client when the key is set", async () => {
    process.env.RESEND_API_KEY = "re_test_key"
    const { getResend } = await import("./mailer")
    expect(getResend()).toBeTruthy()
  })

  it("FROM_ADDRESS falls back to the default when NEWSLETTER_FROM is unset", async () => {
    const { FROM_ADDRESS } = await import("./mailer")
    expect(FROM_ADDRESS).toBe("Hookana <newsletter@hookana.com>")
  })

  it("FROM_ADDRESS honors NEWSLETTER_FROM when set", async () => {
    process.env.NEWSLETTER_FROM = "Custom <hi@example.com>"
    const { FROM_ADDRESS } = await import("./mailer")
    expect(FROM_ADDRESS).toBe("Custom <hi@example.com>")
  })
})
