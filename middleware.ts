import { NextRequest, NextResponse } from "next/server"
import { AUTH_COOKIE, LOGIN_PATH, DEFAULT_ADMIN_PASSWORD, authOutcome, sha256Hex } from "@/lib/auth"

// The whole admin lives under /admin behind one login. The pages and their
// mutation APIs share the SAME cookie, so one sign-in covers the site editor,
// portfolio, newsletter and leads. All the path-matching + decision logic lives
// in lib/auth.ts (unit-tested).
export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl

  const adminPassword = process.env.NEWSLETTER_ADMIN_PASSWORD ?? DEFAULT_ADMIN_PASSWORD
  const expectedHash = await sha256Hex(adminPassword)
  const cookieValue = req.cookies.get(AUTH_COOKIE)?.value

  switch (authOutcome(pathname, cookieValue, expectedHash)) {
    case "unauthorized":
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
    case "redirect-login": {
      const url = req.nextUrl.clone()
      url.pathname = LOGIN_PATH
      return NextResponse.redirect(url)
    }
    default:
      return NextResponse.next()
  }
}

export const config = {
  matcher: [
    "/admin",
    "/admin/:path*",
    "/api/upload",
    "/api/upload/:path*",
    "/api/portfolio/:path*",
    "/api/settings",
    "/api/leads",
  ],
}
