import type { Metadata } from "next"
import { JetBrains_Mono, Lato, Inter } from "next/font/google"
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

// Streamtime redesign: substitute for "Ease" — single 400 weight, editorial.
const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-inter",
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
      className={cn("antialiased", lato.variable, fontMono.variable, inter.variable)}
    >
      <body className="overflow-x-hidden bg-warm-linen font-serif">
        {children}
      </body>
      <GoogleAnalytics gaId={process.env.NEXT_PUBLIC_GA_ID ?? "G-929LX8S0BB"} />
    </html>
  )
}
