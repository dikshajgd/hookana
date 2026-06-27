import { NextRequest, NextResponse } from "next/server"
import { getCampaigns, createCampaign } from "@/lib/newsletter-db"

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const page = Number(searchParams.get("page") ?? "1")
  const data = await getCampaigns(page)
  return NextResponse.json(data)
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}))
  const { title, subject, htmlContent, plainText, mode, prompt } = body

  if (!subject || !htmlContent) {
    return NextResponse.json(
      { error: "subject and htmlContent are required" },
      { status: 400 }
    )
  }

  const campaign = await createCampaign({
    title,
    subject,
    htmlContent,
    plainText: plainText ?? "",
    mode: mode ?? "manual",
    prompt,
  })
  return NextResponse.json({ campaign }, { status: 201 })
}
