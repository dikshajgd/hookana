"use client"

import { useEffect, useState, useRef } from "react"
import {
  Users,
  Plus,
  Trash2,
  UserX,
  UserCheck,
  Upload,
  ChevronLeft,
  ChevronRight,
  X,
} from "lucide-react"

type Subscriber = {
  _id: string
  email: string
  name?: string
  status: "active" | "unsubscribed"
  source?: string
  subscribedAt?: string
}

type PageData = {
  subscribers: Subscriber[]
  total: number
  pages: number
  page: number
}

type AddMode = "single" | "bulk" | "excel"

export default function SubscribersPage() {
  const [data, setData] = useState<PageData | null>(null)
  const [page, setPage] = useState(1)
  const [statusFilter, setStatusFilter] = useState<string>("")
  const [loading, setLoading] = useState(true)
  const [addMode, setAddMode] = useState<AddMode>("single")

  // Single add
  const [singleEmail, setSingleEmail] = useState("")
  const [singleName, setSingleName] = useState("")
  const [singleLoading, setSingleLoading] = useState(false)
  const [singleMsg, setSingleMsg] = useState<{ type: "ok" | "err"; text: string } | null>(null)

  // Bulk (comma-separated)
  const [bulkText, setBulkText] = useState("")
  const [bulkLoading, setBulkLoading] = useState(false)
  const [bulkMsg, setBulkMsg] = useState<{ type: "ok" | "err"; text: string } | null>(null)

  // Excel
  const fileRef = useRef<HTMLInputElement>(null)
  const [excelPreview, setExcelPreview] = useState<Array<{ email: string; name?: string }>>([])
  const [excelLoading, setExcelLoading] = useState(false)
  const [excelMsg, setExcelMsg] = useState<{ type: "ok" | "err"; text: string } | null>(null)

  const load = async () => {
    setLoading(true)
    const params = new URLSearchParams({ page: String(page) })
    if (statusFilter) params.set("status", statusFilter)
    const res = await fetch(`/api/newsletter/subscribers?${params}`)
    const json = await res.json()
    setData(json)
    setLoading(false)
  }

  useEffect(() => { load() }, [page, statusFilter]) // eslint-disable-line react-hooks/exhaustive-deps

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this subscriber?")) return
    await fetch(`/api/newsletter/subscribers/${id}`, { method: "DELETE" })
    load()
  }

  const handleToggleStatus = async (sub: Subscriber) => {
    const newStatus = sub.status === "active" ? "unsubscribed" : "active"
    await fetch(`/api/newsletter/subscribers/${sub._id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: newStatus }),
    })
    load()
  }

  const handleSingleAdd = async () => {
    setSingleLoading(true)
    setSingleMsg(null)
    const res = await fetch("/api/newsletter/subscribers", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: singleEmail, name: singleName }),
    })
    const json = await res.json()
    if (res.ok) {
      setSingleMsg({ type: "ok", text: "Subscriber added!" })
      setSingleEmail("")
      setSingleName("")
      load()
    } else {
      setSingleMsg({ type: "err", text: json.error ?? "Failed to add" })
    }
    setSingleLoading(false)
  }

  const handleBulkAdd = async () => {
    setBulkLoading(true)
    setBulkMsg(null)
    const res = await fetch("/api/newsletter/subscribers", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ emails: bulkText }),
    })
    const json = await res.json()
    setBulkMsg({
      type: "ok",
      text: `Added: ${json.added}, Skipped (dup): ${json.skipped}, Invalid: ${json.invalid?.length ?? 0}`,
    })
    setBulkLoading(false)
    setBulkText("")
    load()
  }

  const handleExcelFile = async (file: File) => {
    const XLSX = await import("xlsx")
    const buf = await file.arrayBuffer()
    const wb = XLSX.read(buf)
    const ws = wb.Sheets[wb.SheetNames[0]]
    const rows = XLSX.utils.sheet_to_json<Record<string, string>>(ws, { defval: "" })

    const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    const entries: Array<{ email: string; name?: string }> = []

    for (const row of rows) {
      const vals = Object.values(row)
      const keys = Object.keys(row).map((k) => k.toLowerCase())
      const emailIdx = keys.findIndex((k) =>
        k.includes("email") || k.includes("e-mail") || k.includes("mail")
      )
      const nameIdx = keys.findIndex((k) =>
        k.includes("name") || k.includes("full")
      )
      const email =
        emailIdx >= 0 ? vals[emailIdx] : vals.find((v) => EMAIL_RE.test(v)) ?? ""
      const name = nameIdx >= 0 ? vals[nameIdx] : undefined

      if (EMAIL_RE.test(email)) {
        entries.push({ email, name: name || undefined })
      }
    }

    setExcelPreview(entries.slice(0, 200))
  }

  const handleExcelUpload = async () => {
    setExcelLoading(true)
    setExcelMsg(null)
    const res = await fetch("/api/newsletter/subscribers", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ bulk: excelPreview }),
    })
    const json = await res.json()
    setExcelMsg({
      type: "ok",
      text: `Added: ${json.added}, Skipped (dup): ${json.skipped}, Invalid: ${json.invalid?.length ?? 0}`,
    })
    setExcelLoading(false)
    setExcelPreview([])
    if (fileRef.current) fileRef.current.value = ""
    load()
  }

  const formatDate = (iso?: string) =>
    iso ? new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "—"

  return (
    <div className="p-8 max-w-5xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Subscribers</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {data ? `${data.total.toLocaleString()} total` : "Loading..."}
          </p>
        </div>
        <div className="flex gap-2">
          {["", "active", "unsubscribed"].map((s) => (
            <button
              key={s}
              onClick={() => { setStatusFilter(s); setPage(1) }}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                statusFilter === s
                  ? "bg-[#0A1628] text-white"
                  : "bg-white border border-gray-200 text-gray-600 hover:border-gray-300"
              }`}
            >
              {s === "" ? "All" : s.charAt(0).toUpperCase() + s.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Add Subscribers Panel */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
        <h2 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Plus className="size-4" /> Add Subscribers
        </h2>
        <div className="flex gap-1 mb-5 bg-gray-100 p-1 rounded-lg w-fit">
          {(["single", "bulk", "excel"] as AddMode[]).map((m) => (
            <button
              key={m}
              onClick={() => setAddMode(m)}
              className={`px-4 py-1.5 rounded-md text-xs font-medium transition-colors ${
                addMode === m ? "bg-white shadow-sm text-gray-900" : "text-gray-500 hover:text-gray-700"
              }`}
            >
              {m === "single" ? "Single" : m === "bulk" ? "Comma-Separated" : "Excel Import"}
            </button>
          ))}
        </div>

        {addMode === "single" && (
          <div className="flex flex-col sm:flex-row gap-3">
            <input
              type="text"
              placeholder="Name (optional)"
              value={singleName}
              onChange={(e) => setSingleName(e.target.value)}
              className="border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-400 sm:w-48"
            />
            <input
              type="email"
              placeholder="email@example.com"
              value={singleEmail}
              onChange={(e) => setSingleEmail(e.target.value)}
              className="border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-400 flex-1"
              onKeyDown={(e) => e.key === "Enter" && singleEmail && handleSingleAdd()}
            />
            <button
              onClick={handleSingleAdd}
              disabled={singleLoading || !singleEmail}
              className="bg-[#0A1628] text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-[#0A1628]/90 disabled:opacity-50 transition-colors"
            >
              {singleLoading ? "Adding..." : "Add"}
            </button>
          </div>
        )}

        {addMode === "bulk" && (
          <div className="space-y-3">
            <textarea
              placeholder="paste@emails.com, another@email.com, more@here.com"
              value={bulkText}
              onChange={(e) => setBulkText(e.target.value)}
              rows={4}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-400 font-mono resize-none"
            />
            <button
              onClick={handleBulkAdd}
              disabled={bulkLoading || !bulkText.trim()}
              className="bg-[#0A1628] text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-[#0A1628]/90 disabled:opacity-50 transition-colors"
            >
              {bulkLoading ? "Adding..." : "Add All"}
            </button>
            {bulkMsg && (
              <p className={`text-xs font-mono ${bulkMsg.type === "ok" ? "text-green-600" : "text-red-500"}`}>
                {bulkMsg.text}
              </p>
            )}
          </div>
        )}

        {addMode === "excel" && (
          <div className="space-y-4">
            <div
              className="border-2 border-dashed border-gray-200 rounded-xl p-8 text-center hover:border-blue-300 transition-colors cursor-pointer"
              onClick={() => fileRef.current?.click()}
            >
              <Upload className="size-8 text-gray-400 mx-auto mb-2" />
              <p className="text-sm font-medium text-gray-700">
                Click to upload Excel or CSV file
              </p>
              <p className="text-xs text-gray-400 mt-1">
                .xlsx, .xls, .csv — needs an &ldquo;email&rdquo; column (auto-detected)
              </p>
              <input
                ref={fileRef}
                type="file"
                accept=".xlsx,.xls,.csv"
                className="hidden"
                onChange={(e) => {
                  const f = e.target.files?.[0]
                  if (f) handleExcelFile(f)
                }}
              />
            </div>

            {excelPreview.length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-gray-700">
                    Found {excelPreview.length} valid emails
                    {excelPreview.length === 200 && " (showing first 200)"}
                  </p>
                  <button
                    onClick={() => { setExcelPreview([]); if (fileRef.current) fileRef.current.value = "" }}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X className="size-4" />
                  </button>
                </div>
                <div className="max-h-40 overflow-y-auto bg-gray-50 rounded-lg p-3 font-mono text-xs text-gray-600 space-y-1">
                  {excelPreview.slice(0, 10).map((e, i) => (
                    <div key={i}>{e.name ? `${e.name} <${e.email}>` : e.email}</div>
                  ))}
                  {excelPreview.length > 10 && (
                    <div className="text-gray-400">+ {excelPreview.length - 10} more...</div>
                  )}
                </div>
                <button
                  onClick={handleExcelUpload}
                  disabled={excelLoading}
                  className="bg-[#0A1628] text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-[#0A1628]/90 disabled:opacity-50 transition-colors"
                >
                  {excelLoading ? "Importing..." : `Import ${excelPreview.length} Subscribers`}
                </button>
                {excelMsg && (
                  <p className={`text-xs font-mono ${excelMsg.type === "ok" ? "text-green-600" : "text-red-500"}`}>
                    {excelMsg.text}
                  </p>
                )}
              </div>
            )}
          </div>
        )}

        {addMode === "single" && singleMsg && (
          <p className={`mt-3 text-xs font-mono ${singleMsg.type === "ok" ? "text-green-600" : "text-red-500"}`}>
            {singleMsg.text}
          </p>
        )}
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-400 text-sm">Loading...</div>
        ) : !data || data.subscribers.length === 0 ? (
          <div className="p-12 text-center">
            <Users className="size-8 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 text-sm">No subscribers yet</p>
          </div>
        ) : (
          <>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50">
                  <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider hidden sm:table-cell">
                    Name
                  </th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider hidden md:table-cell">
                    Source
                  </th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider hidden md:table-cell">
                    Date
                  </th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-5 py-3" />
                </tr>
              </thead>
              <tbody>
                {data.subscribers.map((sub) => (
                  <tr key={sub._id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                    <td className="px-5 py-3.5 font-medium text-gray-900">{sub.email}</td>
                    <td className="px-5 py-3.5 text-gray-500 hidden sm:table-cell">
                      {sub.name || <span className="text-gray-300">—</span>}
                    </td>
                    <td className="px-5 py-3.5 hidden md:table-cell">
                      <span className="text-xs text-gray-400 font-mono">{sub.source || "—"}</span>
                    </td>
                    <td className="px-5 py-3.5 text-gray-500 hidden md:table-cell text-xs">
                      {formatDate(sub.subscribedAt)}
                    </td>
                    <td className="px-5 py-3.5">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                          sub.status === "active"
                            ? "bg-green-50 text-green-700"
                            : "bg-gray-100 text-gray-500"
                        }`}
                      >
                        {sub.status}
                      </span>
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-2 justify-end">
                        <button
                          onClick={() => handleToggleStatus(sub)}
                          title={sub.status === "active" ? "Unsubscribe" : "Reactivate"}
                          className="text-gray-400 hover:text-blue-500 transition-colors"
                        >
                          {sub.status === "active" ? (
                            <UserX className="size-4" />
                          ) : (
                            <UserCheck className="size-4" />
                          )}
                        </button>
                        <button
                          onClick={() => handleDelete(sub._id)}
                          title="Delete"
                          className="text-gray-400 hover:text-red-500 transition-colors"
                        >
                          <Trash2 className="size-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Pagination */}
            {data.pages > 1 && (
              <div className="flex items-center justify-between px-5 py-4 border-t border-gray-100 bg-gray-50">
                <p className="text-xs text-gray-500">
                  Page {data.page} of {data.pages} ({data.total.toLocaleString()} total)
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
    </div>
  )
}
