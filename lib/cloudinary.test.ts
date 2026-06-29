import { describe, it, expect } from "vitest"
import { cldImage, cldVideo, cldPoster } from "./cloudinary"

const VIDEO = "https://res.cloudinary.com/ddbynpktj/video/upload/v1779285205/web_1_neyohx.mp4"
const IMAGE = "https://res.cloudinary.com/ddbynpktj/image/upload/v1779787804/hf_x.png"
const NON_CLD = "https://example.com/foo/bar.mp4"

describe("cldImage", () => {
  it("inserts an image transform after /upload/", () => {
    expect(cldImage(IMAGE, 800)).toBe(
      "https://res.cloudinary.com/ddbynpktj/image/upload/f_auto,q_auto,c_limit,w_800/v1779787804/hf_x.png"
    )
  })

  it("respects a custom width", () => {
    expect(cldImage(IMAGE, 300)).toContain("w_300")
  })

  it("leaves non-cloudinary URLs untouched", () => {
    expect(cldImage(NON_CLD)).toBe(NON_CLD)
  })

  it("is idempotent — never double-inserts a transform", () => {
    const once = cldImage(IMAGE, 800)
    expect(cldImage(once, 800)).toBe(once)
  })
})

describe("cldVideo", () => {
  it("inserts a trimmed (du_5), eco-quality video transform", () => {
    const out = cldVideo(VIDEO, 720)
    expect(out).toContain("/upload/f_auto,q_auto:eco,vc_auto,c_limit,w_720,du_5/")
    expect(out.endsWith("/v1779285205/web_1_neyohx.mp4")).toBe(true)
  })

  it("is idempotent", () => {
    const once = cldVideo(VIDEO, 720)
    expect(cldVideo(once, 720)).toBe(once)
  })

  it("passes through non-cloudinary URLs", () => {
    expect(cldVideo(NON_CLD)).toBe(NON_CLD)
  })
})

describe("cldPoster", () => {
  it("produces a jpg still from the first frame of a cloudinary video", () => {
    const out = cldPoster(VIDEO, 720)
    expect(out).toContain("f_jpg,q_auto,c_limit,w_720,so_0")
    expect(out.endsWith(".jpg")).toBe(true)
    expect(out).not.toContain(".mp4")
  })

  it("falls back to swapping .mp4 -> .jpg for non-cloudinary URLs", () => {
    expect(cldPoster(NON_CLD)).toBe("https://example.com/foo/bar.jpg")
  })
})
