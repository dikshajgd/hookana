import { getSiteSettings } from "@/lib/supabase/queries"
import { LandingSections } from "@/components/landing/landing-sections"

export default async function Page() {
  const settings = await getSiteSettings()

  return <LandingSections settings={settings} />
}
