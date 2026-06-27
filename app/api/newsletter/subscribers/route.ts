import { NextRequest, NextResponse } from "next/server"
import {
  getSubscribers,
  addSubscriber,
  bulkAddSubscribers,
} from "@/lib/newsletter-db"

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const page = Number(searchParams.get("page") ?? "1")
  const status = searchParams.get("status") ?? undefined
  const data = await getSubscribers(page, status)
  return NextResponse.json(data)
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}))

  // Bulk add: array of { email, name? } objects
  if (Array.isArray(body?.bulk)) {
    const results = await bulkAddSubscribers(body.bulk, body.source ?? "bulk_import")
    return NextResponse.json(results)
  }

  // Comma-separated emails
  if (typeof body?.emails === "string") {
    const list = body.emails
      .split(",")
      .map((e: string) => e.trim())
      .filter(Boolean)
      .map((email: string) => ({ email }))
    const results = await bulkAddSubscribers(list, "manual_bulk")
    return NextResponse.json(results)
  }

  // Single add
  const email = typeof body?.email === "string" ? body.email.trim() : ""
  if (!email || !EMAIL_RE.test(email)) {
    return NextResponse.json({ error: "Valid email required" }, { status: 400 })
  }

  try {
    const subscriber = await addSubscriber(
      email,
      body.name ?? undefined,
      "manual"
    )
    return NextResponse.json({ subscriber })
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Failed to add subscriber"
    return NextResponse.json({ error: msg }, { status: 409 })
  }
}
