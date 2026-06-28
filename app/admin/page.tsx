"use client"

import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabase/client"
import { Upload, Trash2, ChevronUp, ChevronDown } from "lucide-react"

type PortfolioItem = {
  id: string
  title: string
  category: "ai" | "static" | "video"
  poster_url: string
  full_url: string
  display_order: number
}

export default function AdminPage() {
  const [items, setItems] = useState<PortfolioItem[]>([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [activeTab, setActiveTab] = useState<"portfolio" | "settings">("portfolio")

  // Fetch portfolio items
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

  // Handle file upload
  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const title = prompt("Enter title for this item:")
    if (!title) return

    const category = prompt("Enter category (ai, static, or video):")
    if (!["ai", "static", "video"].includes(category!)) {
      alert("Invalid category. Use: ai, static, or video")
      return
    }

    setUploading(true)

    const formData = new FormData()
    formData.append("file", file)
    formData.append("title", title)
    formData.append("category", category!)

    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      })

      const result = await res.json()

      if (result.success) {
        setItems([...items, result.data])
        alert("Upload successful!")
      } else {
        alert(`Upload failed: ${result.error}`)
      }
    } catch (error) {
      alert(`Upload error: ${error}`)
    } finally {
      setUploading(false)
      e.target.value = "" // Reset input
    }
  }

  // Delete item
  const handleDelete = async (id: string) => {
    if (!confirm("Delete this item?")) return

    const { error } = await supabase.from("portfolio_items").delete().eq("id", id)

    if (!error) {
      setItems(items.filter((item) => item.id !== id))
      alert("Deleted!")
    } else {
      alert(`Delete failed: ${error.message}`)
    }
  }

  // Reorder items
  const handleReorder = async (id: string, direction: "up" | "down") => {
    const itemIndex = items.findIndex((item) => item.id === id)
    if (itemIndex === -1) return

    if (direction === "up" && itemIndex === 0) return
    if (direction === "down" && itemIndex === items.length - 1) return

    const newItems = [...items]
    const swapIndex = direction === "up" ? itemIndex - 1 : itemIndex + 1

    // Swap display_order
    ;[newItems[itemIndex].display_order, newItems[swapIndex].display_order] = [
      newItems[swapIndex].display_order,
      newItems[itemIndex].display_order,
    ]

    const temp = newItems[itemIndex]
    newItems[itemIndex] = newItems[swapIndex]
    newItems[swapIndex] = temp

    // Update database
    await supabase
      .from("portfolio_items")
      .update({ display_order: newItems[itemIndex].display_order })
      .eq("id", newItems[itemIndex].id)

    await supabase
      .from("portfolio_items")
      .update({ display_order: newItems[swapIndex].display_order })
      .eq("id", newItems[swapIndex].id)

    setItems(newItems)
  }

  return (
    <div className="min-h-screen bg-white p-8">
      <div className="mx-auto max-w-4xl">
        <h1 className="mb-8 text-3xl font-bold">Hookana Admin</h1>

        {/* Tabs */}
        <div className="mb-6 flex gap-4 border-b">
          <button
            onClick={() => setActiveTab("portfolio")}
            className={`px-4 py-2 font-medium ${
              activeTab === "portfolio"
                ? "border-b-2 border-blue-600 text-blue-600"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            Portfolio
          </button>
          <button
            onClick={() => setActiveTab("settings")}
            className={`px-4 py-2 font-medium ${
              activeTab === "settings"
                ? "border-b-2 border-blue-600 text-blue-600"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            Settings
          </button>
        </div>

        {/* Portfolio Tab */}
        {activeTab === "portfolio" && (
          <div className="space-y-8">
            {/* Upload Section */}
            <div className="rounded-lg border-2 border-dashed border-gray-300 p-8 text-center">
              <Upload className="mx-auto mb-3 h-8 w-8 text-gray-400" />
              <p className="mb-4 text-gray-600">Drop video or image here, or click to select</p>
              <input
                type="file"
                accept="video/*,image/*"
                onChange={handleUpload}
                disabled={uploading}
                className="hidden"
                id="file-input"
              />
              <label htmlFor="file-input">
                <button
                  onClick={() => document.getElementById("file-input")?.click()}
                  disabled={uploading}
                  className="rounded bg-blue-600 px-6 py-2 text-white hover:bg-blue-700 disabled:opacity-50"
                >
                  {uploading ? "Uploading..." : "Select File"}
                </button>
              </label>
            </div>

            {/* Portfolio Items List */}
            <div>
              <h2 className="mb-4 text-xl font-bold">Portfolio Items ({items.length})</h2>

              {loading ? (
                <p className="text-gray-600">Loading...</p>
              ) : items.length === 0 ? (
                <p className="text-gray-600">No items yet. Upload your first video or image!</p>
              ) : (
                <div className="space-y-3">
                  {items.map((item, idx) => (
                    <div
                      key={item.id}
                      className="flex items-center gap-4 rounded border border-gray-200 p-4"
                    >
                      {/* Thumbnail */}
                      <img
                        src={item.poster_url}
                        alt={item.title}
                        className="h-16 w-16 rounded object-cover"
                      />

                      {/* Info */}
                      <div className="flex-1">
                        <p className="font-medium">{item.title}</p>
                        <p className="text-sm text-gray-600">{item.category}</p>
                      </div>

                      {/* Reorder Buttons */}
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

                      {/* Delete Button */}
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

        {/* Settings Tab */}
        {activeTab === "settings" && (
          <div className="space-y-6">
            <p className="text-gray-600">Settings coming soon — for now, manage content via portfolio tab.</p>
          </div>
        )}
      </div>
    </div>
  )
}
