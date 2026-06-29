/**
 * Pure helpers for translating between Supabase Storage paths and their public
 * URLs. Kept free of any client/env imports so they're trivially unit-testable
 * and reusable across the upload + mutation routes.
 */

const PUBLIC_MARKER = "/storage/v1/object/public/"

/** Build the public URL for an object at `path` inside `bucket`. */
export function buildPublicUrl(baseUrl: string, bucket: string, path: string): string {
  const trimmedBase = baseUrl.replace(/\/+$/, "")
  const trimmedPath = path.replace(/^\/+/, "")
  return `${trimmedBase}${PUBLIC_MARKER}${bucket}/${trimmedPath}`
}

/**
 * Recover the in-bucket path from a public URL (for deletion). Returns null if
 * the URL isn't a public object URL for the given bucket.
 */
export function extractStoragePath(bucket: string, url: string | null | undefined): string | null {
  if (!url) return null
  const marker = `${PUBLIC_MARKER}${bucket}/`
  const i = url.indexOf(marker)
  return i === -1 ? null : url.slice(i + marker.length)
}
