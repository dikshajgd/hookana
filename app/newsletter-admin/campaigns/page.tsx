"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import {
  Plus,
  Mail,
  Send,
  FileText,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  Trash2,
} from "lucide-react"

type Campaign = {
  _id: string
  title?: string
  subject: string
  status: "draft" | "sent"
  mode: "manual" | "generated"
  sentAt?: string
  sentCount?: number
  recipientCount?: number
  _createdAt: string
}

type PageData = {
  campaigns: Campaign[]
  total: number
  pages: number
  page: number
}

export default function CampaignsPage() {
  const [data, setData] = useState<PageData | null>(null)
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(true)

  const load = async () => {
    setLoading(true)
    const res = await fetch(`/api/newsletter/campaigns?page=${page}`)
    const json = await res.json()
    setData(json)
    setLoading(false)
  }

  useEffect(() => { load() }, [page]) // eslint-disable-line react-hooks/exhaustive-deps

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this campaign? This cannot be undone.")) return
    await fetch(`/api/newsletter/campaigns/${id}`, { method: "DELETE" })
    load()
  }

  const formatDate = (iso?: string) =>
    iso
      ? new Date(iso).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
        })
      : "—"

  return (
    <div className="p-8 max-w-5xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Campaigns</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {data ? `${data.total.toLocaleString()} total` : "Loading..."}
          </p>
        </div>
        <Link
          href="/newsletter-admin/campaigns/new"
          className="flex items-center gap-2 bg-[#0A1628] text-white px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-[#0A1628]/90 transition-colors"
        >
          <Plus className="size-4" />
          New Campaign
        </Link>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white rounded-xl border border-gray-200 p-5 animate-pulse">
              <div className="h-4 bg-gray-100 rounded w-64 mb-2" />
              <div className="h-3 bg-gray-100 rounded w-32" />
            </div>
          ))}
        </div>
      ) : !data || data.campaigns.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-16 text-center">
          <Mail className="size-10 text-gray-300 mx-auto mb-3" />
          <p className="font-semibold text-gray-700">No campaigns yet</p>
          <p className="text-sm text-gray-400 mt-1 mb-5">
            Create your first newsletter campaign
          </p>
          <Link
            href="/newsletter-admin/campaigns/new"
            className="inline-flex items-center gap-2 bg-[#0A1628] text-white px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-[#0A1628]/90 transition-colors"
          >
            <Plus className="size-4" /> Create Campaign
          </Link>
        </div>
      ) : (
        <>
          <div className="space-y-3">
            {data.campaigns.map((c) => (
              <div
                key={c._id}
                className="bg-white rounded-xl border border-gray-200 p-5 hover:border-gray-300 transition-colors"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${
                          c.status === "sent"
                            ? "bg-green-50 text-green-700"
                            : "bg-amber-50 text-amber-700"
                        }`}
                      >
                        {c.status === "sent" ? <Send className="size-3" /> : <FileText className="size-3" />}
                        {c.status}
                      </span>
                      {c.mode === "generated" && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-violet-50 text-violet-700">
                          <Sparkles className="size-3" />
                          AI Generated
                        </span>
                      )}
                    </div>
                    <p className="font-semibold text-gray-900 truncate">{c.subject}</p>
                    {c.title && c.title !== c.subject && (
                      <p className="text-xs text-gray-400 mt-0.5 font-mono">{c.title}</p>
                    )}
                    <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2 text-xs text-gray-500">
                      <span>Created {formatDate(c._createdAt)}</span>
                      {c.status === "sent" && (
                        <>
                          <span>Sent {formatDate(c.sentAt)}</span>
                          <span className="font-medium text-green-600">
                            {c.sentCount?.toLocaleString()} delivered / {c.recipientCount?.toLocaleString()} recipients
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    {c.status === "draft" && (
                      <Link
                        href={`/newsletter-admin/campaigns/${c._id}`}
                        className="flex items-center gap-1.5 text-xs font-medium text-[#0A1628] border border-[#0A1628]/20 px-3 py-1.5 rounded-lg hover:bg-[#0A1628]/5 transition-colors"
                      >
                        <Send className="size-3.5" />
                        Open &amp; Send
                      </Link>
                    )}
                    <button
                      onClick={() => handleDelete(c._id)}
                      className="text-gray-400 hover:text-red-500 p-1.5 rounded-lg hover:bg-red-50 transition-colors"
                    >
                      <Trash2 className="size-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {data.pages > 1 && (
            <div className="flex items-center justify-between mt-4 bg-white rounded-xl border border-gray-200 px-5 py-3">
              <p className="text-xs text-gray-500">
                Page {data.page} of {data.pages}
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="p-1.5 rounded border border-gray-200 disabled:opacity-40 hover:border-gray-300 transition-colors"
                >
                  <ChevronLeft className="size-4" />
                </button>
                <button
                  onClick={() => setPage((p) => Math.min(data.pages, p + 1))}
                  disabled={page === data.pages}
                  className="p-1.5 rounded border border-gray-200 disabled:opacity-40 hover:border-gray-300 transition-colors"
                >
                  <ChevronRight className="size-4" />
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}
