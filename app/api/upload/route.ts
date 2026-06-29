import { NextRequest, NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase/server"
import { buildPublicUrl } from "@/lib/supabase/storage"
import sharp from "sharp"

const BUCKET = "portfolio-media"

export const runtime = "nodejs"
export const maxDuration = 60

type UploadResponse = {
  success: boolean
  data?: {
    id: string
    title: string
    category: string
    original_url: string
    poster_url: string
    preview_url?: string
    full_url: string
  }
  error?: string
}

function publicUrl(path: string): string {
  return buildPublicUrl(process.env.NEXT_PUBLIC_SUPABASE_URL ?? "", BUCKET, path)
}

const IMMUTABLE = "31536000" // 1 year — media never changes once uploaded

/**
 * Receives an already-processed upload.
 *
 * Videos: the browser does the heavy lifting (poster via <canvas>, a short
 * preview clip via MediaRecorder) and sends `poster` + `preview` blobs alongside
 * the original. The server only stores them — so this route runs anywhere,
 * including Vercel, with no ffmpeg binary.
 *
 * Images: the browser just sends the original; the server makes an optimized
 * poster + full with sharp (sharp deploys fine on serverless).
 */
export async function POST(request: NextRequest): Promise<NextResponse<UploadResponse>> {
  try {
    const formData = await request.formData()
    const file = formData.get("file") as File | null
    const title = formData.get("title") as string | null
    const category = formData.get("category") as string | null
    const posterBlob = formData.get("poster") as File | null
    const previewBlob = formData.get("preview") as File | null

    if (!file || !title || !category) {
      return NextResponse.json(
        { success: false, error: "Missing file, title, or category" },
        { status: 400 }
      )
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

    // 1. Store the original. For video this is also the lightbox ("full") source,
    //    served with range requests + long cache by the Supabase CDN.
    const originalPath = `originals/${timestamp}-${safeName}`
    const { error: uploadError } = await supabaseAdmin.storage
      .from(BUCKET)
      .upload(originalPath, buffer, { contentType: file.type, cacheControl: IMMUTABLE })

    if (uploadError) {
      return NextResponse.json(
        { success: false, error: `Upload failed: ${uploadError.message}` },
        { status: 500 }
      )
    }

    const original_url = publicUrl(originalPath)
    let poster_url = original_url
    let full_url = original_url
    let preview_url: string | undefined

    if (isImage) {
      // Poster: small webp for the grid.
      const poster = await sharp(buffer)
        .resize(640, 640, { fit: "inside", withoutEnlargement: true })
        .webp({ quality: 80 })
        .toBuffer()
      const posterPath = `posters/${timestamp}-${safeName}.webp`
      await supabaseAdmin.storage
        .from(BUCKET)
        .upload(posterPath, poster, { contentType: "image/webp", cacheControl: IMMUTABLE })
      poster_url = publicUrl(posterPath)

      // Full: optimized large webp for the lightbox.
      const full = await sharp(buffer)
        .resize(1280, 1280, { fit: "inside", withoutEnlargement: true })
        .webp({ quality: 90 })
        .toBuffer()
      const fullPath = `full/${timestamp}-${safeName}.webp`
      await supabaseAdmin.storage
        .from(BUCKET)
        .upload(fullPath, full, { contentType: "image/webp", cacheControl: IMMUTABLE })
      full_url = publicUrl(fullPath)
    } else {
      // Video: store the browser-generated poster + preview if present.
      if (posterBlob) {
        const posterPath = `posters/${timestamp}-${safeName}.webp`
        await supabaseAdmin.storage
          .from(BUCKET)
          .upload(posterPath, Buffer.from(await posterBlob.arrayBuffer()), {
            contentType: posterBlob.type || "image/webp",
            cacheControl: IMMUTABLE,
          })
        poster_url = publicUrl(posterPath)
      }

      if (previewBlob) {
        const ext = previewBlob.type.includes("mp4") ? "mp4" : "webm"
        const previewPath = `previews/${timestamp}-${safeName}.${ext}`
        await supabaseAdmin.storage
          .from(BUCKET)
          .upload(previewPath, Buffer.from(await previewBlob.arrayBuffer()), {
            contentType: previewBlob.type || "video/webm",
            cacheControl: IMMUTABLE,
          })
        preview_url = publicUrl(previewPath)
      }

      // Full = the original, streamed from the CDN.
      full_url = original_url
    }

    const { data, error: dbError } = await supabaseAdmin
      .from("portfolio_items")
      .insert({ title, category, original_url, poster_url, preview_url, full_url, display_order: timestamp })
      .select()
      .single()

    if (dbError) {
      return NextResponse.json(
        { success: false, error: `Database error: ${dbError.message}` },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      data: {
        id: data.id,
        title: data.title,
        category: data.category,
        original_url: data.original_url,
        poster_url: data.poster_url,
        preview_url: data.preview_url,
        full_url: data.full_url,
      },
    })
  } catch (error) {
    console.error("Upload error:", error)
    return NextResponse.json({ success: false, error: "Upload failed" }, { status: 500 })
  }
}
