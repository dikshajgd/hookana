/**
 * Pure helpers for the Supabase-backed newsletter store — row mappers, email
 * validation, and column mapping. Kept free of any client/env imports so
 * they're trivially unit-testable and reusable across newsletter-db + routes.
 *
 * The public Subscriber/Campaign shapes intentionally keep the old Sanity field
 * names (`_id`, `_createdAt`, camelCase) so the API routes and admin UI need no
 * changes after the migration off Sanity.
 */

export type Subscriber = {
  _id: string
  email: string
  name?: string
  status: "active" | "unsubscribed"
  source?: string
  subscribedAt?: string
}

export type Campaign = {
  _id: string
  title?: string
  subject: string
  htmlContent?: string
  plainText?: string
  mode: "manual" | "generated"
  prompt?: string
  status: "draft" | "sent"
  sentAt?: string
  sentCount?: number
  recipientCount?: number
  _createdAt: string
}

// ─── Row shapes (snake_case, as stored in Supabase) ──────────────────────────

export type SubscriberRow = {
  id: string
  email: string
  name: string | null
  status: "active" | "unsubscribed"
  source: string | null
  subscribed_at: string | null
}

export type CampaignRow = {
  id: string
  title: string | null
  subject: string | null
  html_content?: string | null
  plain_text?: string | null
  mode: "manual" | "generated" | null
  prompt?: string | null
  status: "draft" | "sent"
  sent_at: string | null
  sent_count: number | null
  recipient_count: number | null
  created_at: string
}

// ─── Mappers ─────────────────────────────────────────────────────────────────

export function rowToSubscriber(r: SubscriberRow): Subscriber {
  return {
    _id: r.id,
    email: r.email,
    name: r.name ?? undefined,
    status: r.status,
    source: r.source ?? undefined,
    subscribedAt: r.subscribed_at ?? undefined,
  }
}

export function rowToCampaign(r: CampaignRow): Campaign {
  return {
    _id: r.id,
    title: r.title ?? undefined,
    subject: r.subject ?? "",
    htmlContent: r.html_content ?? undefined,
    plainText: r.plain_text ?? undefined,
    mode: r.mode ?? "manual",
    prompt: r.prompt ?? undefined,
    status: r.status,
    sentAt: r.sent_at ?? undefined,
    sentCount: r.sent_count ?? undefined,
    recipientCount: r.recipient_count ?? undefined,
    _createdAt: r.created_at,
  }
}

// ─── Validation + helpers ────────────────────────────────────────────────────

export const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export function isValidEmail(email: unknown): email is string {
  return typeof email === "string" && EMAIL_RE.test(email)
}

/** Zero-based inclusive Supabase `.range()` bounds for a 1-based page. */
export function pageRange(page: number, pageSize: number): [number, number] {
  const p = Number.isFinite(page) && page > 0 ? Math.floor(page) : 1
  const offset = (p - 1) * pageSize
  return [offset, offset + pageSize - 1]
}

export function pageCount(total: number, pageSize: number): number {
  return Math.ceil(total / pageSize)
}

/**
 * Escape SQL ILIKE wildcards so an email address matches literally but still
 * case-insensitively. Emails legitimately contain `_` (e.g. john_doe@x.com),
 * which ILIKE would otherwise treat as a single-char wildcard.
 */
export function emailIlikePattern(email: string): string {
  return email.replace(/([%_\\])/g, "\\$1")
}

/**
 * Map an inbound campaign update (camelCase, as the API/UI sends it) to the
 * snake_case DB columns, keeping only fields that are actually editable and
 * present. Never lets a caller set status/counts through the generic PATCH.
 */
export function campaignUpdateToColumns(
  data: Record<string, unknown>
): Record<string, unknown> {
  const MAP: Record<string, string> = {
    title: "title",
    subject: "subject",
    htmlContent: "html_content",
    plainText: "plain_text",
    prompt: "prompt",
  }
  const out: Record<string, unknown> = {}
  for (const [key, col] of Object.entries(MAP)) {
    if (data[key] !== undefined) out[col] = data[key]
  }
  return out
}
