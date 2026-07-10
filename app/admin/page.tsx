"use client"

import { useState, useEffect, useRef } from "react"
import { supabase } from "@/lib/supabase/client"
import { extractPoster, recordPreview } from "@/lib/video-processing"
import Link from "next/link"
import {
  Upload,
  Trash2,
  ChevronUp,
  ChevronDown,
  Wand2,
  ArrowRight,
  Pencil,
  Image as ImageIcon,
  Mail,
  Inbox,
  LogOut,
} from "lucide-react"
import { useRouter } from "next/navigation"
import { SECTIONS } from "@/lib/admin/content-schema"
import { SectionEditor } from "@/components/admin/section-editor"
import { NewsletterPanel } from "@/components/admin/hub/newsletter-panel"
import { LeadsPanel } from "@/components/admin/hub/leads-panel"

type HubSection = "site" | "portfolio" | "newsletter" | "leads"

const NAV: { key: HubSection; label: string; icon: typeof Pencil }[] = [
  { key: "site", label: "Site editor", icon: Pencil },
  { key: "portfolio", label: "Portfolio", icon: ImageIcon },
  { key: "newsletter", label: "Newsletter", icon: Mail },
  { key: "leads", label: "Leads", icon: Inbox },
]

type PortfolioItem = {
  id: string
  title: string
  category: "ai" | "static" | "video"
  poster_url: string
  full_url: string
  display_order: number
}

const CATEGORIES = ["ai", "static", "video"] as const
type Category = (typeof CATEGORIES)[number]

