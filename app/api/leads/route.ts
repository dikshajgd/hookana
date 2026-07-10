import { NextResponse } from "next/server"

/**
 * Best-effort read of the contact-form leads.
 *
 * Leads are submitted (POST) to a Google Apps Script that appends them to a
 * Sheet — see app/api/lead/route.ts. If that same script (or a dedicated one via
 * LEADS_FETCH_URL) answers GET with the rows as JSON, we surface them in the
 * admin. If it doesn't, we degrade honestly rather than inventing data. Gated
 * behind the admin cookie (middleware) since this is lead PII.
 */

export const runtime = "nodejs"

type LeadsResponse = {
  configured: boolean
  available: boolean
  leads: Record<string, unknown>[]
  error?: string
}

export async function GET(): Promise<NextResponse<LeadsResponse>> {
  const url = process.env.LEADS_FETCH_URL ?? process.env.APPS_SCRIPT_URL
  if (!url) {
    return NextResponse.json({ configured: false, available: false, leads: [] })
  }

  try {
    const res = await fetch(url, { method: "GET", redirect: "follow" })
    if (!res.ok) {
      return NextResponse.json({
        configured: true,
        available: false,
        leads: [],
        error: `Leads source returned ${res.status}.`,
      })
    }

    const text = await res.text()
    let parsed: unknown
    try {
      parsed = JSON.parse(text)
    } catch {
      return NextResponse.json({
        configured: true,
        available: false,
        leads: [],
        error: "Leads source didn't return JSON — the Apps Script may only accept POST.",
      })
    }

    const leads = Array.isArray(parsed)
      ? parsed
      : Array.isArray((parsed as { leads?: unknown }).leads)
        ? (parsed as { leads: Record<string, unknown>[] }).leads
        : Array.isArray((parsed as { data?: unknown }).data)
          ? (parsed as { data: Record<string, unknown>[] }).data
          : []

    return NextResponse.json({ configured: true, available: true, leads })
  } catch (e) {
    return NextResponse.json({
      configured: true,
      available: false,
      leads: [],
      error: e instanceof Error ? e.message : "Could not reach the leads source.",
    })
  }
}
