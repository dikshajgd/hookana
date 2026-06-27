import type { ReactNode } from "react"
import { AdminSidebar } from "./AdminSidebar"
import { AdminLayoutShell } from "./AdminLayoutShell"

export const metadata = {
  title: "Newsletter Admin — Hookana",
  robots: "noindex",
}

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <AdminLayoutShell sidebar={<AdminSidebar />}>
      {children}
    </AdminLayoutShell>
  )
}
