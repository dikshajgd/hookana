"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Users, Mail, Send, TrendingUp, ArrowRight } from "lucide-react"
import { StatTile, Donut, HBars, AreaTrend, ChartCard, CHART_COLORS } from "./charts"

type Stats = {
  subscribers: { total: number; active: number; unsubscribed: number }
  campaigns: {
    total: number
    sent: number
    draft: number
    lastCampaign: { sentAt: string; title?: string; subject: string } | null
  }
  daily: { used: number; remaining: number; limit: number }
}

type Analytics = {
  growth: { month: string; added: number; total: number }[]
  sources: { source: string; count: number }[]
}

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
function monthLabel(key: string) {
  const [y, m] = key.split("-")
  return `${MONTHS[Number(m) - 1] ?? m} ${y.slice(2)}`
}

export function NewsletterPanel() {
  const [stats, setStats] = useState<Stats | null>(null)
  const [analytics, setAnalytics] = useState<Analytics | null>(null)

  useEffect(() => {
    fetch("/api/newsletter/stats").then((r) => r.json()).then(setStats).catch(() => {})
    fetch("/api/newsletter/analytics").then((r) => r.json()).then(setAnalytics).catch(() => {})
  }, [])

  const dailyPct = stats ? Math.round((stats.daily.used / Math.max(1, stats.daily.limit)) * 100) : 0
  const growthPoints =
    analytics?.growth.map((g) => ({ label: monthLabel(g.month), value: g.total })) ?? []

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-gray-900">Newsletter</h2>
        <p className="mt-1 text-sm text-gray-500">Subscribers, campaigns and send capacity.</p>
      </div>

      {/* Quick actions */}
      <div className="grid gap-4 sm:grid-cols-3">
        <QuickAction
          href="/newsletter-admin/campaigns/new"
          icon={<Send className="size-5" />}
          title="Create campaign"
          desc="Write or AI-generate a newsletter and send it"
        />
        <QuickAction
          href="/newsletter-admin/subscribers"
          icon={<Users className="size-5" />}
          title="Subscribers"
          desc="Add, import or review your list"
        />
        <QuickAction
          href="/newsletter-admin/campaigns"
          icon={<Mail className="size-5" />}
          title="Campaigns"
          desc="Drafts and past sends"
        />
      </div>

      {/* Stat tiles */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatTile
          icon={<Users className="size-5" />}
          label="Total subscribers"
          value={stats?.subscribers.total ?? "—"}
          sub={`${stats?.subscribers.active ?? "—"} active`}
          accent={CHART_COLORS.blue}
        />
        <StatTile
          icon={<Mail className="size-5" />}
          label="Campaigns"
          value={stats?.campaigns.total ?? "—"}
          sub={`${stats?.campaigns.sent ?? "—"} sent · ${stats?.campaigns.draft ?? "—"} draft`}
          accent={CHART_COLORS.violet}
        />
        <StatTile
          icon={<TrendingUp className="size-5" />}
          label="Sends left today"
          value={stats?.daily.remaining ?? "—"}
          sub={`of ${stats?.daily.limit ?? "—"} daily limit`}
          accent={CHART_COLORS.green}
        />
        <StatTile
          label="Unsubscribed"
          value={stats?.subscribers.unsubscribed ?? "—"}
          sub="all-time"
          accent={CHART_COLORS.slate}
        />
      </div>

      {/* Charts */}
      <div className="grid gap-4 lg:grid-cols-2">
        <ChartCard title="Subscriber growth" subtitle="Cumulative sign-ups by month">
          <AreaTrend points={growthPoints} color={CHART_COLORS.blue} />
        </ChartCard>

        <ChartCard title="List health" subtitle="Active vs unsubscribed">
          <Donut
            centerValue={stats?.subscribers.total ?? 0}
            centerLabel="total subscribers"
            segments={[
              { label: "Active", value: stats?.subscribers.active ?? 0, color: CHART_COLORS.green },
              {
                label: "Unsubscribed",
                value: stats?.subscribers.unsubscribed ?? 0,
                color: CHART_COLORS.slate,
              },
            ]}
          />
        </ChartCard>

        <ChartCard title="Acquisition sources" subtitle="Where subscribers came from">
          <HBars
            items={(analytics?.sources ?? []).map((s) => ({ label: s.source, value: s.count }))}
          />
        </ChartCard>

        <ChartCard title="Daily send capacity" subtitle={`${dailyPct}% of today's limit used`}>
          <div className="mt-6">
            <div className="h-5 overflow-hidden rounded-full bg-gray-100">
              <div
                className="h-full rounded-full bg-green-500 transition-all"
                style={{ width: `${Math.min(100, dailyPct)}%` }}
              />
            </div>
            <div className="mt-2 flex justify-between text-xs text-gray-500">
              <span>{stats?.daily.used ?? 0} used</span>
              <span>{stats?.daily.remaining ?? 0} remaining</span>
            </div>
          </div>
        </ChartCard>
      </div>
    </div>
  )
}

function QuickAction({
  href,
  icon,
  title,
  desc,
}: {
  href: string
  icon: React.ReactNode
  title: string
  desc: string
}) {
  return (
    <Link
      href={href}
      className="group rounded-xl border border-gray-200 bg-white p-5 transition-all hover:border-gray-900 hover:shadow-sm"
    >
      <div className="mb-3 flex size-9 items-center justify-center rounded-lg bg-gray-900/5 text-gray-900">
        {icon}
      </div>
      <p className="font-semibold text-gray-900">{title}</p>
      <p className="mt-0.5 text-sm text-gray-500">{desc}</p>
      <p className="mt-3 flex items-center gap-1 text-xs font-semibold text-gray-900 transition-all group-hover:gap-2">
        Open <ArrowRight className="size-3.5" />
      </p>
    </Link>
  )
}
