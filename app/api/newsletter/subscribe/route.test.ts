import { describe, it, expect, vi, beforeEach } from "vitest"

vi.mock("@/lib/newsletter-db", () => ({
  addSubscriber: vi.fn(),
}))

import { addSubscriber } from "@/lib/newsletter-db"
import { POST } from "./route"

const mockAdd = vi.mocked(addSubscriber)

function post(body: unknown) {
  return POST(
    new Request("http://localhost/api/newsletter/subscribe", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(body),
    }) as never
  )
}

beforeEach(() => mockAdd.mockReset())

describe("POST /api/newsletter/subscribe", () => {
  it("rejects a missing/invalid email with 400 and never touches the db", async () => {
    const res = await post({ email: "not-an-email" })
    expect(res.status).toBe(400)
    expect(mockAdd).not.toHaveBeenCalled()
  })

  it("subscribes a valid email with source 'website'", async () => {
    mockAdd.mockResolvedValueOnce({ _id: "1", email: "a@b.com", status: "active" })
    const res = await post({ email: "a@b.com", name: "A" })
    expect(res.status).toBe(200)
    expect(await res.json()).toEqual({ success: true })
    expect(mockAdd).toHaveBeenCalledWith("a@b.com", "A", "website")
  })

  it("maps an 'already subscribed' error to 409", async () => {
    mockAdd.mockRejectedValueOnce(new Error("Email already subscribed"))
    const res = await post({ email: "a@b.com" })
    expect(res.status).toBe(409)
  })

  it("maps an unexpected error to 500", async () => {
    mockAdd.mockRejectedValueOnce(new Error("db down"))
    const res = await post({ email: "a@b.com" })
    expect(res.status).toBe(500)
  })
})
