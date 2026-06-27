"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { LayoutDashboard, Users, Mail, LogOut, Send } from "lucide-react"

const navItems = [
  { href: "/newsletter-admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { href: "/newsletter-admin/subscribers", label: "Subscribers", icon: Users },
  { href: "/newsletter-admin/campaigns", label: "Campaigns", icon: Mail },
]

export function AdminSidebar() {
  const pathname = usePathname()
  const router = useRouter()

  if (pathname === "/newsletter-admin/login") return null

  const handleLogout = async () => {
    await fetch("/api/newsletter/auth", { method: "DELETE" })
    router.push("/newsletter-admin/login")
    router.refresh()
  }

  return (
    <aside className="w-56 bg-[#0A1628] min-h-screen flex flex-col shrink-0">
      <div className="p-5 border-b border-white/10">
        <Link href="/newsletter-admin" className="block">
          <span className="text-white font-mono text-sm font-bold tracking-widest">
            HOOKANA
          </span>
          <p className="text-blue-300/50 font-mono text-[10px] tracking-wider mt-0.5 uppercase">
            Newsletter
          </p>
        </Link>
      </div>

      <nav className="p-3 flex flex-col gap-1 flex-1">
        {navItems.map(({ href, label, icon: Icon, exact }) => {
          const active = exact ? pathname === href : pathname.startsWith(href)
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                active
                  ? "bg-white/15 text-white"
                  : "text-blue-200/60 hover:text-white hover:bg-white/8"
              }`}
            >
              <Icon className="size-4 shrink-0" />
              {label}
            </Link>
          )
        })}

        <Link
          href="/newsletter-admin/campaigns/new"
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium mt-2 bg-blue-500/20 text-blue-200 hover:bg-blue-500/30 transition-colors border border-blue-500/30"
        >
          <Send className="size-4 shrink-0" />
          New Campaign
        </Link>
      </nav>

      <div className="p-3">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-blue-200/50 hover:text-red-300 hover:bg-white/5 transition-colors w-full"
        >
          <LogOut className="size-4 shrink-0" />
          Sign Out
        </button>
      </div>
    </aside>
  )
}
