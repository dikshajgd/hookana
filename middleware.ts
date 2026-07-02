import { NextRequest, NextResponse } from "next/server"

async function sha256Hex(text: string): Promise<string> {
  const encoder = new TextEncoder()
  const data = encoder.encode(text)
  const hash = await crypto.subtle.digest("SHA-256", data)
  return Array.from(new Uint8Array(hash))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("")
}

// Admin surfaces gated behind the shared newsletter-admin login. The content
// CMS (/admin) and its mutation APIs use the SAME cookie, so one sign-in covers
// both the newsletter dashboard and the portfolio/content editor.
const PROTECTED_PAGES = ["/newsletter-admin", "/admin"]
const PROTECTED_APIS = ["/api/upload", "/api/portfolio", "/api/settings"]
const LOGIN_PATH = "/newsletter-admin/login"

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl

  // The login page itself is always reachable.
  if (pathname === LOGIN_PATH) return NextResponse.next()

  const isProtectedPage = PROTECTED_PAGES.some(
    (p) => pathname === p || pathname.startsWith(`${p}/`)
  )
  const isProtectedApi = PROTECTED_APIS.some(
    (p) => pathname === p || pathname.startsWith(`${p}/`)
  )
  if (!isProtectedPage && !isProtectedApi) return NextResponse.next()

  const authCookie = req.cookies.get("nl_admin_auth")
  const adminPassword = process.env.NEWSLETTER_ADMIN_PASSWORD ?? "hookana_admin_2026"
  const expectedHash = await sha256Hex(adminPassword)

  if (authCookie?.value !== expectedHash) {
    // APIs get a clean 401; pages bounce to the shared login.
    if (isProtectedApi) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
    }
    const url = req.nextUrl.clone()
    url.pathname = LOGIN_PATH
    return NextResponse.redirect(url)
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    "/newsletter-admin/:path*",
    "/admin",
    "/admin/:path*",
    "/api/upload",
    "/api/portfolio/:path*",
    "/api/settings",
  ],
}
