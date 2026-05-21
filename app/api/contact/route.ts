import { NextRequest, NextResponse } from "next/server"
import { Resend } from "resend"

export async function POST(req: NextRequest) {
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
