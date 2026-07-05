import type { Metadata } from "next"
import { JetBrains_Mono, Lato, Inter, Cormorant } from "next/font/google"
import { GoogleAnalytics } from "@next/third-parties/google"
import { cn } from "@/lib/utils"
import "./globals.css"

export const metadata: Metadata = {
  title: "Hookana - Creative Production for D2C Brands",
  description:
    "Fresh creatives, fast, on-brand, and at scale. Hookana is the creative production engine that keeps your pipeline full without blowing your budget or burning out your team.",
  openGraph: {
    title: "Hookana - Creative Production for D2C Brands",
    description:
      "Fresh creatives, fast, on-brand, and at scale. Hookana is the creative production engine that keeps your pipeline full without blowing your budget or burning out your team.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Hookana - Creative Production for D2C Brands",
    description:
      "Fresh creatives, fast, on-brand, and at scale. Hookana keeps your creative pipeline full without blowing your budget.",
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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={cn("antialiased", lato.variable, fontMono.variable, inter.variable, cormorant.variable)}
    >
      <body className="overflow-x-hidden bg-cream font-serif">
        {children}
      </body>
      <GoogleAnalytics gaId={process.env.NEXT_PUBLIC_GA_ID ?? "G-929LX8S0BB"} />
    </html>
  )
}
