import type { ReactNode } from "react"
import { Inter } from "next/font/google"
import { AdminSidebar } from "./AdminSidebar"
import { AdminLayoutShell } from "./AdminLayoutShell"

const inter = Inter({ subsets: ["latin"] })

export const metadata = {
  title: "Newsletter Admin — Hookana",
  robots: "noindex",
}

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <div className={inter.className}>
      <AdminLayoutShell sidebar={<AdminSidebar />}>
        {children}
      </AdminLayoutShell>
    </div>
  )
}
