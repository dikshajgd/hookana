/**
 * Newsletter data layer — backed by Supabase (migrated off Sanity).
 *
 * The public surface (function names + returned Subscriber/Campaign shapes) is
 * unchanged from the old Sanity implementation, so every /api/newsletter/*
 * route and the admin UI keep working without edits. Column <-> field mapping
 * and validation live in the pure, unit-tested lib/newsletter-transform.ts.
 */
import { supabaseAdmin } from "@/lib/supabase/server"
import {
  rowToSubscriber,
  rowToCampaign,
  isValidEmail,
  pageRange,
  pageCount,
  emailIlikePattern,
  campaignUpdateToColumns,
  type Subscriber,
  type Campaign,
  type SubscriberRow,
  type CampaignRow,
} from "@/lib/newsletter-transform"

export type { Subscriber, Campaign } from "@/lib/newsletter-transform"

const PAGE_SIZE = 25
const SUBSCRIBERS = "subscribers"
const CAMPAIGNS = "newsletter_campaigns"

// Postgres unique-violation error code (raised by the lower(email) index).
const UNIQUE_VIOLATION = "23505"

// ─── Subscribers ─────────────────────────────────────────────────────────────

export async function getSubscribers(page = 1, status?: string) {
  const [from, to] = pageRange(page, PAGE_SIZE)
  let query = supabaseAdmin
    .from(SUBSCRIBERS)
    .select("*", { count: "exact" })
    .order("subscribed_at", { ascending: false })
    .range(from, to)

  if (status) query = query.eq("status", status)

  const { data, count, error } = await query
  if (error) {
    console.error("getSubscribers:", error.message)
    return { subscribers: [] as Subscriber[], total: 0, pages: 0, page }
  }

  const total = count ?? 0
  return {
    subscribers: (data as SubscriberRow[]).map(rowToSubscriber),
    total,
    pages: pageCount(total, PAGE_SIZE),
    page,
  }
}

export async function addSubscriber(
  email: string,
  name?: string,
  source = "manual"
): Promise<Subscriber> {
  // Rely on the case-insensitive unique index rather than a pre-check, so this
  // is race-free and doesn't misfire on emails containing `_`.
  const { data, error } = await supabaseAdmin
    .from(SUBSCRIBERS)
    .insert({
      email,
      name,
      status: "active",
      source,
      subscribed_at: new Date().toISOString(),
    })
    .select()
    .single()

  if (error) {
    if (error.code === UNIQUE_VIOLATION) throw new Error("Email already subscribed")
    throw new Error(error.message)
  }
  return rowToSubscriber(data as SubscriberRow)
}

export async function bulkAddSubscribers(
  entries: Array<{ email: string; name?: string }>,
  source = "bulk_import"
) {
  const { data: existing } = await supabaseAdmin.from(SUBSCRIBERS).select("email")
  const existingSet = new Set(
    ((existing as { email: string }[]) ?? []).map((e) => e.email.toLowerCase())
  )

  let added = 0
  let skipped = 0
  const invalid: string[] = []
  const now = new Date().toISOString()

  for (const { email, name } of entries) {
    if (!isValidEmail(email)) {
      invalid.push(email)
      continue
    }
    const key = email.toLowerCase()
    if (existingSet.has(key)) {
      skipped++
      continue
    }

    const { error } = await supabaseAdmin.from(SUBSCRIBERS).insert({
      email,
      name,
      status: "active",
      source,
      subscribed_at: now,
    })

    if (error) {
      // Unique-violation from a concurrent insert counts as a skip, not invalid.
      if (error.code === UNIQUE_VIOLATION) skipped++
      else invalid.push(email)
    } else {
      existingSet.add(key)
      added++
    }
  }

  return { added, skipped, invalid }
}

export async function deleteSubscriber(id: string) {
  const { error } = await supabaseAdmin.from(SUBSCRIBERS).delete().eq("id", id)
  if (error) throw new Error(error.message)
  return { success: true }
}

export async function updateSubscriberStatus(
  id: string,
  status: "active" | "unsubscribed"
) {
  const { error } = await supabaseAdmin.from(SUBSCRIBERS).update({ status }).eq("id", id)
  if (error) throw new Error(error.message)
  return { success: true }
}

