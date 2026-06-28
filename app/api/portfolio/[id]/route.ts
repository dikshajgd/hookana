import { NextRequest, NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase/server"

const BUCKET = "portfolio-media"

export const runtime = "nodejs"

/** Turn a public storage URL back into its in-bucket path for deletion. */
function storagePath(url: string | null | undefined): string | null {
  if (!url) return null
  const marker = `/storage/v1/object/public/${BUCKET}/`
  const i = url.indexOf(marker)
  return i === -1 ? null : url.slice(i + marker.length)
}

// DELETE /api/portfolio/:id — remove the row and its storage objects.
export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  const { data: item, error: fetchError } = await supabaseAdmin
    .from("portfolio_items")
    .select("original_url, poster_url, preview_url, full_url")
    .eq("id", id)
    .single()

  if (fetchError) {
    return NextResponse.json({ success: false, error: fetchError.message }, { status: 404 })
  }

  const { error: deleteError } = await supabaseAdmin.from("portfolio_items").delete().eq("id", id)
  if (deleteError) {
    return NextResponse.json({ success: false, error: deleteError.message }, { status: 500 })
  }

  // Best-effort storage cleanup so we don't leak files.
  const paths = [item.original_url, item.poster_url, item.preview_url, item.full_url]
    .map(storagePath)
    .filter((p): p is string => Boolean(p))
  if (paths.length) {
    await supabaseAdmin.storage.from(BUCKET).remove(paths).catch(() => {})
  }

  return NextResponse.json({ success: true })
}

// PATCH /api/portfolio/:id — update editable fields (title, category, display_order).
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const body = await req.json()

  const updates: Record<string, unknown> = {}
  if (typeof body.title === "string") updates.title = body.title
  if (typeof body.category === "string") updates.category = body.category
  if (typeof body.display_order === "number") updates.display_order = body.display_order

  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ success: false, error: "No valid fields to update" }, { status: 400 })
  }

  const { error } = await supabaseAdmin.from("portfolio_items").update(updates).eq("id", id)
  if (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
