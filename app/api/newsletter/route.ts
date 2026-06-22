import { NextRequest, NextResponse } from "next/server"

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export async function POST(req: NextRequest) {
  const data = await req.json().catch(() => null)
  const email = typeof data?.email === "string" ? data.email.trim() : ""

  if (!email || !EMAIL_RE.test(email)) {
    return NextResponse.json({ error: "A valid email is required" }, { status: 400 })
  }

  const apiKey = process.env.BEEHIIV_API_KEY
  const publicationId = process.env.BEEHIIV_PUBLICATION_ID
  if (!apiKey || !publicationId) {
    return NextResponse.json({ error: "Server not configured" }, { status: 503 })
  }

  try {
    const res = await fetch(
      `https://api.beehiiv.com/v2/publications/${publicationId}/subscriptions`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          reactivate_existing: false,
          send_welcome_email: true,
          utm_source: "landing_page",
          utm_medium: "newsletter_section",
        }),
      }
    )

    if (!res.ok) {
      const body = await res.json().catch(() => ({}))
      const message =
        body?.errors?.[0]?.message || body?.message || "Subscription failed"
      return NextResponse.json({ error: message }, { status: 502 })
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Network error" },
      { status: 500 }
    )
  }
}
