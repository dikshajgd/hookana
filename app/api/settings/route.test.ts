import { describe, it, expect, vi, beforeEach } from "vitest"

const upsert = vi.fn()

vi.mock("@/lib/supabase/server", () => ({
  supabaseAdmin: {
    from: vi.fn(() => ({ upsert })),
  },
}))

import { PATCH } from "./route"

function patch(bodyRaw: string) {
  return PATCH(
    new Request("http://localhost/api/settings", {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: bodyRaw,
    }) as never
  )
}

beforeEach(() => {
  upsert.mockReset()
  upsert.mockResolvedValue({ error: null })
})

describe("PATCH /api/settings", () => {
  it("rejects invalid JSON with 400", async () => {
    const res = await patch("{not json")
    expect(res.status).toBe(400)
    expect(upsert).not.toHaveBeenCalled()
  })

  it("requires a string key", async () => {
    const res = await patch(JSON.stringify({ value: { a: 1 } }))
    expect(res.status).toBe(400)
  })

  it("requires value to be an object (rejects null / primitives)", async () => {
    expect((await patch(JSON.stringify({ key: "hero", value: null }))).status).toBe(400)
    expect((await patch(JSON.stringify({ key: "hero", value: "str" }))).status).toBe(400)
    expect(upsert).not.toHaveBeenCalled()
  })

  it("upserts a valid section keyed on 'key' and returns success", async () => {
    const res = await patch(JSON.stringify({ key: "hero", value: { headline: "Hi" } }))
    expect(res.status).toBe(200)
    expect(await res.json()).toEqual({ success: true })
    const [row, opts] = upsert.mock.calls[0]
    expect(row).toMatchObject({ key: "hero", value: { headline: "Hi" } })
    expect(row.updated_at).toBeTypeOf("string")
    expect(opts).toEqual({ onConflict: "key" })
  })

  it("returns 500 when the upsert errors", async () => {
    upsert.mockResolvedValueOnce({ error: { message: "boom" } })
    const res = await patch(JSON.stringify({ key: "hero", value: {} }))
    expect(res.status).toBe(500)
  })
})
