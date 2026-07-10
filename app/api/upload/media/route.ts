import { NextRequest, NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase/server"
import { buildPublicUrl } from "@/lib/supabase/storage"
import sharp from "sharp"

/**
 * Generic media upload for the inline site editor.
 *
 * Unlike POST /api/upload (which creates a `portfolio_items` row), this just
 * stores a file under the site-media prefix and hands back its public URL, to
 * be written into a `site_settings` JSON field. Images are optimized to webp;
 * videos are stored as-is with an optional browser-derived poster.
 */

const BUCKET = "portfolio-media"
const PREFIX = "site/uploads"
const IMMUTABLE = "31536000" // 1 year — uploaded media is content-addressed by name

export const runtime = "nodejs"
export const maxDuration = 60

type MediaUploadResponse = {
  success: boolean
  url?: string
  posterUrl?: string
  error?: string
}

function publicUrl(path: string): string {
  return buildPublicUrl(process.env.NEXT_PUBLIC_SUPABASE_URL ?? "", BUCKET, path)
}

export async function POST(request: NextRequest): Promise<NextResponse<MediaUploadResponse>> {
  try {
    const formData = await request.formData()
    const file = formData.get("file") as File | null
    const posterBlob = formData.get("poster") as File | null

    if (!file) {
      return NextResponse.json({ success: false, error: "Missing file" }, { status: 400 })
    }

    const isVideo = file.type.startsWith("video/")
    const isImage = file.type.startsWith("image/")
    if (!isVideo && !isImage) {
      return NextResponse.json(
        { success: false, error: "Only image and video files allowed" },
        { status: 400 }
      )
    }

    const timestamp = Date.now()
    const safeName = file.name.replace(/[^a-z0-9.]/gi, "-")
    const buffer = Buffer.from(await file.arrayBuffer())

    let url: string
    let posterUrl: string | undefined

    if (isImage) {
      const optimized = await sharp(buffer)
        .resize(1600, 1600, { fit: "inside", withoutEnlargement: true })
        .webp({ quality: 88 })
        .toBuffer()
      const path = `${PREFIX}/${timestamp}-${safeName}.webp`
      const { error } = await supabaseAdmin.storage
        .from(BUCKET)
        .upload(path, optimized, { contentType: "image/webp", cacheControl: IMMUTABLE })
      if (error) {
        return NextResponse.json(
          { success: false, error: `Upload failed: ${error.message}` },
          { status: 500 }
        )
      }
      url = publicUrl(path)
    } else {
      const path = `${PREFIX}/${timestamp}-${safeName}`
      const { error } = await supabaseAdmin.storage
        .from(BUCKET)
        .upload(path, buffer, { contentType: file.type, cacheControl: IMMUTABLE })
      if (error) {
        return NextResponse.json(
          { success: false, error: `Upload failed: ${error.message}` },
          { status: 500 }
        )
      }
      url = publicUrl(path)

      if (posterBlob) {
        const posterPath = `${PREFIX}/${timestamp}-${safeName}.webp`
        const { error: posterError } = await supabaseAdmin.storage
          .from(BUCKET)
          .upload(posterPath, Buffer.from(await posterBlob.arrayBuffer()), {
            contentType: posterBlob.type || "image/webp",
            cacheControl: IMMUTABLE,
          })
        if (!posterError) posterUrl = publicUrl(posterPath)
      }
    }

    return NextResponse.json({ success: true, url, posterUrl })
  } catch (error) {
    console.error("Media upload error:", error)
    return NextResponse.json({ success: false, error: "Upload failed" }, { status: 500 })
  }
}
