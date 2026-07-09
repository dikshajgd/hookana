import { NextRequest, NextResponse } from "next/server"
import { unsubscribeByEmail } from "@/lib/newsletter-db"

export async function POST(req: NextRequest) {
  const { email } = await req.json().catch(() => ({}))

  if (!email || typeof email !== "string") {
    return NextResponse.json({ error: "Email is required" }, { status: 400 })
  }

  const found = await unsubscribeByEmail(email.trim())
  if (!found) {
    return NextResponse.json({ error: "Email not found" }, { status: 404 })
  }

  return NextResponse.json({ success: true })
}
