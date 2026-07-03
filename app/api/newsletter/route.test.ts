import { describe, it, expect, vi, beforeEach, afterEach } from "vitest"
import { POST } from "./route"

function post(body: unknown) {
  return POST(
    new Request("http://localhost/api/newsletter", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(body),
    }) as never
  )
}

const original = { ...process.env }

describe("POST /api/newsletter (Beehiiv bridge)", () => {
  beforeEach(() => {
    vi.restoreAllMocks()
    process.env.BEEHIIV_API_KEY = "bk"
    process.env.BEEHIIV_PUBLICATION_ID = "pub_1"
  })
  afterEach(() => {
    process.env = { ...original }
  })

  it("rejects an invalid email with 400", async () => {
    const res = await post({ email: "bad" })
    expect(res.status).toBe(400)
  })

  it("returns 503 when Beehiiv env is not configured", async () => {
    delete process.env.BEEHIIV_API_KEY
    const res = await post({ email: "a@b.com" })
    expect(res.status).toBe(503)
  })

  it("forwards to Beehiiv and returns success on a 2xx", async () => {
    const fetchMock = vi
      .spyOn(globalThis, "fetch")
      .mockResolvedValueOnce(new Response(JSON.stringify({ data: {} }), { status: 201 }))
    const res = await post({ email: "a@b.com" })
    expect(res.status).toBe(200)
    expect(await res.json()).toEqual({ success: true })
    // Sent to the configured publication endpoint with a bearer token.
    const [url, init] = fetchMock.mock.calls[0]
    expect(String(url)).toContain("/publications/pub_1/subscriptions")
    expect((init?.headers as Record<string, string>).Authorization).toBe("Bearer bk")
  })

  it("surfaces a Beehiiv error as 502", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(
      new Response(JSON.stringify({ errors: [{ message: "dupe" }] }), { status: 400 })
    )
    const res = await post({ email: "a@b.com" })
    expect(res.status).toBe(502)
    expect((await res.json()).error).toBe("dupe")
  })
})
