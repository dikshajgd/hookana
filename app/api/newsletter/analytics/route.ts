import { NextResponse } from "next/server"
import { getSubscriberGrowth, getSubscriberSources } from "@/lib/newsletter-db"

// Time-series + breakdown for the admin analytics charts.
export async function GET() {
  const [growth, sources] = await Promise.all([getSubscriberGrowth(), getSubscriberSources()])
  return NextResponse.json({ growth, sources })
}
