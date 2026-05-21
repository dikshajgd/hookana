import { NextRequest, NextResponse } from "next/server"

export async function POST(req: NextRequest) {
  const data = await req.json()

  if (!data?.name || !data?.email) {
    return NextResponse.json({ error: "Name and email are required" }, { status: 400 })
  }

  const url = process.env.APPS_SCRIPT_URL
  if (!url) {
    return NextResponse.json({ error: "Server not configured" }, { status: 503 })
  }

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...data,
        targetEmail: process.env.LEAD_TARGET_EMAIL,
        submittedAt: new Date().toISOString(),
      }),
      redirect: "follow",
    })

    if (!res.ok) {
      const text = await res.text().catch(() => "")
      return NextResponse.json(
        { error: text || "Apps Script returned an error" },
        { status: 502 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Network error" },
      { status: 500 }
    )
  }
}
