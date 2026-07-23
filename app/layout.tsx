import type { Metadata } from "next"
import { JetBrains_Mono, Lato, Inter, Cormorant, DM_Sans, Staatliches } from "next/font/google"
import { GoogleAnalytics } from "@next/third-parties/google"
import { cn } from "@/lib/utils"
import "./globals.css"

const META_DESCRIPTION =
  "Hookana studies your winners, pitches concept batches, and produces ad-ready creative in 24–48h. Performance creative for D2C brands & agencies."

export const metadata: Metadata = {
  title: "Hookana - Creative Production for D2C Brands",
  description: META_DESCRIPTION,
  openGraph: {
    title: "Hookana - Creative Production for D2C Brands",
    description: META_DESCRIPTION,
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Hookana - Creative Production for D2C Brands",
    description: META_DESCRIPTION,
  },
}

const lato = Lato({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-serif",
})

const fontMono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400"],
  variable: "--font-mono",
})

// Drive Capital: grotesk (Founders substitute) at whisper weights 300/400.
const inter = Inter({
  subsets: ["latin"],
  weight: ["300", "400"],
  variable: "--font-inter",
})

// Drive Capital: hairline didone display (Editorial New substitute).
const cormorant = Cormorant({
  subsets: ["latin"],
  weight: ["300", "400"],
  variable: "--font-cormorant",
})

// DM Sans — the site's default heading + body face (fontpair reference).
const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-dm-sans",
})

// Staatliches — condensed caps display, available as a heading option.
const staatliches = Staatliches({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-staatliches",
})

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={cn(
        "antialiased",
        lato.variable,
        fontMono.variable,
        inter.variable,
        cormorant.variable,
        dmSans.variable,
        staatliches.variable
      )}
    >
      <body className="overflow-x-hidden bg-cream font-serif">
        {children}
      </body>
      <GoogleAnalytics gaId={process.env.NEXT_PUBLIC_GA_ID ?? "G-929LX8S0BB"} />
    </html>
  )
}
