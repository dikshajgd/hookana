import { NextRequest, NextResponse } from "next/server"

async function sha256Hex(text: string): Promise<string> {
  const encoder = new TextEncoder()
  const data = encoder.encode(text)
  const hash = await crypto.subtle.digest("SHA-256", data)
  return Array.from(new Uint8Array(hash))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("")
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl

  if (!pathname.startsWith("/newsletter-admin")) {
    return NextResponse.next()
  }

  // Login page is always accessible
  if (pathname === "/newsletter-admin/login") {
    return NextResponse.next()
  }

  const authCookie = req.cookies.get("nl_admin_auth")
  const adminPassword =
    process.env.NEWSLETTER_ADMIN_PASSWORD ?? "hookana_admin_2026"
  const expectedHash = await sha256Hex(adminPassword)

  if (authCookie?.value !== expectedHash) {
    const url = req.nextUrl.clone()
    url.pathname = "/newsletter-admin/login"
    return NextResponse.redirect(url)
  }

  return NextResponse.next()
}

export const config = {
  matcher: "/newsletter-admin/:path*",
}
