import { NextRequest, NextResponse } from "next/server"
import { addSubscriber } from "@/lib/newsletter-db"

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export async function POST(req: NextRequest) {
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
