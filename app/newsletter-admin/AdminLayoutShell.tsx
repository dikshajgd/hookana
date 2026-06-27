"use client"

import { usePathname } from "next/navigation"
import type { ReactNode } from "react"

export function AdminLayoutShell({
  sidebar,
  children,
}: {
  sidebar: ReactNode
  children: ReactNode
}) {
  const pathname = usePathname()
  const isLogin = pathname === "/newsletter-admin/login"

  if (isLogin) return <>{children}</>

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {sidebar}
      <main className="flex-1 overflow-auto min-h-screen">{children}</main>
    </div>
  )
}
