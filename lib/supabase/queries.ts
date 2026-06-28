import { supabaseAdmin } from "./server"
import type { MediaItem, PortfolioBundles } from "@/lib/portfolio-media"

export async function getPortfolioItems() {
  const { data, error } = await supabaseAdmin
    .from("portfolio_items")
    .select("*")
    .order("display_order", { ascending: true })

  if (error) {
    console.error("Error fetching portfolio items:", error)
    return []
  }

  return (data || []).map((item): MediaItem => {
    const isVideo = item.category === "video" || item.category === "ai"
    return {
      id: item.id,
      kind: isVideo ? "video" : "image",
      category: item.category,
      poster: item.poster_url,
      preview: item.preview_url,
      full: item.full_url,
    }
  })
}

export async function getPortfolioBundles(): Promise<PortfolioBundles> {
  const items = await getPortfolioItems()

  return {
    all: items,
    ai: items.filter((i) => i.category === "ai"),
    static: items.filter((i) => i.category === "static"),
    video: items.filter((i) => i.category === "video"),
  }
}

export async function getSiteSettings() {
  const { data, error } = await supabaseAdmin.from("site_settings").select("*")

  if (error) {
    console.error("Error fetching site settings:", error)
    return {}
  }

  const settings: Record<string, any> = {}
  for (const item of data || []) {
    settings[item.key] = item.value
  }

  return settings
}