export default function AdminPage() {
  const [items, setItems] = useState<PortfolioItem[]>([])
  const [loading, setLoading] = useState(true)

  // Upload form state
  const [file, setFile] = useState<File | null>(null)
  const [title, setTitle] = useState("")
  const [category, setCategory] = useState<Category>("video")
  const [uploading, setUploading] = useState(false)
  const [status, setStatus] = useState("")
  const [error, setError] = useState("")
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Per-item delete confirmation
  const [confirmingDelete, setConfirmingDelete] = useState<string | null>(null)

  const [activeTab, setActiveTab] = useState<HubSection>("site")
  const router = useRouter()

  // Content editor state
  const [settings, setSettings] = useState<Record<string, any>>({})
  const [selectedSection, setSelectedSection] = useState<string>(SECTIONS[0].key)

  const handleLogout = async () => {
    await fetch("/api/newsletter/auth", { method: "DELETE" })
    router.push("/newsletter-admin/login")
    router.refresh()
  }

  useEffect(() => {
    const fetchItems = async () => {
      const { data } = await supabase
        .from("portfolio_items")
        .select("*")
        .order("display_order", { ascending: true })
      setItems(data || [])
      setLoading(false)
    }
    const fetchSettings = async () => {
      const { data } = await supabase.from("site_settings").select("key, value")
      const map: Record<string, any> = {}
      for (const row of data || []) map[row.key] = row.value
      setSettings(map)
    }
    fetchItems()
    fetchSettings()
  }, [])

  const resetForm = () => {
    setFile(null)
    setTitle("")
    setCategory("video")
    if (fileInputRef.current) fileInputRef.current.value = ""
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (!file) {
      setError("Please choose a file.")
      return
    }
    if (!title.trim()) {
      setError("Please enter a title.")
      return
    }

    setUploading(true)
    try {
      const formData = new FormData()
      formData.append("file", file)
      formData.append("title", title.trim())
      formData.append("category", category)

      if (file.type.startsWith("video/")) {
        setStatus("Generating poster…")
        try {
          const poster = await extractPoster(file)
          formData.append("poster", poster, "poster.webp")
        } catch (err) {
          console.warn("Poster generation failed, server will fall back:", err)
        }

        setStatus("Recording preview clip…")
        try {
          const preview = await recordPreview(file)
          if (preview) {
            const ext = preview.type.includes("mp4") ? "mp4" : "webm"
            formData.append("preview", preview, `preview.${ext}`)
          }
        } catch (err) {
          console.warn("Preview generation failed, skipping:", err)
        }
      }

      setStatus("Uploading…")
      const res = await fetch("/api/upload", { method: "POST", body: formData })
      const result = await res.json()

      if (result.success) {
        setItems((prev) => [...prev, result.data])
        resetForm()
      } else {
        setError(result.error || "Upload failed")
      }
    } catch (err) {
      setError(`Upload error: ${err instanceof Error ? err.message : String(err)}`)
    } finally {
      setUploading(false)
      setStatus("")
    }
  }

  const handleDelete = async (id: string) => {
    const res = await fetch(`/api/portfolio/${id}`, { method: "DELETE" })
    const result = await res.json()
    if (result.success) {
      setItems((prev) => prev.filter((item) => item.id !== id))
    } else {
      setError(`Delete failed: ${result.error}`)
    }
    setConfirmingDelete(null)
  }

  const handleReorder = async (id: string, direction: "up" | "down") => {
    const idx = items.findIndex((item) => item.id === id)
    if (idx === -1) return
    if (direction === "up" && idx === 0) return
    if (direction === "down" && idx === items.length - 1) return

    const swapIdx = direction === "up" ? idx - 1 : idx + 1
    const a = items[idx]
    const b = items[swapIdx]

    const newItems = [...items]
    newItems[idx] = { ...b, display_order: a.display_order }
    newItems[swapIdx] = { ...a, display_order: b.display_order }
    newItems.sort((x, y) => x.display_order - y.display_order)
    setItems(newItems)

    await Promise.all([
      fetch(`/api/portfolio/${a.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ display_order: b.display_order }),
      }),
      fetch(`/api/portfolio/${b.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ display_order: a.display_order }),
      }),
    ])
  }

  return (
    <div className="flex min-h-screen bg-gray-50 text-neutral-900">
      {/* Sidebar */}
      <aside className="sticky top-0 flex h-screen w-56 shrink-0 flex-col border-r border-gray-200 bg-white">
        <div className="border-b border-gray-100 p-5">
          <p className="font-mono text-sm font-bold tracking-widest">HOOKANA</p>
          <p className="mt-0.5 text-[10px] tracking-wider text-gray-400 uppercase">Admin</p>
        </div>
        <nav className="flex flex-1 flex-col gap-1 p-3">
          {NAV.map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => setActiveTab(key)}
              className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                activeTab === key
                  ? "bg-gray-900 text-white"
                  : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
              }`}
            >
              <Icon className="size-4 shrink-0" />
              {label}
            </button>
          ))}
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

      {/* Main */}
      <main className="min-w-0 flex-1 p-6 sm:p-8">
        <div className="mx-auto max-w-5xl">
          {activeTab === "newsletter" && <NewsletterPanel />}
          {activeTab === "leads" && <LeadsPanel />}

          {activeTab === "portfolio" && (
          <div className="space-y-8">
            {/* Upload form */}
            <form
              onSubmit={handleSubmit}
              className="space-y-4 rounded-lg border border-gray-200 p-6"
            >
              <h2 className="flex items-center gap-2 text-lg font-semibold">
                <Upload className="h-5 w-5" /> Add to portfolio
              </h2>

              <div>
                <label className="mb-1 block text-sm font-medium">File (video or image)</label>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="video/*,image/*"
                  onChange={(e) => setFile(e.target.files?.[0] ?? null)}
                  disabled={uploading}
                  className="block w-full text-sm file:mr-4 file:rounded file:border-0 file:bg-blue-600 file:px-4 file:py-2 file:text-white hover:file:bg-blue-700"
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-sm font-medium">Title</label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    disabled={uploading}
                    placeholder="e.g. Nutri UGC — June"
                    className="w-full rounded border border-gray-300 px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium">Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as Category)}
                    disabled={uploading}
                    className="w-full rounded border border-gray-300 px-3 py-2 text-sm"
                  >
                    {CATEGORIES.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {error && <p className="text-sm text-red-600">{error}</p>}

              <button
                type="submit"
                disabled={uploading}
                className="rounded bg-blue-600 px-6 py-2 text-white hover:bg-blue-700 disabled:opacity-50"
              >
                {uploading ? status || "Uploading…" : "Upload"}
              </button>
            </form>

            {/* Items list */}
            <div>
              <h2 className="mb-4 text-xl font-bold">Portfolio Items ({items.length})</h2>
              {loading ? (
                <p className="text-gray-600">Loading…</p>
              ) : items.length === 0 ? (
                <p className="text-gray-600">No items yet. Upload your first video or image!</p>
              ) : (
                <div className="space-y-3">
                  {items.map((item, idx) => (
                    <div
                      key={item.id}
                      className="flex items-center gap-4 rounded border border-gray-200 p-4"
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={item.poster_url}
                        alt={item.title}
                        className="h-16 w-16 rounded bg-gray-100 object-cover"
                      />
                      <div className="flex-1">
                        <p className="font-medium">{item.title}</p>
                        <p className="text-sm text-gray-600">{item.category}</p>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleReorder(item.id, "up")}
                          disabled={idx === 0}
                          className="rounded p-1 hover:bg-gray-100 disabled:opacity-30"
                          aria-label="Move up"
                        >
                          <ChevronUp className="h-5 w-5" />
                        </button>
                        <button
                          onClick={() => handleReorder(item.id, "down")}
                          disabled={idx === items.length - 1}
                          className="rounded p-1 hover:bg-gray-100 disabled:opacity-30"
                          aria-label="Move down"
                        >
                          <ChevronDown className="h-5 w-5" />
                        </button>
                      </div>
                      {confirmingDelete === item.id ? (
                        <div className="flex items-center gap-2 text-sm">
                          <button
                            onClick={() => handleDelete(item.id)}
                            className="rounded bg-red-600 px-2 py-1 text-white hover:bg-red-700"
                          >
                            Confirm
                          </button>
                          <button
                            onClick={() => setConfirmingDelete(null)}
                            className="rounded px-2 py-1 hover:bg-gray-100"
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => setConfirmingDelete(item.id)}
                          className="text-red-600 hover:text-red-800"
                          aria-label="Delete"
                        >
                          <Trash2 className="h-5 w-5" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === "site" && (
          <div className="space-y-8">
            <div>
              <h2 className="text-xl font-bold text-gray-900">Site editor</h2>
              <p className="mt-1 text-sm text-gray-500">
                Edit the public homepage — text, images and videos — in place.
              </p>
            </div>
            {/* Primary: the visual, in-place site editor */}
            <Link
              href="/admin/site"
              className="flex items-center justify-between gap-4 rounded-xl border border-neutral-900 bg-neutral-900 p-6 text-white transition-colors hover:bg-neutral-800"
            >
              <div className="flex items-start gap-3">
                <Wand2 className="mt-0.5 h-6 w-6 shrink-0" />
                <div>
                  <h2 className="text-lg font-semibold">Open the visual site editor</h2>
                  <p className="mt-1 text-sm text-neutral-300">
                    Edit the homepage exactly as it looks — click any text to rewrite it, and hover
                    any card, logo or video to upload a replacement.
                  </p>
                </div>
              </div>
              <span className="hidden shrink-0 items-center gap-1.5 rounded-md bg-white px-4 py-2 text-sm font-semibold text-neutral-900 sm:flex">
                Open editor <ArrowRight className="h-4 w-4" />
              </span>
            </Link>

            {/* Fallback: the field-by-field form editor */}
            <details className="rounded-lg border border-gray-200">
              <summary className="cursor-pointer px-6 py-4 text-sm font-medium text-gray-700">
                Advanced: edit sections as a form
              </summary>
              <div className="flex flex-col gap-8 border-t border-gray-200 p-6 md:flex-row">
                {/* Section list */}
                <nav className="flex shrink-0 flex-col gap-1 md:w-64">
                  {SECTIONS.map((s) => (
                    <button
                      key={s.key}
                      onClick={() => setSelectedSection(s.key)}
                      className={`rounded px-3 py-2 text-left text-sm ${
                        selectedSection === s.key
                          ? "bg-blue-50 font-medium text-blue-700"
                          : "text-gray-700 hover:bg-gray-100"
                      }`}
                    >
                      {s.label}
                    </button>
                  ))}
                </nav>

                {/* Editor for the selected section */}
                <div className="min-w-0 flex-1">
                  {SECTIONS.filter((s) => s.key === selectedSection).map((s) => (
                    <SectionEditor
                      key={s.key}
                      section={s}
                      initial={settings[s.key]}
                      onSaved={(v) => setSettings((prev) => ({ ...prev, [s.key]: v }))}
                    />
                  ))}
                </div>
              </div>
            </details>
          </div>
        )}
        </div>
      </main>
    </div>
  )
}
