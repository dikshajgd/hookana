import { describe, it, expect, beforeEach, afterEach } from "vitest"
import { createHash } from "crypto"
import { POST, DELETE } from "./route"

function post(body: unknown) {
  return POST(
    new Request("http://localhost/api/newsletter/auth", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(body),
    }) as never
  )
}

const PASSWORD = "test_admin_password" // set in vitest.setup.ts

describe("POST /api/newsletter/auth", () => {
  const original = { ...process.env }
  beforeEach(() => {
    process.env.NEWSLETTER_ADMIN_PASSWORD = PASSWORD
  })
  afterEach(() => {
    process.env = { ...original }
  })

  it("rejects a wrong password with 401 and no cookie", async () => {
    const res = await post({ password: "nope" })
    expect(res.status).toBe(401)
    expect(res.headers.get("set-cookie")).toBeNull()
  })

  it("rejects a missing password with 401", async () => {
    const res = await post({})
    expect(res.status).toBe(401)
  })

  it("accepts the correct password and sets the sha256 auth cookie", async () => {
    const res = await post({ password: PASSWORD })
    expect(res.status).toBe(200)
    const cookie = res.headers.get("set-cookie") ?? ""
    const expectedHash = createHash("sha256").update(PASSWORD).digest("hex")
    expect(cookie).toContain(`nl_admin_auth=${expectedHash}`)
    expect(cookie.toLowerCase()).toContain("httponly")
  })
})

describe("DELETE /api/newsletter/auth", () => {
  it("clears the auth cookie", async () => {
    const res = await DELETE()
    expect(res.status).toBe(200)
    const cookie = res.headers.get("set-cookie") ?? ""
    expect(cookie).toContain("nl_admin_auth=")
  })
})
