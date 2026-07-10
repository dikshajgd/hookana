import { getSiteSettings } from "@/lib/supabase/queries"
import { CONTENT_DEFAULTS } from "@/lib/admin/content-schema"
import { LandingSections } from "@/components/landing/landing-sections"
import { SiteEditor } from "@/components/admin/editor/site-editor"

export const dynamic = "force-dynamic"

// The inline site editor: the real homepage, made editable in place. Renders
// the exact same <LandingSections> the public route does, wrapped in the editor
// shell so its editable primitives light up.
export default async function SiteEditorPage() {
  const settings = await getSiteSettings()

  return (
    <SiteEditor defaults={CONTENT_DEFAULTS} initialSettings={settings}>
      <LandingSections settings={settings} />
    </SiteEditor>
  )
}
