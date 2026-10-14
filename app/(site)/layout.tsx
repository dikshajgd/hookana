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
      {/* Page frame: content stops at 1600px and centres on big screens, with side
          room that grows from 1280px up (0 on phones and tablets, 56px max). Sections keep their own gutters. */}
      <div className="mx-auto w-full max-w-[1600px] md:px-[clamp(0px,calc((100vw-1280px)/8),56px)]">
        <Navbar content={settings?.navbar ?? null} />
        {children}
      </div>
      {/* Google Analytics only loads after the visitor allows it in the banner. */}
      <AnalyticsConsent gaId={process.env.NEXT_PUBLIC_GA_ID ?? "G-929LX8S0BB"} />
    </ThemeProvider>
  )
}
