/**
 * Shared admin-auth primitives for the middleware (and tests).
 *
 * The content CMS (/admin) and the newsletter dashboard (/newsletter-admin)
 * share ONE cookie (`nl_admin_auth`), whose value is the sha256 hex of the
 * admin password. Keeping the path-matching + decision logic pure here makes it
 * unit-testable without constructing NextRequest/NextResponse.
 */

export const AUTH_COOKIE = "nl_admin_auth"
export const LOGIN_PATH = "/newsletter-admin/login"
export const DEFAULT_ADMIN_PASSWORD = "hookana_admin_2026"

export const PROTECTED_PAGES = ["/newsletter-admin", "/admin"]
export const PROTECTED_APIS = ["/api/upload", "/api/portfolio", "/api/settings"]

/** sha256 hex, using Web Crypto so it runs in edge middleware and node/tests. */
export async function sha256Hex(text: string): Promise<string> {
  const data = new TextEncoder().encode(text)
  const hash = await crypto.subtle.digest("SHA-256", data)
  return Array.from(new Uint8Array(hash))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("")
}

/** True if `pathname` is `prefix` itself or a child segment of it. */
function matchesPrefix(pathname: string, prefix: string): boolean {
  return pathname === prefix || pathname.startsWith(`${prefix}/`)
}

export function classifyPath(pathname: string) {
  return {
    isLoginPath: pathname === LOGIN_PATH,
    isProtectedPage: PROTECTED_PAGES.some((p) => matchesPrefix(pathname, p)),
    isProtectedApi: PROTECTED_APIS.some((p) => matchesPrefix(pathname, p)),
  }
}

export type AuthOutcome = "allow" | "redirect-login" | "unauthorized"

/**
 * Decide what the middleware should do for a request. Pure: given the path, the
 * presented cookie value, and the expected hash, returns the action to take.
 */
export function authOutcome(
  pathname: string,
  cookieValue: string | undefined,
  expectedHash: string
): AuthOutcome {
  const { isLoginPath, isProtectedPage, isProtectedApi } = classifyPath(pathname)

  if (isLoginPath) return "allow"
  if (!isProtectedPage && !isProtectedApi) return "allow"

  if (cookieValue === expectedHash) return "allow"

  return isProtectedApi ? "unauthorized" : "redirect-login"
}
