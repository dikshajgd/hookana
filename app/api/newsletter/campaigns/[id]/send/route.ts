import { NextRequest, NextResponse } from "next/server"
import {
  getCampaign,
  getActiveSubscribers,
  markCampaignSent,
  getDailyStats,
} from "@/lib/newsletter-db"
import { getResend, FROM_ADDRESS } from "@/lib/mailer"

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const body = await req.json().catch(() => ({}))

  const campaign = await getCampaign(id)
  if (!campaign) {
    return NextResponse.json({ error: "Campaign not found" }, { status: 404 })
  }
  if (campaign.status === "sent") {
    return NextResponse.json({ error: "Campaign already sent" }, { status: 409 })
  }

  // Determine recipients
  let recipients: Array<{ email: string; name?: string }>

  if (Array.isArray(body?.customRecipients) && body.customRecipients.length > 0) {
    recipients = (body.customRecipients as string[])
      .filter((e) => EMAIL_RE.test(e))
      .map((email) => ({ email }))
  } else {
    recipients = await getActiveSubscribers()
  }

  if (recipients.length === 0) {
    return NextResponse.json(
      { error: "No valid recipients found" },
      { status: 400 }
    )
  }

  // Check daily rate limit
  const { remaining, limit, used } = await getDailyStats()
  if (remaining < recipients.length) {
    return NextResponse.json(
      {
        error: `Daily send limit reached. Limit: ${limit}, Used: ${used}, Remaining: ${remaining}. You need ${recipients.length} slots.`,
      },
      { status: 429 }
    )
  }

  // Send via Resend
  const resend = getResend()
  let sentCount = 0
  const failedEmails: string[] = []

  // Resend supports batch sending up to 100 per call
  const BATCH_SIZE = 100
  for (let i = 0; i < recipients.length; i += BATCH_SIZE) {
    const batch = recipients.slice(i, i + BATCH_SIZE)

    try {
      const { data, error } = await resend.batch.send(
        batch.map((r) => ({
          from: FROM_ADDRESS,
          to: r.email,
          subject: campaign.subject,
          html: campaign.htmlContent ?? "",
          text: campaign.plainText ?? "",
        }))
      )

      if (error) {
        batch.forEach((r) => failedEmails.push(r.email))
      } else {
        sentCount += data?.data?.length ?? batch.length
      }
    } catch {
      batch.forEach((r) => failedEmails.push(r.email))
    }

    // Small pause between batches
    if (i + BATCH_SIZE < recipients.length) {
      await new Promise((r) => setTimeout(r, 500))
    }
  }

  await markCampaignSent(id, sentCount, recipients.length)

  return NextResponse.json({
    success: true,
    sentCount,
    totalRecipients: recipients.length,
    failed: failedEmails.length > 0 ? failedEmails : undefined,
  })
}
