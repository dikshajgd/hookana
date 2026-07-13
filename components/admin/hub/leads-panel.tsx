"use client"

import { useEffect, useState } from "react"
import { Inbox, AlertCircle, ExternalLink } from "lucide-react"
import { StatTile, AreaTrend, ChartCard, CHART_COLORS } from "./charts"

type LeadsResponse = {
  configured: boolean
  available: boolean
  leads: Record<string, unknown>[]
  error?: string
}

// Fields we render as columns when present, in this order. Anything else is
// ignored so an unknown sheet shape still renders cleanly.
const PREFERRED = ["name", "brandName", "email", "website", "budget", "submittedAt"]

function labelOf(key: string) {
  return key.replace(/([A-Z])/g, " $1").replace(/^./, (c) => c.toUpperCase())
}

function asDateKey(value: unknown): string | null {
  if (typeof value !== "string") return null
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return null
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`
}

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]

export function LeadsPanel() {
  const [data, setData] = useState<LeadsResponse | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch("/api/leads")
      .then((r) => r.json())
      .then((d) => {
        setData(d)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  const leads = data?.leads ?? []
  const columns =
    leads.length > 0
      ? PREFERRED.filter((k) => leads.some((l) => l[k] != null)).concat(
          Object.keys(leads[0]).filter((k) => !PREFERRED.includes(k)).slice(0, 2)
        )
      : []

  // Leads per month for the trend, if a date-ish field exists.
  const dateField =
    leads.length > 0
      ? ["submittedAt", "date", "createdAt", "timestamp"].find((f) =>
          leads.some((l) => asDateKey(l[f]))
        )
      : undefined
  const buckets = new Map<string, number>()
  if (dateField) {
    for (const l of leads) {
      const k = asDateKey(l[dateField])
      if (k) buckets.set(k, (buckets.get(k) ?? 0) + 1)
    }
  }
  const trend = [...buckets.keys()].sort().map((k) => {
    const [y, m] = k.split("-")
    return { label: `${MONTHS[Number(m) - 1] ?? m} ${y.slice(2)}`, value: buckets.get(k) ?? 0 }
  })

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-gray-900">Leads</h2>
        <p className="mt-1 text-sm text-gray-500">
          Free-concept requests captured by the homepage contact form.
        </p>
      </div>

      {loading ? (
        <div className="h-40 animate-pulse rounded-xl border border-gray-200 bg-gray-50" />
      ) : !data?.configured ? (
        <NotConfigured />
      ) : !data.available ? (
        <Unavailable error={data.error} />
      ) : leads.length === 0 ? (
        <Empty />
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-3">
            <StatTile
              icon={<Inbox className="size-5" />}
              label="Total leads"
              value={leads.length}
              accent={CHART_COLORS.pink}
            />
            {dateField && trend.length > 0 && (
              <StatTile
                label="Newest lead"
                value={trend[trend.length - 1].label}
                sub="most recent month"
                accent={CHART_COLORS.amber}
              />
            )}
          </div>

          {dateField && (
            <ChartCard title="Leads over time" subtitle="Requests per month">
              <AreaTrend points={trend} color={CHART_COLORS.pink} />
            </ChartCard>
          )}

          <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-gray-100 bg-gray-50 text-xs uppercase text-gray-500">
                <tr>
                  {columns.map((c) => (
                    <th key={c} className="px-4 py-3 font-medium">
                      {labelOf(c)}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {leads.slice(0, 100).map((lead, i) => (
                  <tr key={i} className="hover:bg-gray-50">
                    {columns.map((c) => (
                      <td key={c} className="max-w-[220px] truncate px-4 py-3 text-gray-700">
                        {String(lead[c] ?? "—")}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  )
}

function NotConfigured() {
  return (
    <div className="rounded-xl border border-amber-200 bg-amber-50 p-6">
      <div className="flex items-start gap-3">
        <AlertCircle className="mt-0.5 size-5 shrink-0 text-amber-600" />
        <div className="text-sm text-amber-900">
          <p className="font-semibold">Leads aren’t connected yet</p>
          <p className="mt-1 text-amber-800">
            The contact form sends every lead to your Google Sheet via Apps Script. To show them
            here, set <code className="rounded bg-amber-100 px-1">LEADS_FETCH_URL</code> to an Apps
            Script (or endpoint) that returns the rows as JSON on <code>GET</code>.
          </p>
        </div>
      </div>
    </div>
  )
}

function Unavailable({ error }: { error?: string }) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-6">
      <div className="flex items-start gap-3">
        <ExternalLink className="mt-0.5 size-5 shrink-0 text-gray-400" />
        <div className="text-sm text-gray-600">
          <p className="font-semibold text-gray-900">Leads source reachable, but not readable</p>
          <p className="mt-1">
            {error ?? "The configured leads source didn’t return JSON rows."} Leads are still being
            captured to your sheet — they just can’t be displayed here until the source answers GET
            with JSON.
          </p>
        </div>
      </div>
    </div>
  )
}

function Empty() {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-10 text-center">
      <Inbox className="mx-auto size-8 text-gray-300" />
      <p className="mt-3 text-sm font-medium text-gray-700">No leads yet</p>
      <p className="mt-1 text-sm text-gray-400">
        New free-concept requests from the homepage will appear here.
      </p>
    </div>
  )
}
