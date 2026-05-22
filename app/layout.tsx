import type { Metadata } from "next"
import { JetBrains_Mono, Lato } from "next/font/google"
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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={cn("antialiased", lato.variable, fontMono.variable)}
    >
      <body className="overflow-x-hidden bg-pink-300 font-serif">
        {children}
      </body>
      {process.env.NEXT_PUBLIC_GA_ID && (
        <GoogleAnalytics gaId={process.env.NEXT_PUBLIC_GA_ID} />
      )}
    </html>
  )
}