/**
 * Flip a subscriber to unsubscribed by email (case-insensitive, exact).
 * Returns false if no matching subscriber exists.
 */
export async function unsubscribeByEmail(email: string): Promise<boolean> {
  const { data, error } = await supabaseAdmin
    .from(SUBSCRIBERS)
    .select("id, email")
    .ilike("email", emailIlikePattern(email))

  if (error) throw new Error(error.message)

  const target = (data as { id: string; email: string }[] | null)?.find(
    (r) => r.email.toLowerCase() === email.toLowerCase()
  )
  if (!target) return false

  const { error: updateError } = await supabaseAdmin
    .from(SUBSCRIBERS)
    .update({ status: "unsubscribed" })
    .eq("id", target.id)
  if (updateError) throw new Error(updateError.message)
  return true
}

export async function getActiveSubscribers() {
  const { data, error } = await supabaseAdmin
    .from(SUBSCRIBERS)
    .select("id, email, name")
    .eq("status", "active")

  if (error) {
    console.error("getActiveSubscribers:", error.message)
    return [] as Array<{ _id: string; email: string; name?: string }>
  }

  return ((data as { id: string; email: string; name: string | null }[]) ?? []).map((r) => ({
    _id: r.id,
    email: r.email,
    name: r.name ?? undefined,
  }))
}

async function countSubscribers(status?: "active" | "unsubscribed"): Promise<number> {
  let query = supabaseAdmin.from(SUBSCRIBERS).select("*", { count: "exact", head: true })
  if (status) query = query.eq("status", status)
  const { count } = await query
  return count ?? 0
}

export async function getSubscriberStats() {
  const [total, active, unsubscribed] = await Promise.all([
    countSubscribers(),
    countSubscribers("active"),
    countSubscribers("unsubscribed"),
  ])
  return { total, active, unsubscribed }
}

