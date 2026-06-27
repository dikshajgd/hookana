import { NextResponse } from "next/server"
import { getDailyStats } from "@/lib/newsletter-db"

export async function GET() {
  const stats = await getDailyStats()
  return NextResponse.json(stats)
}
