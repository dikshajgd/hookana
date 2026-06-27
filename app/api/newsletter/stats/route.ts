import { NextResponse } from "next/server"
import { getSubscriberStats, getCampaignStats, getDailyStats } from "@/lib/newsletter-db"

export async function GET() {
  const [subscribers, campaigns, daily] = await Promise.all([
    getSubscriberStats(),
    getCampaignStats(),
    getDailyStats(),
  ])
  return NextResponse.json({ subscribers, campaigns, daily })
}
