import { describe, it, expect, beforeEach, vi } from "vitest"

// A tiny chainable + awaitable stand-in for the supabase-js query builder.
// Each `from()` call consumes the next queued result; all chain methods return
// the same builder, and awaiting it (or calling single/maybeSingle) resolves to
// that result.
const { queue, supabaseMock } = vi.hoisted(() => {
  const queue: any[] = []
  function builderFor(result: any) {
    const b: any = {}
    for (const m of ["select", "order", "range", "eq", "ilike", "gte", "limit", "insert", "update", "delete"]) {
      b[m] = () => b
    }
    b.single = () => Promise.resolve(result)
    b.maybeSingle = () => Promise.resolve(result)
    b.then = (res: any, rej: any) => Promise.resolve(result).then(res, rej)
    return b
  }
  return {
    queue,
    supabaseMock: {
      from: () => builderFor(queue.length ? queue.shift() : { data: null, error: null, count: 0 }),
    },
  }
})

vi.mock("@/lib/supabase/server", () => ({ supabaseAdmin: supabaseMock }))

import {
  addSubscriber,
  bulkAddSubscribers,
  unsubscribeByEmail,
  getSubscribers,
  getDailyStats,
} from "./newsletter-db"

beforeEach(() => {
  queue.length = 0
})

describe("addSubscriber", () => {
  it("returns the mapped subscriber on success", async () => {
    queue.push({
      data: { id: "s1", email: "a@b.com", name: "A", status: "active", source: "manual", subscribed_at: "2026-01-01T00:00:00Z" },
      error: null,
    })
    const s = await addSubscriber("a@b.com", "A")
    expect(s).toMatchObject({ _id: "s1", email: "a@b.com", name: "A", status: "active" })
  })

  it("translates a unique-violation (23505) into 'Email already subscribed'", async () => {
    queue.push({ data: null, error: { code: "23505", message: "dupe" } })
    await expect(addSubscriber("a@b.com")).rejects.toThrow("Email already subscribed")
  })

  it("propagates other DB errors", async () => {
    queue.push({ data: null, error: { code: "500", message: "boom" } })
    await expect(addSubscriber("a@b.com")).rejects.toThrow("boom")
  })
})

describe("bulkAddSubscribers", () => {
  it("counts invalid, skipped (already present), and added", async () => {
    // 1st from(): existing-emails query.
    queue.push({ data: [{ email: "Existing@X.com" }], error: null })
    // valid new inserts each consume a from() -> success.
    queue.push({ error: null }) // for new1@x.com
    queue.push({ error: null }) // for new2@x.com

    const res = await bulkAddSubscribers([
      { email: "not-an-email" }, // invalid
      { email: "existing@x.com" }, // skipped (case-insensitive dup)
      { email: "new1@x.com" },
      { email: "new2@x.com" },
    ])

    expect(res).toEqual({ added: 2, skipped: 1, invalid: ["not-an-email"] })
  })

  it("dedupes within the same batch", async () => {
    queue.push({ data: [], error: null }) // no existing
    queue.push({ error: null }) // first insert of dup@x.com
    const res = await bulkAddSubscribers([{ email: "dup@x.com" }, { email: "dup@x.com" }])
    expect(res.added).toBe(1)
    expect(res.skipped).toBe(1)
  })
})

describe("unsubscribeByEmail", () => {
  it("matches case-insensitively and exactly, then flips status", async () => {
    // select by ilike returns a superset; the code picks the exact match.
    queue.push({ data: [{ id: "x1", email: "John@Example.com" }], error: null })
    queue.push({ error: null }) // the update
    expect(await unsubscribeByEmail("john@example.com")).toBe(true)
  })

  it("returns false when no subscriber matches", async () => {
    queue.push({ data: [], error: null })
    expect(await unsubscribeByEmail("ghost@x.com")).toBe(false)
  })

  it("does not treat an underscore wildcard as a match", async () => {
    // ilike escaping means the DB wouldn't return these, but even if a broad
    // result comes back, the exact JS filter rejects a non-equal address.
    queue.push({ data: [{ id: "x1", email: "johnXdoe@x.com" }], error: null })
    expect(await unsubscribeByEmail("john_doe@x.com")).toBe(false)
  })
})

describe("getSubscribers", () => {
  it("maps rows and computes pagination", async () => {
    queue.push({
      data: [{ id: "1", email: "a@b.com", name: null, status: "active", source: null, subscribed_at: null }],
      count: 30,
      error: null,
    })
    const res = await getSubscribers(1)
    expect(res.total).toBe(30)
    expect(res.pages).toBe(2) // ceil(30/25)
    expect(res.subscribers[0]).toMatchObject({ _id: "1", email: "a@b.com" })
  })

  it("returns an empty page on error rather than throwing", async () => {
    queue.push({ data: null, count: null, error: { message: "down" } })
    const res = await getSubscribers(1)
    expect(res).toEqual({ subscribers: [], total: 0, pages: 0, page: 1 })
  })
})

describe("getDailyStats", () => {
  it("sums sent_count of today's sent campaigns against the limit", async () => {
    // DAILY_LIMIT is read at import time; defaults to 1000 with no env set.
    queue.push({ data: [{ sent_count: 100 }, { sent_count: 250 }], error: null })
    const stats = await getDailyStats()
    expect(stats.used).toBe(350)
    expect(stats.remaining).toBe(650)
    expect(stats.limit).toBe(1000)
  })
})
