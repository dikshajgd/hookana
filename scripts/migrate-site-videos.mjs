/**
 * One-time migration: pull the hardcoded Cloudinary videos used by the homepage
 * (hero carousel + testimonial) and re-host them on Supabase Storage, WITHOUT
 * deleting anything from Cloudinary.
 *
 * Why fetch the *transformed* URLs and not the raw originals:
 * the components render Cloudinary's on-the-fly output — cldVideo() serves a
 * short, web-optimized (q_auto:eco, du_5) clip and cldPoster() a JPG still.
 * Supabase Storage does no transforms, so we store exactly what Cloudinary
 * currently delivers. That keeps file sizes + playback identical after cutover.
 *
 * Output: uploads to the `portfolio-media` bucket under `site/`, and writes the
 * old→new URL map to scripts/site-media-map.json so the component swap is
 * deterministic (no guessing Supabase URLs).
 *
 * SAFETY
 *  - Dry-run by default; pass --commit to upload.
 *  - Uploads use upsert, so re-running is idempotent.
 *  - Never touches Cloudinary. Never deletes anything.
 *
 * Usage (env auto-loads from .env.local / .env):
 *   node scripts/migrate-site-videos.mjs            # dry-run
 *   node scripts/migrate-site-videos.mjs --commit   # upload + write map
 */
import { writeFileSync } from "node:fs"
import { fileURLToPath } from "node:url"
import { dirname, join } from "node:path"
import nextEnv from "@next/env"
import { createClient } from "@supabase/supabase-js"

// Load .env.local / .env exactly like Next does (no fragile shell sourcing).
nextEnv.loadEnvConfig(process.cwd())

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY
const BUCKET = "portfolio-media"
const PREFIX = "site"
const COMMIT = process.argv.includes("--commit")

const VIDEO_W = 1080
const POSTER_W = 720

if (!SUPABASE_URL || !SERVICE_KEY) {
  console.error("Missing Supabase env. Run:  set -a; . ./.env.local; set +a  first.")
  process.exit(1)
}
const supa = createClient(SUPABASE_URL, SERVICE_KEY)
const publicUrl = (path) => `${SUPABASE_URL}/storage/v1/object/public/${BUCKET}/${path}`

// ─── Mirror of lib/cloudinary.ts (kept in sync by hand — small + stable) ──────
const UPLOAD_MARKER = "/upload/"
function insertTransform(url, transform) {
  if (!url.includes("res.cloudinary.com")) return url
  const i = url.indexOf(UPLOAD_MARKER)
  if (i === -1) return url
  const head = url.slice(0, i + UPLOAD_MARKER.length)
  const tail = url.slice(i + UPLOAD_MARKER.length)
  if (/^[a-z]_[^/]+\//i.test(tail)) return url
  return `${head}${transform}/${tail}`
}
const cldVideo = (url, w = 720) =>
  insertTransform(url, `f_auto,q_auto:eco,vc_auto,c_limit,w_${w},du_5`)
const cldPoster = (url, w = 720) => {
  if (!url.includes("res.cloudinary.com")) return url.replace(/\.mp4$/i, ".jpg")
  return insertTransform(url, `f_jpg,q_auto,c_limit,w_${w},so_0`).replace(/\.mp4$/i, ".jpg")
}

// ─── Source assets (the hardcoded Cloudinary URLs in the components) ──────────
const HERO_VIDEOS = [
  "https://res.cloudinary.com/ddbynpktj/video/upload/v1779285205/web_1_neyohx.mp4",
  "https://res.cloudinary.com/ddbynpktj/video/upload/v1779285220/web_2_jqspsb.mp4",
  "https://res.cloudinary.com/ddbynpktj/video/upload/v1779285217/web_3__srdr8v.mp4",
  "https://res.cloudinary.com/ddbynpktj/video/upload/v1779285224/web_4_hskvt6.mp4",
  "https://res.cloudinary.com/ddbynpktj/video/upload/v1779285194/web_5_u6jm0u.mp4",
  "https://res.cloudinary.com/ddbynpktj/video/upload/v1779285212/web_6__w4q8zh.mp4",
  "https://res.cloudinary.com/ddbynpktj/video/upload/v1779285213/web_7_mp8jqo.mp4",
  "https://res.cloudinary.com/ddbynpktj/video/upload/v1779285199/web_8_b8kyka.mp4",
  "https://res.cloudinary.com/ddbynpktj/video/upload/v1779285217/web_9_bvyerz.mp4",
  "https://res.cloudinary.com/ddbynpktj/video/upload/v1779285219/web_10_nuhkfe.mp4",
  "https://res.cloudinary.com/ddbynpktj/video/upload/v1779285216/web_11_wdxwuy.mp4",
]
const TESTIMONIAL_VIDEOS = [
  "https://res.cloudinary.com/ddbynpktj/video/upload/v1778666335/Testimonials_Deeanimators_qkytj7.mp4",
]

const slugOf = (url) =>
  (url.split("/").pop() ?? "asset").replace(/\.[^.]+$/, "").replace(/[^a-z0-9]+/gi, "-").slice(0, 60)

async function fetchBytes(url) {
  const r = await fetch(url)
  if (!r.ok) throw new Error(`fetch ${r.status} for ${url}`)
  const type = r.headers.get("content-type") ?? "application/octet-stream"
  return { buf: Buffer.from(await r.arrayBuffer()), type }
}

async function upload(path, buf, contentType) {
  const { error } = await supa.storage
    .from(BUCKET)
    .upload(path, buf, { contentType, cacheControl: "31536000", upsert: true })
  if (error) throw error
  return publicUrl(path)
}

async function migrateGroup(group, urls, map) {
  console.log(`\n${group}: ${urls.length} video(s)`)
  let n = 0
  for (const src of urls) {
    n++
    const slug = `${slugOf(src)}`
    const videoSrc = cldVideo(src, VIDEO_W)
    const posterSrc = cldPoster(src, POSTER_W)

    if (!COMMIT) {
      console.log(`  [dry] ${group} ${n}: ${slug}`)
      console.log(`        video  <- ${videoSrc}`)
      console.log(`        poster <- ${posterSrc}`)
      map[src] = { video: `(dry) ${PREFIX}/${group}/${slug}.mp4`, poster: `(dry) ${PREFIX}/${group}/${slug}.jpg` }
      continue
    }

    const v = await fetchBytes(videoSrc)
    const videoUrl = await upload(`${PREFIX}/${group}/${slug}.mp4`, v.buf, "video/mp4")
    const p = await fetchBytes(posterSrc)
    const posterUrl = await upload(`${PREFIX}/${group}/${slug}.jpg`, p.buf, "image/jpeg")

    map[src] = { video: videoUrl, poster: posterUrl }
    console.log(`  ✓ ${group} ${n}/${urls.length}: ${slug}`)
  }
}

;(async () => {
  console.log(COMMIT ? "COMMIT — uploading to Supabase" : "DRY-RUN — no writes (pass --commit)")
  const map = {}
  await migrateGroup("hero", HERO_VIDEOS, map)
  await migrateGroup("testimonial", TESTIMONIAL_VIDEOS, map)

  const outPath = join(dirname(fileURLToPath(import.meta.url)), "site-media-map.json")
  if (COMMIT) {
    writeFileSync(outPath, JSON.stringify(map, null, 2))
    console.log(`\nWrote URL map -> ${outPath}`)
  } else {
    console.log(`\n(dry-run) would write URL map -> ${outPath}`)
  }
  console.log("Done.")
})().catch((e) => {
  console.error(e)
  process.exit(1)
})
