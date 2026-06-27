import { writeClient } from "@/sanity/lib/write-client"

const PAGE_SIZE = 25

// ─── Types ──────────────────────────────────────────────────────────────────

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

// ─── Subscribers ─────────────────────────────────────────────────────────────

export async function getSubscribers(page = 1, status?: string) {
  const offset = (page - 1) * PAGE_SIZE
  const filter = status
    ? `_type == "subscriber" && status == "${status}"`
    : `_type == "subscriber"`

  const [subscribers, total] = await Promise.all([
    writeClient.fetch<Subscriber[]>(
      `*[${filter}] | order(subscribedAt desc) [${offset}...${offset + PAGE_SIZE}] { _id, email, name, status, source, subscribedAt }`
    ),
    writeClient.fetch<number>(`count(*[${filter}])`),
  ])

  return { subscribers, total, pages: Math.ceil(total / PAGE_SIZE), page }
}

export async function addSubscriber(
  email: string,
  name?: string,
  source = "manual"
): Promise<Subscriber> {
  const existing = await writeClient.fetch<string | null>(
    `*[_type == "subscriber" && email == $email][0]._id`,
    { email }
  )
  if (existing) throw new Error("Email already subscribed")

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (writeClient as any).create({
    _type: "subscriber",
    email,
    name,
    status: "active",
    source,
    subscribedAt: new Date().toISOString(),
  }) as Promise<Subscriber>
}

export async function bulkAddSubscribers(
  entries: Array<{ email: string; name?: string }>,
  source = "bulk_import"
) {
  const existing = await writeClient.fetch<string[]>(`*[_type == "subscriber"].email`)
  const existingSet = new Set((existing ?? []).map((e) => e.toLowerCase()))

  const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  let added = 0
  let skipped = 0
  const invalid: string[] = []

  for (const { email, name } of entries) {
    if (!EMAIL_RE.test(email)) {
      invalid.push(email)
      continue
    }
    if (existingSet.has(email.toLowerCase())) {
      skipped++
      continue
    }
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await (writeClient as any).create({
        _type: "subscriber",
        email,
        name,
        status: "active",
        source,
        subscribedAt: new Date().toISOString(),
      })
      existingSet.add(email.toLowerCase())
      added++
    } catch {
      invalid.push(email)
    }
  }

  return { added, skipped, invalid }
}

export async function deleteSubscriber(id: string) {
  return writeClient.delete(id)
}

export async function updateSubscriberStatus(
  id: string,
  status: "active" | "unsubscribed"
) {
  return writeClient.patch(id).set({ status }).commit()
}

export async function getActiveSubscribers() {
  return writeClient.fetch<Array<{ _id: string; email: string; name?: string }>>(
    `*[_type == "subscriber" && status == "active"] { _id, email, name }`
  )
}

export async function getSubscriberStats() {
  const [total, active, unsubscribed] = await Promise.all([
    writeClient.fetch<number>(`count(*[_type == "subscriber"])`),
    writeClient.fetch<number>(`count(*[_type == "subscriber" && status == "active"])`),
    writeClient.fetch<number>(`count(*[_type == "subscriber" && status == "unsubscribed"])`),
  ])
  return { total, active, unsubscribed }
}

// ─── Campaigns ───────────────────────────────────────────────────────────────

export async function getCampaigns(page = 1) {
  const offset = (page - 1) * PAGE_SIZE
  const [campaigns, total] = await Promise.all([
    writeClient.fetch<Campaign[]>(
      `*[_type == "newsletterCampaign"] | order(_createdAt desc) [${offset}...${offset + PAGE_SIZE}] { _id, title, subject, status, mode, sentAt, sentCount, recipientCount, _createdAt }`
    ),
    writeClient.fetch<number>(`count(*[_type == "newsletterCampaign"])`),
  ])
  return { campaigns, total, pages: Math.ceil(total / PAGE_SIZE), page }
}

export async function getCampaign(id: string) {
  return writeClient.fetch<Campaign | null>(
    `*[_type == "newsletterCampaign" && _id == $id][0]`,
    { id }
  )
}

export async function createCampaign(data: {
  title?: string
  subject: string
  htmlContent: string
  plainText: string
  mode: "manual" | "generated"
  prompt?: string
}) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (writeClient as any).create({
    _type: "newsletterCampaign",
    ...data,
    status: "draft",
    sentCount: 0,
    recipientCount: 0,
  })
}

export async function updateCampaign(
  id: string,
  data: Partial<{ title: string; subject: string; htmlContent: string; plainText: string }>
) {
  return writeClient.patch(id).set(data).commit()
}

export async function markCampaignSent(id: string, sentCount: number, recipientCount: number) {
  return writeClient.patch(id).set({
    status: "sent",
    sentAt: new Date().toISOString(),
    sentCount,
    recipientCount,
  }).commit()
}

export async function deleteCampaign(id: string) {
  return writeClient.delete(id)
}

export async function getCampaignStats() {
  const [total, sent, draft] = await Promise.all([
    writeClient.fetch<number>(`count(*[_type == "newsletterCampaign"])`),
    writeClient.fetch<number>(`count(*[_type == "newsletterCampaign" && status == "sent"])`),
    writeClient.fetch<number>(`count(*[_type == "newsletterCampaign" && status == "draft"])`),
  ])
  const lastCampaign = await writeClient.fetch<{ sentAt: string; title?: string; subject: string } | null>(
    `*[_type == "newsletterCampaign" && status == "sent"] | order(sentAt desc)[0] { sentAt, title, subject }`
  )
  return { total, sent, draft, lastCampaign }
}

// ─── Rate Limiting ────────────────────────────────────────────────────────────

const DAILY_LIMIT = Number(process.env.NEWSLETTER_DAILY_LIMIT ?? "1000")

export async function getDailyStats() {
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const campaigns = await writeClient.fetch<Array<{ sentCount: number }>>(
    `*[_type == "newsletterCampaign" && status == "sent" && sentAt >= $today] { sentCount }`,
    { today: today.toISOString() }
  )

  const used = (campaigns ?? []).reduce((sum, c) => sum + (c.sentCount ?? 0), 0)
  const remaining = Math.max(0, DAILY_LIMIT - used)

  return { used, remaining, limit: DAILY_LIMIT }
}
