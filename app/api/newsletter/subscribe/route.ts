import { NextRequest, NextResponse } from "next/server"
import { addSubscriber } from "@/lib/newsletter-db"
import { rateLimit, clientIp } from "@/lib/rate-limit"

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export async function POST(req: NextRequest) {
  // Public endpoint: throttle per IP so it cannot be looped to flood the
  // subscriber table. 5 attempts per minute is plenty for a real signup.
  const limit = rateLimit(`subscribe:${clientIp(req)}`, 5, 60_000)
  if (!limit.ok) {
    return NextResponse.json(
      { error: "Too many requests, please slow down." },
      { status: 429, headers: { "Retry-After": String(limit.retryAfterSec) } }
    )
  }

  const body = await req.json().catch(() => ({}))
  const email = typeof body?.email === "string" ? body.email.trim() : ""
  const name = typeof body?.name === "string" ? body.name.trim() : undefined

  if (!email || !EMAIL_RE.test(email)) {
    return NextResponse.json({ error: "A valid email is required" }, { status: 400 })
  }

  try {
    await addSubscriber(email, name, "website")
    return NextResponse.json({ success: true })
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Subscription failed"
    if (msg.includes("already subscribed")) {
      return NextResponse.json(
        { error: "You're already subscribed!" },
        { status: 409 }
      )
    }
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
