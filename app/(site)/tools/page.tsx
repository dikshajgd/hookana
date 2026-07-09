import { getSiteSettings } from "@/lib/supabase/queries"
import { DiagnosticSection } from "@/components/landing/diagnostic-section"

export default async function ToolsPage() {
  const settings = await getSiteSettings()

  return (
    <div className="mt-4 w-full overflow-x-clip bg-blue-950 pt-36 lg:pt-32">
      <DiagnosticSection content={settings.diagnostic ?? null} />
    </div>
  )
}
