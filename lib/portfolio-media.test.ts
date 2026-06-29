import { describe, it, expect } from "vitest"
import { toVideoItems, toImageItems, toMixedItems } from "./portfolio-media"

const RAW_VIDEO = "https://res.cloudinary.com/ddbynpktj/video/upload/v1/clip.mp4"
const RAW_IMAGE = "https://res.cloudinary.com/ddbynpktj/image/upload/v1/pic.png"

describe("toVideoItems", () => {
  it("returns [] for null/empty input", () => {
    expect(toVideoItems(null, "video")).toEqual([])
    expect(toVideoItems(undefined, "video")).toEqual([])
    expect(toVideoItems([], "video")).toEqual([])
  })

  it("builds video MediaItems with poster/preview/full transforms", () => {
    const [item] = toVideoItems([{ url: RAW_VIDEO }], "ai")
    expect(item.kind).toBe("video")
    expect(item.category).toBe("ai")
    expect(item.poster).toContain("so_1,w_640")
    expect(item.poster.endsWith(".jpg")).toBe(true)
    expect(item.preview).toContain("du_6")
    expect(item.preview).toContain("ac_none")
    expect(item.full).toContain("w_1080")
  })

  it("skips entries missing a url", () => {
    expect(toVideoItems([{ url: null }, { url: "" }, { url: RAW_VIDEO }], "video")).toHaveLength(1)
  })
})

describe("toImageItems", () => {
  it("builds image MediaItems categorized as static", () => {
    const [item] = toImageItems([{ url: RAW_IMAGE }])
    expect(item.kind).toBe("image")
    expect(item.category).toBe("static")
    expect(item.preview).toBeUndefined()
    expect(item.poster).toContain("w_700")
    expect(item.full).toContain("w_1280")
  })

  it("returns [] for empty input", () => {
    expect(toImageItems(null)).toEqual([])
  })
})

describe("toMixedItems", () => {
  it("routes each entry by its declared kind", () => {
    const items = toMixedItems([
      { kind: "video", url: RAW_VIDEO },
      { kind: "image", url: RAW_IMAGE },
    ])
    expect(items.map((i) => i.kind)).toEqual(["video", "image"])
  })

  it("drops entries missing url OR kind", () => {
    const items = toMixedItems([
      { kind: "video", url: null },
      { kind: undefined, url: RAW_VIDEO },
      { kind: "image", url: RAW_IMAGE },
    ])
    expect(items).toHaveLength(1)
    expect(items[0].kind).toBe("image")
  })
})
