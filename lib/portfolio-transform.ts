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
  const statics = items.filter((i) => i.category === "static")
  const videos = items.filter((i) => i.category === "video")
  const ais = items.filter((i) => i.category === "ai")

  return {
    all: [...statics, ...videos, ...ais],
    ai: ais,
    static: statics,
    video: videos,
  }
}
