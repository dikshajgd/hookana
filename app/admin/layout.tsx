"use client"

import type { ReactNode } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import {
  LayoutDashboard,
  Pencil,
  Image as ImageIcon,
  Users,
  Mail,
  Inbox,
  LogOut,
} from "lucide-react"

const NAV = [
  { href: "/admin", label: "Overview", icon: LayoutDashboard, exact: true },
  { href: "/admin/site", label: "Site editor", icon: Pencil },
  { href: "/admin/portfolio", label: "Portfolio", icon: ImageIcon },
  { href: "/admin/subscribers", label: "Subscribers", icon: Users },
  { href: "/admin/campaigns", label: "Campaigns", icon: Mail },
  { href: "/admin/leads", label: "Leads", icon: Inbox },
]

// Routes that own the whole viewport — no admin chrome around them.
const BARE_ROUTES = ["/admin/site", "/admin/login"]

export default function AdminLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()

  if (BARE_ROUTES.includes(pathname)) return <>{children}</>

  const handleLogout = async () => {
    await fetch("/api/newsletter/auth", { method: "DELETE" })
    router.push("/admin/login")
    router.refresh()
  }

  return (
    <div className="flex min-h-screen bg-gray-50 text-neutral-900">
      <aside className="sticky top-0 flex h-screen w-56 shrink-0 flex-col border-r border-gray-200 bg-white">
        <div className="border-b border-gray-100 p-5">
          <p className="font-mono text-sm font-bold tracking-widest">HOOKANA</p>
          <p className="mt-0.5 text-[10px] tracking-wider text-gray-400 uppercase">Admin</p>
        </div>
        <nav className="flex flex-1 flex-col gap-1 p-3">
          {NAV.map(({ href, label, icon: Icon, exact }) => {
            const active = exact ? pathname === href : pathname.startsWith(href)
            return (
              <Link
                key={href}
                href={href}
                className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                  active
                    ? "bg-gray-900 text-white"
                    : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                }`}
              >
                <Icon className="size-4 shrink-0" />
                {label}
              </Link>
            )
          })}
        </nav>
        <div className="p-3">
          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-gray-500 transition-colors hover:bg-gray-100 hover:text-red-600"
          >
            <LogOut className="size-4 shrink-0" />
            Sign out
          </button>
        </div>
      </aside>

      <main className="min-w-0 flex-1 overflow-auto">{children}</main>
    </div>
  )
}
