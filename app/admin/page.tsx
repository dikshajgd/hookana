"use client"

import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabase/client"
import { extractPoster, recordPreview } from "@/lib/video-processing"
import { Upload, Trash2, ChevronUp, ChevronDown } from "lucide-react"

type PortfolioItem = {
  id: string
  title: string
  category: "ai" | "static" | "video"
  poster_url: string
  full_url: string
  display_order: number
}

const CATEGORIES = ["ai", "static", "video"] as const

export default function AdminPage() {
  const [items, setItems] = useState<PortfolioItem[]>([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [status, setStatus] = useState<string>("")
  const [activeTab, setActiveTab] = useState<"portfolio" | "settings">("portfolio")

  useEffect(() => {
    const fetchItems = async () => {
      const { data } = await supabase
        .from("portfolio_items")
        .select("*")
        .order("display_order", { ascending: true })
      setItems(data || [])
      setLoading(false)
    }
    fetchItems()
  }, [])

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const title = prompt("Title for this item:")
    if (!title) {
      e.target.value = ""
      return
    }
    const category = prompt("Category (ai, static, or video):")?.trim().toLowerCase()
    if (!category || !CATEGORIES.includes(category as (typeof CATEGORIES)[number])) {
      alert("Invalid category. Use: ai, static, or video")
      e.target.value = ""
      return
    }

    setUploading(true)
    try {
      const formData = new FormData()
      formData.append("file", file)
      formData.append("title", title)
      formData.append("category", category)

      // For videos, derive poster + preview in the browser before upload.
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
        setStatus("")
      } else {
        alert(`Upload failed: ${result.error}`)
      }
    } catch (error) {
      alert(`Upload error: ${error}`)
    } finally {
      setUploading(false)
      setStatus("")
      e.target.value = ""
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this item?")) return
    const res = await fetch(`/api/portfolio/${id}`, { method: "DELETE" })
    const result = await res.json()
    if (result.success) {
      setItems((prev) => prev.filter((item) => item.id !== id))
    } else {
      alert(`Delete failed: ${result.error}`)
    }
  }

  const handleReorder = async (id: string, direction: "up" | "down") => {
    const idx = items.findIndex((item) => item.id === id)
    if (idx === -1) return
    if (direction === "up" && idx === 0) return
    if (direction === "down" && idx === items.length - 1) return

    const swapIdx = direction === "up" ? idx - 1 : idx + 1
    const a = items[idx]
    const b = items[swapIdx]

    // Swap display_order values and persist both via the server route.
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
    <div className="min-h-screen bg-white p-8">
      <div className="mx-auto max-w-4xl">
        <h1 className="mb-8 text-3xl font-bold">Hookana Admin</h1>

        <div className="mb-6 flex gap-4 border-b">
          {(["portfolio", "settings"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 font-medium capitalize ${
                activeTab === tab
                  ? "border-b-2 border-blue-600 text-blue-600"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {activeTab === "portfolio" && (
          <div className="space-y-8">
            <div className="rounded-lg border-2 border-dashed border-gray-300 p-8 text-center">
              <Upload className="mx-auto mb-3 h-8 w-8 text-gray-400" />
              <p className="mb-4 text-gray-600">Upload a video or image</p>
              <input
                type="file"
                accept="video/*,image/*"
                onChange={handleUpload}
                disabled={uploading}
                className="hidden"
                id="file-input"
              />
              <button
                onClick={() => document.getElementById("file-input")?.click()}
                disabled={uploading}
                className="rounded bg-blue-600 px-6 py-2 text-white hover:bg-blue-700 disabled:opacity-50"
              >
                {uploading ? status || "Uploading…" : "Select File"}
              </button>
            </div>

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
                        className="h-16 w-16 rounded object-cover"
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
                        >
                          <ChevronUp className="h-5 w-5" />
                        </button>
                        <button
                          onClick={() => handleReorder(item.id, "down")}
                          disabled={idx === items.length - 1}
                          className="rounded p-1 hover:bg-gray-100 disabled:opacity-30"
                        >
                          <ChevronDown className="h-5 w-5" />
                        </button>
                      </div>
                      <button
                        onClick={() => handleDelete(item.id)}
                        className="text-red-600 hover:text-red-800"
                      >
                        <Trash2 className="h-5 w-5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === "settings" && (
          <p className="text-gray-600">
            Settings editor coming next — for now, manage media in the Portfolio tab.
          </p>
        )}
      </div>
    </div>
  )
}