/** Monthly sign-ups + running total, oldest→newest, for a growth chart. */
export async function getSubscriberGrowth() {
  const { data, error } = await supabaseAdmin
    .from(SUBSCRIBERS)
    .select("subscribed_at")
    .order("subscribed_at", { ascending: true })
    .limit(5000)

  if (error) {
    console.error("getSubscriberGrowth:", error.message)
    return [] as Array<{ month: string; added: number; total: number }>
  }

  const buckets = new Map<string, number>()
  for (const row of (data as { subscribed_at: string | null }[]) ?? []) {
    if (!row.subscribed_at) continue
    const d = new Date(row.subscribed_at)
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`
    buckets.set(key, (buckets.get(key) ?? 0) + 1)
  }

  let total = 0
  return [...buckets.keys()]
    .sort()
    .map((month) => {
      const added = buckets.get(month) ?? 0
      total += added
      return { month, added, total }
    })
}

/** Sign-up count grouped by acquisition source, largest first. */
export async function getSubscriberSources() {
  const { data, error } = await supabaseAdmin.from(SUBSCRIBERS).select("source").limit(5000)
  if (error) {
    console.error("getSubscriberSources:", error.message)
    return [] as Array<{ source: string; count: number }>
  }

  const counts = new Map<string, number>()
  for (const row of (data as { source: string | null }[]) ?? []) {
    const source = row.source || "unknown"
    counts.set(source, (counts.get(source) ?? 0) + 1)
  }

  return [...counts.entries()]
    .map(([source, count]) => ({ source, count }))
    .sort((a, b) => b.count - a.count)
}

// ─── Campaigns ───────────────────────────────────────────────────────────────

export async function getCampaigns(page = 1) {
  const [from, to] = pageRange(page, PAGE_SIZE)
  const { data, count, error } = await supabaseAdmin
    .from(CAMPAIGNS)
    .select("*", { count: "exact" })
    .order("created_at", { ascending: false })
    .range(from, to)

  if (error) {
    console.error("getCampaigns:", error.message)
    return { campaigns: [] as Campaign[], total: 0, pages: 0, page }
  }

  const total = count ?? 0
  return {
    campaigns: (data as CampaignRow[]).map(rowToCampaign),
    total,
    pages: pageCount(total, PAGE_SIZE),
    page,
  }
}

export async function getCampaign(id: string): Promise<Campaign | null> {
  const { data, error } = await supabaseAdmin
    .from(CAMPAIGNS)
    .select("*")
    .eq("id", id)
    .maybeSingle()

  if (error || !data) return null
  return rowToCampaign(data as CampaignRow)
}

export async function createCampaign(data: {
  title?: string
  subject: string
  htmlContent: string
  plainText: string
  mode: "manual" | "generated"
  prompt?: string
}): Promise<Campaign> {
  const { data: row, error } = await supabaseAdmin
    .from(CAMPAIGNS)
    .insert({
      title: data.title,
      subject: data.subject,
      html_content: data.htmlContent,
      plain_text: data.plainText,
      mode: data.mode,
      prompt: data.prompt,
      status: "draft",
      sent_count: 0,
      recipient_count: 0,
    })
    .select()
    .single()

  if (error) throw new Error(error.message)
  return rowToCampaign(row as CampaignRow)
}

export async function updateCampaign(
  id: string,
  data: Partial<{ title: string; subject: string; htmlContent: string; plainText: string; prompt: string }>
): Promise<Campaign | null> {
  const columns = campaignUpdateToColumns(data as Record<string, unknown>)
  if (Object.keys(columns).length === 0) return getCampaign(id)

  const { data: row, error } = await supabaseAdmin
    .from(CAMPAIGNS)
    .update(columns)
    .eq("id", id)
    .select()
    .single()

  if (error) throw new Error(error.message)
  return rowToCampaign(row as CampaignRow)
}

export async function markCampaignSent(id: string, sentCount: number, recipientCount: number) {
  const { error } = await supabaseAdmin
    .from(CAMPAIGNS)
    .update({
      status: "sent",
      sent_at: new Date().toISOString(),
      sent_count: sentCount,
      recipient_count: recipientCount,
    })
    .eq("id", id)
  if (error) throw new Error(error.message)
  return { success: true }
}

export async function deleteCampaign(id: string) {
  const { error } = await supabaseAdmin.from(CAMPAIGNS).delete().eq("id", id)
  if (error) throw new Error(error.message)
  return { success: true }
}

async function countCampaigns(status?: "draft" | "sent"): Promise<number> {
  let query = supabaseAdmin.from(CAMPAIGNS).select("*", { count: "exact", head: true })
  if (status) query = query.eq("status", status)
  const { count } = await query
  return count ?? 0
}

export async function getCampaignStats() {
  const [total, sent, draft] = await Promise.all([
    countCampaigns(),
    countCampaigns("sent"),
    countCampaigns("draft"),
  ])

  const { data: last } = await supabaseAdmin
    .from(CAMPAIGNS)
    .select("sent_at, title, subject")
    .eq("status", "sent")
    .order("sent_at", { ascending: false })
    .limit(1)
    .maybeSingle()

  const lastCampaign = last
    ? { sentAt: (last as { sent_at: string }).sent_at, title: (last as { title: string | null }).title ?? undefined, subject: (last as { subject: string | null }).subject ?? "" }
    : null

  return { total, sent, draft, lastCampaign }
}

// ─── Rate Limiting ────────────────────────────────────────────────────────────

const DAILY_LIMIT = Number(process.env.NEWSLETTER_DAILY_LIMIT ?? "1000")

export async function getDailyStats() {
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const { data, error } = await supabaseAdmin
    .from(CAMPAIGNS)
    .select("sent_count")
    .eq("status", "sent")
    .gte("sent_at", today.toISOString())

  if (error) {
    console.error("getDailyStats:", error.message)
    return { used: 0, remaining: DAILY_LIMIT, limit: DAILY_LIMIT }
  }

  const used = ((data as { sent_count: number | null }[]) ?? []).reduce(
    (sum, c) => sum + (c.sent_count ?? 0),
    0
  )
  const remaining = Math.max(0, DAILY_LIMIT - used)

  return { used, remaining, limit: DAILY_LIMIT }
}
