import { describe, it, expect } from "vitest"
import {
  rowToSubscriber,
  rowToCampaign,
  isValidEmail,
  pageRange,
  pageCount,
  emailIlikePattern,
  campaignUpdateToColumns,
  type SubscriberRow,
  type CampaignRow,
} from "./newsletter-transform"

function subRow(o: Partial<SubscriberRow> = {}): SubscriberRow {
  return {
    id: "s1",
    email: "a@b.com",
    name: null,
    status: "active",
    source: null,
    subscribed_at: null,
    ...o,
  }
}

function campRow(o: Partial<CampaignRow> = {}): CampaignRow {
  return {
    id: "c1",
    title: null,
    subject: null,
    html_content: null,
    plain_text: null,
    mode: null,
    prompt: null,
    status: "draft",
    sent_at: null,
    sent_count: null,
    recipient_count: null,
    created_at: "2026-01-01T00:00:00.000Z",
    ...o,
  }
}

describe("rowToSubscriber", () => {
  it("maps snake_case columns to the _id/camelCase shape", () => {
    const s = rowToSubscriber(
      subRow({ id: "abc", email: "x@y.com", name: "X", status: "unsubscribed", source: "website", subscribed_at: "2026-01-02T00:00:00Z" })
    )
    expect(s).toEqual({
      _id: "abc",
      email: "x@y.com",
      name: "X",
      status: "unsubscribed",
      source: "website",
      subscribedAt: "2026-01-02T00:00:00Z",
    })
  })

  it("coerces null name/source/subscribed_at to undefined", () => {
    const s = rowToSubscriber(subRow())
    expect(s.name).toBeUndefined()
    expect(s.source).toBeUndefined()
    expect(s.subscribedAt).toBeUndefined()
  })
})

describe("rowToCampaign", () => {
  it("maps columns and defaults mode to 'manual'", () => {
    const c = rowToCampaign(campRow({ id: "z", subject: "Hi", mode: null }))
    expect(c._id).toBe("z")
    expect(c.subject).toBe("Hi")
    expect(c.mode).toBe("manual")
    expect(c._createdAt).toBe("2026-01-01T00:00:00.000Z")
  })

  it("carries through html/plain/counts when present", () => {
    const c = rowToCampaign(
      campRow({ html_content: "<p>", plain_text: "p", sent_count: 5, recipient_count: 10, mode: "generated", status: "sent", sent_at: "2026-02-01T00:00:00Z" })
    )
    expect(c).toMatchObject({
      htmlContent: "<p>",
      plainText: "p",
      sentCount: 5,
      recipientCount: 10,
      mode: "generated",
      status: "sent",
      sentAt: "2026-02-01T00:00:00Z",
    })
  })

  it("falls back subject to empty string when null", () => {
    expect(rowToCampaign(campRow({ subject: null })).subject).toBe("")
  })
})

describe("isValidEmail", () => {
  it("accepts well-formed addresses", () => {
    expect(isValidEmail("john_doe@example.com")).toBe(true)
    expect(isValidEmail("a.b+c@sub.domain.io")).toBe(true)
  })
  it("rejects malformed / non-strings", () => {
    expect(isValidEmail("nope")).toBe(false)
    expect(isValidEmail("a@b")).toBe(false)
    expect(isValidEmail("a @b.com")).toBe(false)
    expect(isValidEmail(null)).toBe(false)
    expect(isValidEmail(123)).toBe(false)
  })
})

describe("pageRange / pageCount", () => {
  it("computes zero-based inclusive bounds for page 1", () => {
    expect(pageRange(1, 25)).toEqual([0, 24])
  })
  it("computes bounds for later pages", () => {
    expect(pageRange(3, 25)).toEqual([50, 74])
  })
  it("guards non-positive / non-finite pages to page 1", () => {
    expect(pageRange(0, 25)).toEqual([0, 24])
    expect(pageRange(-2, 25)).toEqual([0, 24])
    expect(pageRange(NaN, 25)).toEqual([0, 24])
  })
  it("counts pages with a ceil", () => {
    expect(pageCount(0, 25)).toBe(0)
    expect(pageCount(25, 25)).toBe(1)
    expect(pageCount(26, 25)).toBe(2)
  })
})

describe("emailIlikePattern", () => {
  it("escapes underscore so it matches literally (not as a wildcard)", () => {
    expect(emailIlikePattern("john_doe@x.com")).toBe("john\\_doe@x.com")
  })
  it("escapes percent and backslash", () => {
    expect(emailIlikePattern("a%b@x.com")).toBe("a\\%b@x.com")
    expect(emailIlikePattern("a\\b@x.com")).toBe("a\\\\b@x.com")
  })
  it("leaves ordinary emails untouched", () => {
    expect(emailIlikePattern("plain@x.com")).toBe("plain@x.com")
  })
})

describe("campaignUpdateToColumns", () => {
  it("maps only whitelisted camelCase fields to snake_case columns", () => {
    expect(
      campaignUpdateToColumns({ title: "T", subject: "S", htmlContent: "<h>", plainText: "p", prompt: "pr" })
    ).toEqual({ title: "T", subject: "S", html_content: "<h>", plain_text: "p", prompt: "pr" })
  })

  it("ignores unknown / protected fields (status, counts, id)", () => {
    expect(
      campaignUpdateToColumns({ status: "sent", sentCount: 99, _id: "x", foo: "bar" })
    ).toEqual({})
  })

  it("omits fields that are undefined", () => {
    expect(campaignUpdateToColumns({ title: "only" })).toEqual({ title: "only" })
  })
})
