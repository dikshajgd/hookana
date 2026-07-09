/**
 * One-time migration: copy newsletter data (subscribers + campaigns) out of
 * Sanity and into the Supabase `subscribers` / `newsletter_campaigns` tables.
 *
 * Standalone on purpose — it talks to Sanity over its HTTP query API (no
 * next-sanity import) so it keeps working AFTER the Sanity npm deps are removed.
 *
 * PREREQUISITE: run supabase/migrations/0001_newsletter.sql first (creates the
 * tables).
 *
 * SAFETY
 *  - Dry-run by default. Pass --commit to actually write.
 *  - Subscribers are idempotent: existing emails (case-insensitive) are skipped,
 *    so re-running is safe.
 *  - Campaigns have no natural key; if newsletter_campaigns already has rows the
 *    script refuses to touch them unless you pass --force-campaigns.
 *
 * Usage (env auto-loads from .env.local / .env):
 *   node scripts/migrate-newsletter.mjs             # dry-run
 *   node scripts/migrate-newsletter.mjs --commit    # write to Supabase
 */
import nextEnv from "@next/env"
import { createClient } from "@supabase/supabase-js"

// Load .env.local / .env exactly like Next does (no fragile shell sourcing).
nextEnv.loadEnvConfig(process.cwd())

const {
  NEXT_PUBLIC_SANITY_PROJECT_ID: SANITY_PROJECT,
  NEXT_PUBLIC_SANITY_DATASET: SANITY_DATASET = "production",
  SANITY_API_WRITE_TOKEN: SANITY_TOKEN,
  NEXT_PUBLIC_SUPABASE_URL: SUPABASE_URL,
  SUPABASE_SERVICE_ROLE_KEY: SERVICE_KEY,
} = process.env

const COMMIT = process.argv.includes("--commit")
const FORCE_CAMPAIGNS = process.argv.includes("--force-campaigns")

if (!SANITY_PROJECT || !SANITY_TOKEN) {
  console.error("Missing Sanity env (NEXT_PUBLIC_SANITY_PROJECT_ID / SANITY_API_WRITE_TOKEN).")
  console.error("Run:  set -a; . ./.env.local; set +a  before this script.")
  process.exit(1)
}
if (!SUPABASE_URL || !SERVICE_KEY) {
  console.error("Missing Supabase env (NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY).")
  process.exit(1)
}

const supa = createClient(SUPABASE_URL, SERVICE_KEY)

/** Query Sanity over HTTP, paging through results in chunks. */
async function sanityQuery(baseGroq) {
  const out = []
  const PAGE = 500
  for (let offset = 0; ; offset += PAGE) {
    const groq = `${baseGroq} | order(_createdAt asc) [${offset}...${offset + PAGE}]`
    const url = `https://${SANITY_PROJECT}.api.sanity.io/v2021-06-07/data/query/${SANITY_DATASET}?query=${encodeURIComponent(groq)}`
    const res = await fetch(url, { headers: { Authorization: `Bearer ${SANITY_TOKEN}` } })
    if (!res.ok) throw new Error(`Sanity ${res.status}: ${await res.text()}`)
    const { result } = await res.json()
    const batch = result ?? []
    out.push(...batch)
    if (batch.length < PAGE) break
  }
  return out
}

async function migrateSubscribers() {
  const docs = await sanityQuery(
    `*[_type == "subscriber"]{ _id, _createdAt, email, name, status, source, subscribedAt }`
  )
  console.log(`\nSubscribers in Sanity: ${docs.length}`)

  // Case-insensitive dedupe against whatever's already in Supabase.
  const { data: existing } = await supa.from("subscribers").select("email")
  const seen = new Set((existing ?? []).map((r) => r.email.toLowerCase()))

  let added = 0
  let skipped = 0
  const invalid = []

  for (const d of docs) {
    const email = typeof d.email === "string" ? d.email.trim() : ""
    if (!email) {
      invalid.push(d._id)
      continue
    }
    if (seen.has(email.toLowerCase())) {
      skipped++
      continue
    }

    const row = {
      email,
      name: d.name ?? null,
      status: d.status === "unsubscribed" ? "unsubscribed" : "active",
      source: d.source ?? "sanity_import",
      subscribed_at: d.subscribedAt ?? d._createdAt ?? null,
      created_at: d._createdAt ?? undefined,
    }

    if (!COMMIT) {
      console.log(`  [dry] + ${email} (${row.status})`)
      seen.add(email.toLowerCase())
      added++
      continue
    }

    const { error } = await supa.from("subscribers").insert(row)
    if (error) {
      if (error.code === "23505") skipped++
      else {
        console.warn(`  ✗ ${email}: ${error.message}`)
        invalid.push(email)
      }
    } else {
      seen.add(email.toLowerCase())
      added++
    }
  }

  console.log(`Subscribers: ${added} added, ${skipped} skipped, ${invalid.length} invalid${COMMIT ? "" : "  (dry-run)"}`)
}

async function migrateCampaigns() {
  const docs = await sanityQuery(
    `*[_type == "newsletterCampaign"]{ _id, _createdAt, title, subject, htmlContent, plainText, mode, prompt, status, sentAt, sentCount, recipientCount }`
  )
  console.log(`\nCampaigns in Sanity: ${docs.length}`)

  if (COMMIT) {
    const { count } = await supa
      .from("newsletter_campaigns")
      .select("*", { count: "exact", head: true })
    if ((count ?? 0) > 0 && !FORCE_CAMPAIGNS) {
      console.warn(`  newsletter_campaigns already has ${count} rows — skipping campaigns. Re-run with --force-campaigns to import anyway.`)
      return
    }
  }

  let added = 0
  for (const d of docs) {
    const row = {
      title: d.title ?? null,
      subject: d.subject ?? null,
      html_content: d.htmlContent ?? null,
      plain_text: d.plainText ?? null,
      mode: d.mode === "generated" ? "generated" : "manual",
      prompt: d.prompt ?? null,
      status: d.status === "sent" ? "sent" : "draft",
      sent_at: d.sentAt ?? null,
      sent_count: d.sentCount ?? 0,
      recipient_count: d.recipientCount ?? 0,
      created_at: d._createdAt ?? undefined,
    }

    if (!COMMIT) {
      console.log(`  [dry] + "${row.subject ?? "(no subject)"}" (${row.status})`)
      added++
      continue
    }

    const { error } = await supa.from("newsletter_campaigns").insert(row)
    if (error) console.warn(`  ✗ ${row.subject}: ${error.message}`)
    else added++
  }

  console.log(`Campaigns: ${added} imported${COMMIT ? "" : "  (dry-run)"}`)
}

;(async () => {
  console.log(COMMIT ? "COMMIT MODE — writing to Supabase" : "DRY-RUN — no writes (pass --commit to write)")
  await migrateSubscribers()
  await migrateCampaigns()
  console.log("\nDone.")
})().catch((e) => {
  console.error(e)
  process.exit(1)
})
