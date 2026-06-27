import { NextRequest, NextResponse } from "next/server"
import { writeClient } from "@/sanity/lib/write-client"

export async function POST(req: NextRequest) {
  const { email } = await req.json().catch(() => ({}))

  if (!email) {
    return NextResponse.json({ error: "Email is required" }, { status: 400 })
  }

  const subscriber = await writeClient.fetch<{ _id: string } | null>(
    `*[_type == "subscriber" && email == $email][0]{ _id }`,
    { email }
  )

  if (!subscriber) {
    return NextResponse.json({ error: "Email not found" }, { status: 404 })
  }

  await writeClient.patch(subscriber._id).set({ status: "unsubscribed" }).commit()

  return NextResponse.json({ success: true })
}
