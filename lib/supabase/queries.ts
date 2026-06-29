import { supabaseAdmin } from "./server"
import type { MediaItem, PortfolioBundles } from "@/lib/portfolio-media"
import { rowToMediaItem, bundleItems } from "@/lib/portfolio-transform"

export type { PortfolioRow } from "@/lib/portfolio-transform"
export { rowToMediaItem, bundleItems } from "@/lib/portfolio-transform"

export async function getPortfolioItems(): Promise<MediaItem[]> {
  const { data, error } = await supabaseAdmin
    .from("portfolio_items")
    .select("*")
    .order("display_order", { ascending: true })

  if (error) {
    console.error("Error fetching portfolio items:", error)
    return []
  }

  return (data || []).map(rowToMediaItem)
}

export async function getPortfolioBundles(): Promise<PortfolioBundles> {
  return bundleItems(await getPortfolioItems())
}

export async function getSiteSettings(): Promise<Record<string, any>> {
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
