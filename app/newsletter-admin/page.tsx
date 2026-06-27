"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Users, Mail, Send, TrendingUp, ArrowRight, Clock } from "lucide-react"

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

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch("/api/newsletter/stats")
      .then((r) => r.json())
      .then((json) => {
        setStats(json)
        setLoading(false)
      })
  }, [])

  const formatDate = (iso?: string) => {
    if (!iso) return "—"
    return new Date(iso).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    })
  }

  return (
    <div className="p-8 max-w-5xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-500 text-sm mt-1">Newsletter overview for Hookana</p>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white rounded-xl border border-gray-200 p-6 animate-pulse">
              <div className="h-4 bg-gray-100 rounded w-24 mb-3" />
              <div className="h-8 bg-gray-100 rounded w-16" />
            </div>
          ))}
        </div>
      ) : (
        <>
          {/* Stat Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
            <StatCard
              icon={<Users className="size-5 text-blue-600" />}
              label="Total Subscribers"
              value={stats?.subscribers.total ?? 0}
              sub={`Active: ${stats?.subscribers.active ?? "—"}`}
              href="/newsletter-admin/subscribers"
              bg="bg-blue-50"
            />
            <StatCard
              icon={<Mail className="size-5 text-violet-600" />}
              label="Campaigns"
              value={stats?.campaigns.total ?? 0}
              sub={`Last sent: ${formatDate(stats?.campaigns.lastCampaign?.sentAt)}`}
              href="/newsletter-admin/campaigns"
              bg="bg-violet-50"
            />
            <StatCard
              icon={<TrendingUp className="size-5 text-green-600" />}
              label="Daily Sends Remaining"
              value={stats?.daily.remaining ?? 0}
              sub={`Limit: ${stats?.daily.limit ?? 1000} / Used: ${stats?.daily.used ?? 0}`}
              bg="bg-green-50"
            />
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <QuickAction
              href="/newsletter-admin/campaigns/new"
              icon={<Send className="size-5" />}
              title="Create New Campaign"
              desc="Write or AI-generate a newsletter and send it"
              cta="Start writing"
            />
            <QuickAction
              href="/newsletter-admin/subscribers"
              icon={<Users className="size-5" />}
              title="Manage Subscribers"
              desc="Add, import or review your subscriber list"
              cta="View subscribers"
            />
          </div>

          {/* Last Campaign */}
          {stats?.campaigns.lastCampaign && (
            <div className="mt-6 bg-white rounded-xl border border-gray-200 p-5">
              <div className="flex items-center gap-2 text-xs font-mono text-gray-400 mb-2">
                <Clock className="size-3.5" />
                LAST CAMPAIGN
              </div>
              <p className="font-semibold text-gray-800">
                {stats.campaigns.lastCampaign.subject}
              </p>
              <p className="text-sm text-gray-500 mt-1">
                Sent {formatDate(stats.campaigns.lastCampaign.sentAt)}
              </p>
            </div>
          )}
        </>
      )}
    </div>
  )
}

function StatCard({
  icon,
  label,
  value,
  sub,
  href,
  bg,
}: {
  icon: React.ReactNode
  label: string
  value: number
  sub: string
  href?: string
  bg: string
}) {
  const content = (
    <div className="bg-white rounded-xl border border-gray-200 p-6 hover:border-gray-300 transition-colors">
      <div className={`w-9 h-9 rounded-lg ${bg} flex items-center justify-center mb-4`}>
        {icon}
      </div>
      <p className="text-3xl font-bold text-gray-900">{value.toLocaleString()}</p>
      <p className="text-sm font-medium text-gray-700 mt-1">{label}</p>
      <p className="text-xs text-gray-400 mt-0.5">{sub}</p>
    </div>
  )

  if (href) return <Link href={href}>{content}</Link>
  return content
}

function QuickAction({
  href,
  icon,
  title,
  desc,
  cta,
}: {
  href: string
  icon: React.ReactNode
  title: string
  desc: string
  cta: string
}) {
  return (
    <Link
      href={href}
      className="bg-white rounded-xl border border-gray-200 p-6 hover:border-blue-300 hover:shadow-sm transition-all group"
    >
      <div className="w-9 h-9 rounded-lg bg-[#0A1628]/5 flex items-center justify-center mb-4 text-[#0A1628]">
        {icon}
      </div>
      <p className="font-semibold text-gray-900">{title}</p>
      <p className="text-sm text-gray-500 mt-1">{desc}</p>
      <p className="flex items-center gap-1 text-xs font-semibold text-[#0A1628] mt-4 group-hover:gap-2 transition-all">
        {cta} <ArrowRight className="size-3.5" />
      </p>
    </Link>
  )
}
