import { NextRequest, NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase/server"
import sharp from "sharp"
import ffmpeg from "fluent-ffmpeg"
import ffmpegStatic from "ffmpeg-static"
import { createWriteStream, promises as fs } from "fs"
import { join } from "path"
import { Readable } from "stream"

ffmpeg.setFfmpegPath(ffmpegStatic as string)

const BUCKET = "portfolio-media"
const TEMP_DIR = "/tmp"

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

async function extractVideoFrame(buffer: Buffer, outputPath: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const inputPath = join(TEMP_DIR, `input-${Date.now()}.mp4`)

    fs.writeFile(inputPath, buffer)
      .then(() => {
        ffmpeg(inputPath)
          .on("end", () => {
            fs.unlink(inputPath).catch(() => {})
            resolve()
          })
          .on("error", (err) => {
            fs.unlink(inputPath).catch(() => {})
            reject(err)
          })
          .screenshots({
            count: 1,
            filename: `frame.jpg`,
            folder: TEMP_DIR,
            size: "640x360",
          })
          .on("end", async () => {
            try {
              const frameData = await fs.readFile(join(TEMP_DIR, "frame.jpg"))
              await fs.writeFile(outputPath, frameData)
              await fs.unlink(join(TEMP_DIR, "frame.jpg")).catch(() => {})
            } catch (err) {
              reject(err)
            }
          })
      })
      .catch(reject)
  })
}

async function trimVideoPreview(buffer: Buffer, outputPath: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const inputPath = join(TEMP_DIR, `input-${Date.now()}.mp4`)

    fs.writeFile(inputPath, buffer)
      .then(() => {
        ffmpeg(inputPath)
          .outputOptions(["-t", "6", "-c:v", "libx264", "-crf", "28", "-c:a", "aac"])
          .output(outputPath)
          .on("end", () => {
            fs.unlink(inputPath).catch(() => {})
            resolve()
          })
          .on("error", (err) => {
            fs.unlink(inputPath).catch(() => {})
            reject(err)
          })
          .run()
      })
      .catch(reject)
  })
}

export async function POST(request: NextRequest): Promise<NextResponse<UploadResponse>> {
  try {
    const formData = await request.formData()
    const file = formData.get("file") as File
    const title = formData.get("title") as string
    const category = formData.get("category") as string

    if (!file || !title || !category) {
      return NextResponse.json(
        { success: false, error: "Missing file, title, or category" },
        { status: 400 }
      )
    }

    const buffer = Buffer.from(await file.arrayBuffer())
    const isVideo = file.type.startsWith("video/")
    const isImage = file.type.startsWith("image/")

    if (!isVideo && !isImage) {
      return NextResponse.json(
        { success: false, error: "Only image and video files allowed" },
        { status: 400 }
      )
    }

    const timestamp = Date.now()
    const filename = `${timestamp}-${file.name.replace(/[^a-z0-9.]/gi, "-")}`

    // 1. Upload original file
    const { error: uploadError } = await supabaseAdmin.storage
      .from(BUCKET)
      .upload(`originals/${filename}`, buffer, {
        contentType: file.type,
        cacheControl: "3600",
      })

    if (uploadError) {
      return NextResponse.json(
        { success: false, error: `Upload failed: ${uploadError.message}` },
        { status: 500 }
      )
    }

    const original_url = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/${BUCKET}/originals/${filename}`

    let poster_url = original_url
    let full_url = original_url
    let preview_url: string | undefined

    if (isImage) {
      // For images: generate optimized poster (small) and full (large)
      try {
        // Poster: small thumbnail (300px)
        const posterBuffer = await sharp(buffer)
          .resize(300, 300, { fit: "cover" })
          .webp({ quality: 80 })
          .toBuffer()

        const posterFilename = `${timestamp}-poster-${file.name.replace(/[^a-z0-9.]/gi, "-")}.webp`
        await supabaseAdmin.storage.from(BUCKET).upload(`posters/${posterFilename}`, posterBuffer, {
          contentType: "image/webp",
          cacheControl: "86400",
        })

        poster_url = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/${BUCKET}/posters/${posterFilename}`

        // Full: optimized large version (1280px)
        const fullBuffer = await sharp(buffer)
          .resize(1280, 1280, { fit: "inside", withoutEnlargement: true })
          .webp({ quality: 90 })
          .toBuffer()

        const fullFilename = `${timestamp}-full-${file.name.replace(/[^a-z0-9.]/gi, "-")}.webp`
        await supabaseAdmin.storage.from(BUCKET).upload(`full/${fullFilename}`, fullBuffer, {
          contentType: "image/webp",
          cacheControl: "86400",
        })

        full_url = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/${BUCKET}/full/${fullFilename}`
      } catch (err) {
        console.error("Image optimization failed:", err)
        // Fallback: use original
      }
    } else if (isVideo) {
      // For videos: extract poster + trim preview using FFmpeg
      try {
        console.log("Extracting video poster...")
        const posterPath = join(TEMP_DIR, `poster-${timestamp}.jpg`)
        await extractVideoFrame(buffer, posterPath)
        const posterBuffer = await fs.readFile(posterPath)

        const posterFilename = `${timestamp}-poster-${file.name.replace(/[^a-z0-9.]/gi, "-")}.jpg`
        await supabaseAdmin.storage.from(BUCKET).upload(`posters/${posterFilename}`, posterBuffer, {
          contentType: "image/jpeg",
          cacheControl: "86400",
        })

        poster_url = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/${BUCKET}/posters/${posterFilename}`

        await fs.unlink(posterPath).catch(() => {})

        console.log("Trimming video preview (6 seconds)...")
        const previewPath = join(TEMP_DIR, `preview-${timestamp}.mp4`)
        await trimVideoPreview(buffer, previewPath)
        const previewBuffer = await fs.readFile(previewPath)

        const previewFilename = `${timestamp}-preview-${file.name.replace(/[^a-z0-9.]/gi, "-")}.mp4`
        await supabaseAdmin.storage.from(BUCKET).upload(`previews/${previewFilename}`, previewBuffer, {
          contentType: "video/mp4",
          cacheControl: "86400",
        })

        preview_url = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/${BUCKET}/previews/${previewFilename}`

        await fs.unlink(previewPath).catch(() => {})

        full_url = original_url
      } catch (err) {
        console.error("Video processing failed:", err)
        // Fallback: use original as poster
        const placeholderBuffer = await sharp({
          create: { width: 640, height: 360, channels: 3, background: { r: 30, g: 30, b: 30 } },
        })
          .webp()
          .toBuffer()

        const posterFilename = `${timestamp}-poster-${file.name.replace(/[^a-z0-9.]/gi, "-")}.webp`
        await supabaseAdmin.storage.from(BUCKET).upload(`posters/${posterFilename}`, placeholderBuffer, {
          contentType: "image/webp",
          cacheControl: "86400",
        })

        poster_url = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/${BUCKET}/posters/${posterFilename}`
      }
    }

    // 3. Save metadata to database
    const { data, error: dbError } = await supabaseAdmin
      .from("portfolio_items")
      .insert({
        title,
        category,
        original_url,
        poster_url,
        preview_url,
        full_url,
        display_order: 0,
      })
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
    return NextResponse.json(
      { success: false, error: "Upload failed" },
      { status: 500 }
    )
  }
}
