import { client } from "@/sanity/lib/client"
import { LANDING_PAGE_QUERY } from "@/sanity/lib/queries"
import type { LandingPageContent } from "@/sanity/lib/types"
import { DiagnosticSection } from "@/components/landing/diagnostic-section"

export default async function ToolsPage() {
  const page: LandingPageContent | null = await client.fetch(LANDING_PAGE_QUERY)

  return (
    <div className="mt-4 w-full overflow-x-clip bg-blue-950 pt-36 lg:pt-32">
      <DiagnosticSection content={page?.diagnostic ?? null} />
    </div>
  )
}
