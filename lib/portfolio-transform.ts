import type { MediaItem, MediaCategory, PortfolioBundles } from "@/lib/portfolio-media"

export type PortfolioRow = {
  id: string
  title: string
  category: string
  poster_url: string
  preview_url: string | null
  full_url: string
  display_order: number
}

/** Map a DB row to the MediaItem shape the gallery renders. Pure + testable. */
export function rowToMediaItem(row: PortfolioRow): MediaItem {
  const isVideo = row.category === "video" || row.category === "ai"
  return {
    id: row.id,
    kind: isVideo ? "video" : "image",
    category: row.category as MediaCategory,
    poster: row.poster_url,
    preview: row.preview_url ?? undefined,
    full: row.full_url,
  }
}

/** Split a flat item list into the four gallery tabs. Pure + testable. */
export function bundleItems(items: MediaItem[]): PortfolioBundles {
  return {
    all: items,
    ai: items.filter((i) => i.category === "ai"),
    static: items.filter((i) => i.category === "static"),
    video: items.filter((i) => i.category === "video"),
  }
}
