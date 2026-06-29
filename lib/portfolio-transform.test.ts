import { describe, it, expect } from "vitest"
import { rowToMediaItem, bundleItems, type PortfolioRow } from "./portfolio-transform"

function row(overrides: Partial<PortfolioRow>): PortfolioRow {
  return {
    id: "id-1",
    title: "Test",
    category: "video",
    poster_url: "https://x/poster.webp",
    preview_url: "https://x/preview.webm",
    full_url: "https://x/full.mp4",
    display_order: 0,
    ...overrides,
  }
}

describe("rowToMediaItem", () => {
  it("treats 'video' and 'ai' categories as video kind", () => {
    expect(rowToMediaItem(row({ category: "video" })).kind).toBe("video")
    expect(rowToMediaItem(row({ category: "ai" })).kind).toBe("video")
  })

  it("treats 'static' as image kind", () => {
    expect(rowToMediaItem(row({ category: "static" })).kind).toBe("image")
  })

  it("coerces a null preview_url to undefined (matches MediaItem type)", () => {
    const item = rowToMediaItem(row({ preview_url: null }))
    expect(item.preview).toBeUndefined()
  })

  it("carries through id/poster/full", () => {
    const item = rowToMediaItem(row({ id: "abc", poster_url: "P", full_url: "F" }))
    expect(item).toMatchObject({ id: "abc", poster: "P", full: "F" })
  })
})

describe("bundleItems", () => {
  it("splits a flat list into tabs, with 'all' holding everything", () => {
    const items = [
      rowToMediaItem(row({ id: "1", category: "ai" })),
      rowToMediaItem(row({ id: "2", category: "static" })),
      rowToMediaItem(row({ id: "3", category: "video" })),
      rowToMediaItem(row({ id: "4", category: "video" })),
    ]
    const b = bundleItems(items)
    expect(b.all).toHaveLength(4)
    expect(b.ai.map((i) => i.id)).toEqual(["1"])
    expect(b.static.map((i) => i.id)).toEqual(["2"])
    expect(b.video.map((i) => i.id)).toEqual(["3", "4"])
  })

  it("yields empty tabs for an empty list", () => {
    const b = bundleItems([])
    expect(b).toEqual({ all: [], ai: [], static: [], video: [] })
  })
})
