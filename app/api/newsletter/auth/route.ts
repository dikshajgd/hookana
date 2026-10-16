import { NextRequest, NextResponse } from "next/server"
import { createHash } from "crypto"

export async function POST(req: NextRequest) {
  const { password } = await req.json().catch(() => ({}))

  // No baked-in fallback: if the password is not configured, login is disabled
  // rather than accepting a shared default.
  const adminPassword = process.env.NEWSLETTER_ADMIN_PASSWORD
  if (!adminPassword) {
    return NextResponse.json(
      { error: "Admin login is not configured" },
      { status: 503 }
    )
  }

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
