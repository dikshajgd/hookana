/**
 * One-time migration: copy the existing Cloudinary portfolio library into
 * Supabase Storage + the portfolio_items table.
 *
 * It reuses Cloudinary's transforms one last time — the poster/preview/full
 * delivery URLs are already built in lib/portfolio-media.ts — so we just fetch
 * each derived asset and re-upload it into Supabase. No ffmpeg, no re-encoding.
 *
 * SAFETY
 *  - Writes ONLY to the `portfolio-media` bucket (under migrated/) and the
 *    `portfolio_items` table. Touches nothing else.
 *  - Dry-run by default. Pass --commit to actually write.
 *  - Pass --rollback to remove everything this script created.
 *  - Refuses to overwrite a non-empty table unless --force is given.
 *
 * Usage:
 *   set -a; . ./.env.local; set +a
 *   npx tsx scripts/migrate-portfolio.ts            # dry-run (no writes)
 *   npx tsx scripts/migrate-portfolio.ts --commit   # populate Supabase
 *   npx tsx scripts/migrate-portfolio.ts --rollback # undo
 */
import { createClient } from "@supabase/supabase-js"
import {
  PORTFOLIO_AI,
  PORTFOLIO_IMAGES,
  PORTFOLIO_VIDEOS,
  type MediaItem,
  type MediaCategory,
} from "../lib/portfolio-media"

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY
const BUCKET = "portfolio-media"
const PREFIX = "migrated"

const COMMIT = process.argv.includes("--commit")
const ROLLBACK = process.argv.includes("--rollback")
const FORCE = process.argv.includes("--force")

if (!SUPABASE_URL || !SERVICE_KEY) {
  console.error("Missing env. Run:  set -a; . ./.env.local; set +a  before this script.")
  process.exit(1)
}

const supa = createClient(SUPABASE_URL, SERVICE_KEY)

const publicUrl = (path: string) =>
  `${SUPABASE_URL}/storage/v1/object/public/${BUCKET}/${path}`

const extFor = (contentType: string) => {
  if (contentType.includes("webp")) return "webp"
  if (contentType.includes("jpeg") || contentType.includes("jpg")) return "jpg"
  if (contentType.includes("png")) return "png"
  if (contentType.includes("mp4")) return "mp4"
  if (contentType.includes("webm")) return "webm"
  return "bin"
}

const slugOf = (rawUrl: string) =>
  (rawUrl.split("/").pop() ?? "asset")
    .replace(/\.[^.]+$/, "")
    .replace(/[^a-z0-9]+/gi, "-")
    .slice(0, 60)

async function fetchAsset(url: string): Promise<{ buf: Buffer; type: string }> {
  const r = await fetch(url)
  if (!r.ok) throw new Error(`fetch ${r.status} for ${url}`)
  const type = r.headers.get("content-type") ?? "application/octet-stream"
  return { buf: Buffer.from(await r.arrayBuffer()), type }
}

async function copyToSupabase(srcUrl: string, destNoExt: string): Promise<string> {
  const { buf, type } = await fetchAsset(srcUrl)
  const path = `${destNoExt}.${extFor(type)}`
  const { error } = await supa.storage
    .from(BUCKET)
    .upload(path, buf, { contentType: type, cacheControl: "31536000", upsert: true })
  if (error) throw error
  return publicUrl(path)
}

async function rollback() {
  console.log("ROLLBACK: removing migrated rows + storage…")
  // Remove DB rows whose assets live under the migrated/ prefix.
  const { data: rows } = await supa
    .from("portfolio_items")
    .select("id, poster_url")
    .like("poster_url", `%/${PREFIX}/%`)
  const ids = (rows ?? []).map((r) => r.id)
  if (ids.length) {
    await supa.from("portfolio_items").delete().in("id", ids)
    console.log(`  deleted ${ids.length} rows`)
  }
  // Remove storage files under each migrated/<category> folder.
  for (const cat of ["ai", "static", "video"]) {
    const { data: files } = await supa.storage.from(BUCKET).list(`${PREFIX}/${cat}`, { limit: 1000 })
    const paths = (files ?? []).map((f) => `${PREFIX}/${cat}/${f.name}`)
    if (paths.length) {
      await supa.storage.from(BUCKET).remove(paths)
      console.log(`  removed ${paths.length} files from ${PREFIX}/${cat}`)
    }
  }
  console.log("ROLLBACK complete.")
}

async function migrate() {
  const groups: { cat: MediaCategory; label: string; items: MediaItem[] }[] = [
    { cat: "ai", label: "AI", items: PORTFOLIO_AI },
    { cat: "static", label: "Static", items: PORTFOLIO_IMAGES },
    { cat: "video", label: "Video", items: PORTFOLIO_VIDEOS },
  ]

  const total = groups.reduce((n, g) => n + g.items.length, 0)
  console.log(`${COMMIT ? "COMMIT" : "DRY-RUN"}: ${total} items across ai/static/video`)

  if (COMMIT) {
    const { count } = await supa
      .from("portfolio_items")
      .select("*", { count: "exact", head: true })
    if ((count ?? 0) > 0 && !FORCE) {
      console.error(`portfolio_items has ${count} rows. Re-run with --force to reseed, or --rollback first.`)
      process.exit(1)
    }
    if ((count ?? 0) > 0 && FORCE) {
      await supa.from("portfolio_items").delete().neq("id", "00000000-0000-0000-0000-000000000000")
      console.log(`  cleared ${count} existing rows (--force)`)
    }
  }

  let order = 0
  let ok = 0
  let failed = 0
  for (const g of groups) {
    let n = 0
    for (const item of g.items) {
      n++
      const slug = `${slugOf(item.id)}-${n}`
      const base = `${PREFIX}/${g.cat}/${slug}`
      const title = `${g.label} ${n}`
      try {
        if (!COMMIT) {
          console.log(`  [dry] ${g.cat}: ${title}  <- ${item.id.split("/").pop()}`)
          ok++
          order++
          continue
        }
        const poster_url = await copyToSupabase(item.poster, `${base}-poster`)
        const full_url = await copyToSupabase(item.full, `${base}-full`)
        const preview_url = item.preview
          ? await copyToSupabase(item.preview, `${base}-preview`)
          : null

        const { error } = await supa.from("portfolio_items").insert({
          title,
          category: g.cat,
          original_url: full_url,
          poster_url,
          preview_url,
          full_url,
          display_order: order,
        })
        if (error) throw error
        console.log(`  ✓ ${g.cat} ${n}/${g.items.length}: ${title}`)
        ok++
      } catch (err) {
        console.warn(`  ✗ ${g.cat} ${n}: ${err instanceof Error ? err.message : String(err)}`)
        failed++
      }
      order++
    }
  }

  console.log(`\nDone. ${ok} ok, ${failed} failed.${COMMIT ? "" : "  (dry-run — no writes)"}`)
}

;(ROLLBACK ? rollback() : migrate()).catch((e) => {
  console.error(e)
  process.exit(1)
})
