import { Navbar } from "@/components/layout/Navbar"
import { ThemeProvider } from "@/components/theme-provider"
import { getSiteSettings } from "@/lib/supabase/queries"

export default async function SiteLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const settings = await getSiteSettings()

  return (
    <ThemeProvider>
      <Navbar content={settings?.navbar ?? null} />
      {children}
    </ThemeProvider>
  )
}
