import { NextRequest, NextResponse } from "next/server"
import { Resend } from "resend"
import { rateLimit, clientIp } from "@/lib/rate-limit"

export async function POST(req: NextRequest) {
  // Public endpoint that sends an email on every call: throttle hard per IP so
  // it cannot be used to email-bomb the leads inbox. 3 per 10 minutes.
  const limit = rateLimit(`contact:${clientIp(req)}`, 3, 600_000)
  if (!limit.ok) {
    return NextResponse.json(
      { error: "Too many requests, please slow down." },
      { status: 429, headers: { "Retry-After": String(limit.retryAfterSec) } }
    )
  }

  const { name, email, brand, website, message } = await req.json()

  if (!name || !email) {
    return NextResponse.json({ error: "Name and email are required" }, { status: 400 })
  }

  const to = process.env.LEADS_EMAIL || process.env.CONTACT_EMAIL
  if (!process.env.RESEND_API_KEY || !to) {
    return NextResponse.json({ error: "Server not configured" }, { status: 503 })
  }

  const resend = new Resend(process.env.RESEND_API_KEY)

  const { error } = await resend.emails.send({
    from: "Hookana Contact <onboarding@resend.dev>",
    to,
    replyTo: email,
    subject: `New concept request from ${name}`,
    text: [
      `Name: ${name}`,
      `Email: ${email}`,
      brand ? `Brand: ${brand}` : null,
      website ? `Website: ${website}` : null,
      message ? `\nMessage:\n${message}` : null,
    ]
      .filter(Boolean)
      .join("\n"),
  })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
