import { Navbar } from "@/components/layout/Navbar"
import { ThemeProvider } from "@/components/theme-provider"
import { getSiteSettings } from "@/lib/supabase/queries"
import { AnalyticsConsent } from "@/components/consent/analytics-consent"

export default async function SiteLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const settings = await getSiteSettings()

  return (
    <ThemeProvider>
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[70] focus:rounded-md focus:bg-paper-white focus:px-4 focus:py-2 focus:text-ink focus:shadow-lg"
      >
        Skip to content
      </a>
      <Navbar content={settings?.navbar ?? null} />
      {children}
      {/* Google Analytics only loads after the visitor allows it in the banner. */}
      <AnalyticsConsent gaId={process.env.NEXT_PUBLIC_GA_ID ?? "G-929LX8S0BB"} />
    </ThemeProvider>
  )
}
