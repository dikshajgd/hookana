import { NextRequest, NextResponse } from "next/server"
import { deleteSubscriber, updateSubscriberStatus } from "@/lib/newsletter-db"

export async function DELETE(
  _: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  await deleteSubscriber(id)
  return NextResponse.json({ success: true })
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const { status } = await req.json().catch(() => ({}))
  if (!["active", "unsubscribed"].includes(status)) {
    return NextResponse.json({ error: "Invalid status" }, { status: 400 })
  }
  await updateSubscriberStatus(id, status)
  return NextResponse.json({ success: true })
}
