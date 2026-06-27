import { NextRequest, NextResponse } from "next/server"
import { createHash } from "crypto"

export async function POST(req: NextRequest) {
  const { password } = await req.json().catch(() => ({}))

  const adminPassword =
    process.env.NEWSLETTER_ADMIN_PASSWORD ?? "hookana_admin_2026"

  if (!password || password !== adminPassword) {
    return NextResponse.json({ error: "Invalid password" }, { status: 401 })
  }

  const hash = createHash("sha256").update(adminPassword).digest("hex")

  const res = NextResponse.json({ success: true })
  res.cookies.set("nl_admin_auth", hash, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 7,
    path: "/",
  })

  return res
}

export async function DELETE() {
  const res = NextResponse.json({ success: true })
  res.cookies.delete("nl_admin_auth")
  return res
}
