/**
 * One-off: push the July-2026 homepage copy revision into `site_settings`.
 *
 * The public site reads its copy from Supabase, and a saved row wins outright
 * over the component's built-in FALLBACK — so the code change alone would never
 * reach production for a section that has already been published from
 * /admin/site. This patches the stored rows to match.
 *
 * Idempotent: run it twice and the second run reports "already applied". It
 * only touches the fields the tickets name; rich-text HTML in every other field
 * (headings carry <span style="font-weight: bold;"> from the inline editor) is
 * read back and written through untouched.
 *
 *   node scripts/apply-copy-updates.mjs            # apply
 *   node scripts/apply-copy-updates.mjs --dry-run  # show the diff only
 */

import { readFileSync } from "node:fs"

// --- env -------------------------------------------------------------------

function loadEnv() {
  for (const file of [".env.local", ".env"]) {
    let raw
    try {
      raw = readFileSync(file, "utf8")
    } catch {
      continue
    }
    for (const line of raw.split(/\r?\n/)) {
      const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)$/)
      if (!m) continue
      const key = m[1]
      if (process.env[key]) continue
      process.env[key] = m[2].trim().replace(/^["']|["']$/g, "")
    }
  }
}

loadEnv()

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!SUPABASE_URL || !SERVICE_KEY) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY")
  process.exit(1)
}

const DRY_RUN = process.argv.includes("--dry-run")

// --- the copy the tickets ask for ------------------------------------------

const HERO_DESCRIPTION =
  "Ad editing and design for performance teams. Brief in, launch-ready in 48 hours — hook variants included. Out of briefs? We'll pitch you a batch."

const HOW_IT_WORKS_SUBHEAD =
  "Ad editing and design for performance teams — right on the first draft."

const HOW_IT_WORKS_STEPS = [
  {
    title: "BRIEF IT.",
    body: "Send briefs via Slack, Notion, or email — we adapt to your tools.",
    caption: "Day 0",
  },
  {
    title: "OR DON'T.",
    body: "Out of briefs? We'll study your account and pitch you a concept batch instead.",
    caption: "Day 0",
  },
  {
    title: "WE BUILD IT.",
    body: "Launch-ready assets, hook variants included, in 24–48 hours.",
    caption: "24–48h",
  },
  {
    title: "YOU TEST IT.",
    body: "Launch, measure, iterate. We keep the pipeline flowing.",
    caption: "Ongoing",
  },
]

const CONTACT_FOOTER_TEXT =
  "We'll review your brand, build 2 sample concepts, and send them over with a short Loom walkthrough."

const FAQ_BRIEFS = {
  question: "Do we need to send you briefs?",
  answer:
    "No — that's the point. We study your account and pitch concepts; you approve and we produce. Briefed work is welcome too, but never required.",
}

const NO_POACH_FEATURE = { label: "No-poach guarantee", value: "In writing" }

// --- patches ---------------------------------------------------------------
// Each returns the next value, or null when the row already matches.

const PATCHES = {
  hero(value) {
    if (value.description === HERO_DESCRIPTION) return null
    return { ...value, description: HERO_DESCRIPTION }
  },

  howItWorks(value) {
    // Field-by-field, not JSON.stringify: Postgres `jsonb` normalises object key
    // order on write, so a stringify compare would never match on re-run.
    const steps = value.steps ?? []
    const stepsMatch =
      steps.length === HOW_IT_WORKS_STEPS.length &&
      steps.every((s, i) =>
        ["title", "body", "caption"].every((f) => s[f] === HOW_IT_WORKS_STEPS[i][f])
      )
    if (stepsMatch && value.subhead === HOW_IT_WORKS_SUBHEAD) return null
    return { ...value, subhead: HOW_IT_WORKS_SUBHEAD, steps: HOW_IT_WORKS_STEPS }
  },

  contact(value) {
    if (value.footerText === CONTACT_FOOTER_TEXT) return null
    return { ...value, footerText: CONTACT_FOOTER_TEXT }
  },

  faq(value) {
    const items = value.items ?? []
    if (items.some((i) => i.question === FAQ_BRIEFS.question)) return null
    return { ...value, items: [...items, FAQ_BRIEFS] }
  },

  pricing(value) {
    const tiers = value.tiers ?? []
    const idx = tiers.findIndex(
      (t) => t.id === "enterprise" || /enterprise/i.test(t.name ?? "")
    )
    if (idx === -1) {
      console.warn("  ! no Enterprise tier found — skipping the no-poach line")
      return null
    }
    const features = tiers[idx].features ?? []
    if (features.some((f) => /no-poach/i.test(f.label ?? ""))) return null
    const nextTiers = [...tiers]
    nextTiers[idx] = { ...tiers[idx], features: [...features, NO_POACH_FEATURE] }
    return { ...value, tiers: nextTiers }
  },
}

// --- run -------------------------------------------------------------------

const headers = {
  apikey: SERVICE_KEY,
  Authorization: `Bearer ${SERVICE_KEY}`,
  "Content-Type": "application/json",
}

async function fetchRows(keys) {
  const url = `${SUPABASE_URL}/rest/v1/site_settings?select=key,value&key=in.(${keys.join(",")})`
  const res = await fetch(url, { headers })
  if (!res.ok) throw new Error(`read failed (${res.status}): ${await res.text()}`)
  return res.json()
}

async function writeRow(key, value) {
  const url = `${SUPABASE_URL}/rest/v1/site_settings?key=eq.${encodeURIComponent(key)}`
  const res = await fetch(url, {
    method: "PATCH",
    headers: { ...headers, Prefer: "return=minimal" },
    body: JSON.stringify({ value }),
  })
  if (!res.ok) throw new Error(`write failed (${res.status}): ${await res.text()}`)
}

const keys = Object.keys(PATCHES)
const rows = await fetchRows(keys)
const byKey = new Map(rows.map((r) => [r.key, r.value]))

let changed = 0
let skipped = 0

for (const key of keys) {
  if (!byKey.has(key)) {
    // No saved row — the component's code FALLBACK is already live and correct.
    console.log(`- ${key}: no saved row, code default applies`)
    continue
  }
  const next = PATCHES[key](byKey.get(key))
  if (next === null) {
    console.log(`= ${key}: already applied`)
    skipped++
    continue
  }
  if (DRY_RUN) {
    console.log(`~ ${key}: would update`)
  } else {
    await writeRow(key, next)
    console.log(`✓ ${key}: updated`)
  }
  changed++
}

console.log(
  `\n${DRY_RUN ? "Dry run" : "Done"} — ${changed} section(s) ${DRY_RUN ? "pending" : "updated"}, ${skipped} already current.`
)
