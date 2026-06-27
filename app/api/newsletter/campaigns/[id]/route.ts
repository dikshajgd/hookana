import { NextRequest, NextResponse } from "next/server"
import {
  getCampaign,
  updateCampaign,
  deleteCampaign,
} from "@/lib/newsletter-db"

export async function GET(
  _: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const campaign = await getCampaign(id)
  if (!campaign) return NextResponse.json({ error: "Not found" }, { status: 404 })
  return NextResponse.json({ campaign })
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const body = await req.json().catch(() => ({}))
  const campaign = await updateCampaign(id, body)
  return NextResponse.json({ campaign })
}

export async function DELETE(
  _: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  await deleteCampaign(id)
  return NextResponse.json({ success: true })
}
