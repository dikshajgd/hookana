import { describe, it, expect } from "vitest"
import { buildPublicUrl, extractStoragePath } from "./storage"

const BASE = "https://qcmslinrhygwxxbbepjq.supabase.co"
const BUCKET = "portfolio-media"

describe("buildPublicUrl", () => {
  it("builds a public object URL", () => {
    expect(buildPublicUrl(BASE, BUCKET, "originals/123-clip.mp4")).toBe(
      `${BASE}/storage/v1/object/public/${BUCKET}/originals/123-clip.mp4`
    )
  })

  it("normalizes stray slashes between base and path", () => {
    expect(buildPublicUrl(BASE + "/", BUCKET, "/posters/x.webp")).toBe(
      `${BASE}/storage/v1/object/public/${BUCKET}/posters/x.webp`
    )
  })
})

describe("extractStoragePath", () => {
  it("round-trips with buildPublicUrl", () => {
    const path = "previews/123-clip.webm"
    const url = buildPublicUrl(BASE, BUCKET, path)
    expect(extractStoragePath(BUCKET, url)).toBe(path)
  })

  it("returns null for null/undefined/empty", () => {
    expect(extractStoragePath(BUCKET, null)).toBeNull()
    expect(extractStoragePath(BUCKET, undefined)).toBeNull()
    expect(extractStoragePath(BUCKET, "")).toBeNull()
  })

  it("returns null for a URL from a different bucket", () => {
    const url = buildPublicUrl(BASE, "other-bucket", "a/b.png")
    expect(extractStoragePath(BUCKET, url)).toBeNull()
  })

  it("returns null for an unrelated URL (e.g. legacy Cloudinary)", () => {
    expect(
      extractStoragePath(BUCKET, "https://res.cloudinary.com/x/video/upload/v1/y.mp4")
    ).toBeNull()
  })
})
