import { NextRequest, NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase/server"

export const runtime = "nodejs"

// PATCH /api/settings — upsert one section's content into site_settings.
// Body: { key: string, value: object }
export async function PATCH(req: NextRequest) {
  let body: { key?: string; value?: unknown }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ success: false, error: "Invalid JSON" }, { status: 400 })
  }

  const { key, value } = body
  if (!key || typeof key !== "string") {
    return NextResponse.json({ success: false, error: "Missing settings key" }, { status: 400 })
  }
  if (value === null || typeof value !== "object") {
    return NextResponse.json({ success: false, error: "Value must be an object" }, { status: 400 })
  }

  const { error } = await supabaseAdmin
    .from("site_settings")
    .upsert({ key, value, updated_at: new Date().toISOString() }, { onConflict: "key" })

  if (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
