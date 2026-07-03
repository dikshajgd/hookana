import { describe, it, expect, vi, beforeEach } from "vitest"

const single = vi.fn()
const updateEq = vi.fn()
const deleteEq = vi.fn()
const remove = vi.fn()
const update = vi.fn(() => ({ eq: updateEq }))

vi.mock("@/lib/supabase/server", () => ({
  supabaseAdmin: {
    from: vi.fn(() => ({
      select: () => ({ eq: () => ({ single }) }),
      update,
      delete: () => ({ eq: deleteEq }),
    })),
    storage: { from: () => ({ remove }) },
  },
}))

import { PATCH, DELETE } from "./route"

const params = (id: string) => ({ params: Promise.resolve({ id }) })

function req(body?: unknown) {
  return new Request("http://localhost/api/portfolio/x", {
    method: "PATCH",
    headers: { "content-type": "application/json" },
    body: body === undefined ? undefined : JSON.stringify(body),
  }) as never
}

beforeEach(() => {
  single.mockReset()
  updateEq.mockReset().mockResolvedValue({ error: null })
  deleteEq.mockReset().mockResolvedValue({ error: null })
  remove.mockReset().mockResolvedValue({ error: null })
  update.mockClear()
})

describe("PATCH /api/portfolio/:id", () => {
  it("rejects a body with no valid editable fields (400)", async () => {
    const res = await PATCH(req({ bogus: 1, id: "hack" }), params("1"))
    expect(res.status).toBe(400)
    expect(update).not.toHaveBeenCalled()
  })

  it("updates only whitelisted fields (title/category/display_order)", async () => {
    const res = await PATCH(req({ title: "New", display_order: 3, category: "video" }), params("42"))
    expect(res.status).toBe(200)
    expect(update).toHaveBeenCalledWith({ title: "New", category: "video", display_order: 3 })
  })

  it("ignores wrong-typed fields", async () => {
    const res = await PATCH(req({ title: 123, display_order: "3" }), params("1"))
    // title (number) and display_order (string) are both rejected -> no valid fields
    expect(res.status).toBe(400)
  })

  it("returns 500 when the update errors", async () => {
    updateEq.mockResolvedValueOnce({ error: { message: "db" } })
    const res = await PATCH(req({ title: "x" }), params("1"))
    expect(res.status).toBe(500)
  })
})

describe("DELETE /api/portfolio/:id", () => {
  it("returns 404 when the row doesn't exist", async () => {
    single.mockResolvedValueOnce({ data: null, error: { message: "not found" } })
    const res = await DELETE(req(), params("missing"))
    expect(res.status).toBe(404)
  })

  it("deletes the row and best-effort removes its storage objects", async () => {
    single.mockResolvedValueOnce({
      data: {
        original_url: "http://localhost:54321/storage/v1/object/public/portfolio-media/originals/a.mp4",
        poster_url: "http://localhost:54321/storage/v1/object/public/portfolio-media/posters/a.webp",
        preview_url: null,
        full_url: "http://localhost:54321/storage/v1/object/public/portfolio-media/originals/a.mp4",
      },
      error: null,
    })
    const res = await DELETE(req(), params("1"))
    expect(res.status).toBe(200)
    expect(await res.json()).toEqual({ success: true })
    // Only the two distinct resolvable paths get removed (preview is null).
    const removed = remove.mock.calls[0][0] as string[]
    expect(removed).toContain("originals/a.mp4")
    expect(removed).toContain("posters/a.webp")
  })

  it("returns 500 when the delete errors", async () => {
    single.mockResolvedValueOnce({ data: { original_url: null, poster_url: null, preview_url: null, full_url: null }, error: null })
    deleteEq.mockResolvedValueOnce({ error: { message: "boom" } })
    const res = await DELETE(req(), params("1"))
    expect(res.status).toBe(500)
  })
})
