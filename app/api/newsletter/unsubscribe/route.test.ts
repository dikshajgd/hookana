import { describe, it, expect, vi, beforeEach } from "vitest"

vi.mock("@/lib/newsletter-db", () => ({
  unsubscribeByEmail: vi.fn(),
}))

import { unsubscribeByEmail } from "@/lib/newsletter-db"
import { POST } from "./route"

const mockUnsub = vi.mocked(unsubscribeByEmail)

function post(body: unknown) {
  return POST(
    new Request("http://localhost/api/newsletter/unsubscribe", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(body),
    }) as never
  )
}

beforeEach(() => mockUnsub.mockReset())

describe("POST /api/newsletter/unsubscribe", () => {
  it("requires an email (400)", async () => {
    const res = await post({})
    expect(res.status).toBe(400)
    expect(mockUnsub).not.toHaveBeenCalled()
  })

  it("returns 404 when the email is not found", async () => {
    mockUnsub.mockResolvedValueOnce(false)
    const res = await post({ email: "ghost@x.com" })
    expect(res.status).toBe(404)
  })

  it("unsubscribes an existing email (trimmed) and returns success", async () => {
    mockUnsub.mockResolvedValueOnce(true)
    const res = await post({ email: "  a@b.com  " })
    expect(res.status).toBe(200)
    expect(await res.json()).toEqual({ success: true })
    expect(mockUnsub).toHaveBeenCalledWith("a@b.com")
  })
})
