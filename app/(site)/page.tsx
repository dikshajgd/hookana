import { getSiteSettings } from "@/lib/supabase/queries"
import { LandingSections } from "@/components/landing/landing-sections"

// Content is CMS-driven (site_settings). Render on every request so edits
// published from /admin/site show up immediately instead of being frozen into a
// build-time static snapshot.
export const dynamic = "force-dynamic"

export default async function Page() {
  const settings = await getSiteSettings()

  return <LandingSections settings={settings} />
}
