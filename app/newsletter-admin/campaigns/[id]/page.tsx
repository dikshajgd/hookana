"use client"

import { useEffect, useState } from "react"
import { useRouter, useParams } from "next/navigation"
import {
  Send,
  Loader2,
  AlertTriangle,
  Users,
  ChevronDown,
  ChevronUp,
} from "lucide-react"
import { MacOSEmailPreview } from "@/components/newsletter-admin/MacOSEmailPreview"

type Campaign = {
  _id: string
  title?: string
  subject: string
  htmlContent?: string
  plainText?: string
  status: "draft" | "sent"
  mode: "manual" | "generated"
  sentAt?: string
  sentCount?: number
  recipientCount?: number
  _createdAt: string
}

type RecipientMode = "all" | "custom"

export default function CampaignDetailPage() {
  const router = useRouter()
  const params = useParams()
  const id = params.id as string

  const [campaign, setCampaign] = useState<Campaign | null>(null)
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [recipientMode, setRecipientMode] = useState<RecipientMode>("all")
  const [customEmails, setCustomEmails] = useState("")
  const [showRecipients, setShowRecipients] = useState(false)
  const [activeSubscriberCount, setActiveSubscriberCount] = useState<number | null>(null)
  const [sendResult, setSendResult] = useState<{
    success?: boolean
    sentCount?: number
    totalRecipients?: number
    error?: string
  } | null>(null)

  useEffect(() => {
    Promise.all([
      fetch(`/api/newsletter/campaigns/${id}`).then((r) => r.json()),
      fetch("/api/newsletter/stats").then((r) => r.json()),
    ]).then(([campaignJson, statsJson]) => {
      setCampaign(campaignJson.campaign)
      setActiveSubscriberCount(statsJson.subscribers?.active ?? null)
      setLoading(false)
    })
  }, [id])

  const getCustomRecipientList = () =>
    customEmails
      .split(/[\n,]+/)
      .map((e) => e.trim())
      .filter((e) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e))

  const handleSend = async () => {
    setShowConfirm(false)
    setSending(true)
    setSendResult(null)

    const customRecipients =
      recipientMode === "custom" ? getCustomRecipientList() : []

    const res = await fetch(`/api/newsletter/campaigns/${id}/send`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        customRecipients: customRecipients.length > 0 ? customRecipients : undefined,
      }),
    })
    const json = await res.json()
    setSendResult(json)
    setSending(false)

    if (res.ok) {
      setCampaign((c) => c ? { ...c, status: "sent" } : c)
      setTimeout(() => router.push("/newsletter-admin/campaigns"), 3000)
    }
  }

  const formatDate = (iso?: string) =>
    iso
      ? new Date(iso).toLocaleDateString("en-US", {
          month: "long",
          day: "numeric",
          year: "numeric",
        })
      : "—"

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="size-6 text-gray-400 animate-spin" />
      </div>
    )
  }

  if (!campaign) {
    return (
      <div className="p-8 text-center text-gray-500">Campaign not found.</div>
    )
  }

  return (
    <div className="flex h-screen flex-col">
      {/* Top Bar */}
      <div className="flex items-center justify-between px-6 py-4 bg-white border-b border-gray-200 shrink-0">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.back()}
            className="text-gray-400 hover:text-gray-600 text-sm"
          >
            ←
          </button>
          <div>
            <h1 className="font-bold text-gray-900 leading-tight">
              {campaign.title || campaign.subject}
            </h1>
            <p className="text-xs text-gray-400 mt-0.5">
              Created {formatDate(campaign._createdAt)}
            </p>
          </div>
          <span
            className={`ml-2 px-2 py-0.5 rounded-full text-xs font-medium ${
              campaign.status === "sent"
                ? "bg-green-50 text-green-700"
                : "bg-amber-50 text-amber-700"
            }`}
          >
            {campaign.status}
          </span>
        </div>

        {campaign.status === "draft" && (
          <button
            onClick={() => setShowConfirm(true)}
            disabled={sending}
            className="flex items-center gap-1.5 text-sm font-bold bg-[#0A1628] text-white px-4 py-2 rounded-lg hover:bg-[#0A1628]/90 disabled:opacity-50 transition-colors"
          >
            {sending ? (
              <Loader2 className="size-3.5 animate-spin" />
            ) : (
              <Send className="size-3.5" />
            )}
            {sending ? "Sending..." : "Send Campaign"}
          </button>
        )}
      </div>

      {/* Send Result Banner */}
      {sendResult && (
        <div
          className={`px-6 py-3 text-sm font-medium flex items-center gap-2 ${
            sendResult.success
              ? "bg-green-50 text-green-800 border-b border-green-200"
              : "bg-red-50 text-red-800 border-b border-red-200"
          }`}
        >
          {sendResult.success ? (
            <>✓ Sent to {sendResult.sentCount} of {sendResult.totalRecipients} recipients. Redirecting...</>
          ) : (
            <><AlertTriangle className="size-4" /> {sendResult.error}</>
          )}
        </div>
      )}

      {/* Content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left: Info */}
        <div className="w-[38%] border-r border-gray-200 overflow-y-auto bg-white p-6 space-y-5">
          {campaign.status === "sent" ? (
            <div className="bg-green-50 rounded-xl p-5 border border-green-100">
              <p className="font-semibold text-green-800">Campaign Sent</p>
              <p className="text-sm text-green-700 mt-1">
                {campaign.sentCount?.toLocaleString()} delivered to{" "}
                {campaign.recipientCount?.toLocaleString()} recipients on{" "}
                {formatDate(campaign.sentAt)}
              </p>
            </div>
          ) : (
            <div className="border border-gray-200 rounded-xl overflow-hidden">
              <button
                className="w-full flex items-center justify-between px-4 py-3 bg-gray-50 hover:bg-gray-100 transition-colors text-sm font-semibold text-gray-700"
                onClick={() => setShowRecipients((v) => !v)}
              >
                <span className="flex items-center gap-2">
                  <Users className="size-4" />
                  Configure Recipients
                </span>
                {showRecipients ? (
                  <ChevronUp className="size-4 text-gray-400" />
                ) : (
                  <ChevronDown className="size-4 text-gray-400" />
                )}
              </button>
              {showRecipients && (
                <div className="p-4 space-y-3">
                  <div className="flex gap-2">
                    {(["all", "custom"] as RecipientMode[]).map((m) => (
                      <button
                        key={m}
                        onClick={() => setRecipientMode(m)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                          recipientMode === m
                            ? "bg-[#0A1628] text-white"
                            : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                        }`}
                      >
                        {m === "all"
                          ? `All Active Subscribers${activeSubscriberCount !== null ? ` (${activeSubscriberCount.toLocaleString()})` : ""}`
                          : "Custom List"}
                      </button>
                    ))}
                  </div>
                  {recipientMode === "custom" && (
                    <div>
                      <textarea
                        value={customEmails}
                        onChange={(e) => setCustomEmails(e.target.value)}
                        placeholder="one@email.com&#10;two@email.com"
                        rows={5}
                        className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-xs font-mono outline-none focus:border-blue-400 transition-colors resize-none"
                      />
                      <p className="text-xs text-gray-400 mt-1.5">
                        {getCustomRecipientList().length} valid emails
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          <div>
            <p className="text-xs text-gray-400 uppercase tracking-wider font-semibold mb-1">Subject</p>
            <p className="text-sm font-medium text-gray-900">{campaign.subject}</p>
          </div>

          {campaign.mode && (
            <div>
              <p className="text-xs text-gray-400 uppercase tracking-wider font-semibold mb-1">Mode</p>
              <p className="text-sm text-gray-700 capitalize">{campaign.mode}</p>
            </div>
          )}
        </div>

        {/* Right: Preview */}
        <div className="flex-1 overflow-y-auto bg-gray-100 p-6">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4 font-mono">
            Preview
          </p>
          <MacOSEmailPreview
            html={campaign.htmlContent ?? ""}
            subject={campaign.subject}
          />
        </div>
      </div>

      {/* Confirm Modal */}
      {showConfirm && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl">
            <h2 className="font-bold text-gray-900 text-lg mb-2">Send Campaign?</h2>
            <p className="text-sm text-gray-500 mb-1">
              <strong>{campaign.subject}</strong>
            </p>
            <p className="text-sm text-gray-500 mb-5">
              {recipientMode === "all"
                ? `This will be sent to all active subscribers${activeSubscriberCount !== null ? ` (${activeSubscriberCount.toLocaleString()})` : ""}.`
                : `This will be sent to ${getCustomRecipientList().length} custom recipients.`}
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowConfirm(false)}
                className="flex-1 border border-gray-200 text-gray-700 font-medium py-2.5 rounded-lg text-sm hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSend}
                className="flex-1 bg-[#0A1628] text-white font-bold py-2.5 rounded-lg text-sm hover:bg-[#0A1628]/90"
              >
                Send Now
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
