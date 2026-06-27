"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import {
  Sparkles,
  FileText,
  Globe,
  Send,
  Save,
  Loader2,
  ChevronDown,
  ChevronUp,
  Users,
  AlertTriangle,
} from "lucide-react"
import { MacOSEmailPreview } from "@/components/newsletter-admin/MacOSEmailPreview"

type Mode = "manual" | "generated"
type RecipientMode = "all" | "custom"

export default function NewCampaignPage() {
  const router = useRouter()
  const [mode, setMode] = useState<Mode>("manual")

  // Shared fields
  const [title, setTitle] = useState("")
  const [subject, setSubject] = useState("")

  // Manual mode
  const [htmlContent, setHtmlContent] = useState("")
  const [plainText, setPlainText] = useState("")

  // AI generate mode
  const [topic, setTopic] = useState("")
  const [hintSubject, setHintSubject] = useState("")
  const [context, setContext] = useState("")
  const [references, setReferences] = useState("")
  const [useWebSearch, setUseWebSearch] = useState(false)
  const [generating, setGenerating] = useState(false)
  const [genError, setGenError] = useState("")
  const [generated, setGenerated] = useState(false)

  // Recipients
  const [recipientMode, setRecipientMode] = useState<RecipientMode>("all")
  const [customEmails, setCustomEmails] = useState("")
  const [showRecipients, setShowRecipients] = useState(false)

  // Send state
  const [saving, setSaving] = useState(false)
  const [sending, setSending] = useState(false)
  const [sendResult, setSendResult] = useState<{
    success?: boolean
    sentCount?: number
    totalRecipients?: number
    error?: string
  } | null>(null)
  const [showConfirm, setShowConfirm] = useState(false)

  // Preview: always show the current html
  const previewHtml = htmlContent

  const handleGenerate = async () => {
    if (!topic) return
    setGenerating(true)
    setGenError("")

    const res = await fetch("/api/newsletter/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ topic, context, references, useWebSearch, hintSubject }),
    })
    const json = await res.json()

    if (!res.ok) {
      setGenError(json.error ?? "Generation failed")
    } else {
      setSubject(json.subject ?? "")
      setHtmlContent(json.htmlContent ?? "")
      setPlainText(json.plainText ?? "")
      setGenerated(true)
    }
    setGenerating(false)
  }

  const getCustomRecipientList = () =>
    customEmails
      .split(/[\n,]+/)
      .map((e) => e.trim())
      .filter((e) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e))

  const handleSaveDraft = async () => {
    if (!subject || !htmlContent) return
    setSaving(true)
    const res = await fetch("/api/newsletter/campaigns", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: title || subject,
        subject,
        htmlContent,
        plainText,
        mode,
        prompt: mode === "generated" ? topic : undefined,
      }),
    })
    const json = await res.json()
    setSaving(false)
    if (res.ok) {
      router.push(`/newsletter-admin/campaigns/${json.campaign._id}`)
    }
  }

  const handleSendConfirmed = async () => {
    setShowConfirm(false)
    setSending(true)
    setSendResult(null)

    // Create campaign first
    const createRes = await fetch("/api/newsletter/campaigns", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: title || subject,
        subject,
        htmlContent,
        plainText,
        mode,
        prompt: mode === "generated" ? topic : undefined,
      }),
    })
    const createJson = await createRes.json()
    if (!createRes.ok) {
      setSendResult({ error: createJson.error ?? "Failed to create campaign" })
      setSending(false)
      return
    }

    const campaignId = createJson.campaign._id
    const customRecipients =
      recipientMode === "custom" ? getCustomRecipientList() : []

    const sendRes = await fetch(`/api/newsletter/campaigns/${campaignId}/send`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        customRecipients: customRecipients.length > 0 ? customRecipients : undefined,
      }),
    })
    const sendJson = await sendRes.json()
    setSendResult(sendJson)
    setSending(false)

    if (sendRes.ok) {
      setTimeout(() => router.push("/newsletter-admin/campaigns"), 3000)
    }
  }

  const canSend = subject && htmlContent && !sending

  return (
    <div className="flex h-[calc(100vh-0px)] flex-col">
      {/* Top Bar */}
      <div className="flex items-center justify-between px-6 py-4 bg-white border-b border-gray-200 shrink-0">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.back()}
            className="text-gray-400 hover:text-gray-600 text-sm"
          >
            ←
          </button>
          <h1 className="font-bold text-gray-900">New Campaign</h1>
          {/* Mode toggle */}
          <div className="flex gap-1 bg-gray-100 p-1 rounded-lg ml-4">
            <button
              onClick={() => setMode("manual")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                mode === "manual"
                  ? "bg-white shadow-sm text-gray-900"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              <FileText className="size-3.5" />
              Use As Is
            </button>
            <button
              onClick={() => setMode("generated")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                mode === "generated"
                  ? "bg-white shadow-sm text-gray-900"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              <Sparkles className="size-3.5" />
              AI Generate
            </button>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleSaveDraft}
            disabled={saving || !subject || !htmlContent}
            className="flex items-center gap-1.5 text-sm font-medium text-gray-600 border border-gray-200 px-3 py-2 rounded-lg hover:border-gray-300 disabled:opacity-40 transition-colors"
          >
            {saving ? <Loader2 className="size-3.5 animate-spin" /> : <Save className="size-3.5" />}
            Save Draft
          </button>
          <button
            onClick={() => setShowConfirm(true)}
            disabled={!canSend}
            className="flex items-center gap-1.5 text-sm font-bold bg-[#0A1628] text-white px-4 py-2 rounded-lg hover:bg-[#0A1628]/90 disabled:opacity-40 transition-colors"
          >
            {sending ? (
              <Loader2 className="size-3.5 animate-spin" />
            ) : (
              <Send className="size-3.5" />
            )}
            {sending ? "Sending..." : "Send Campaign"}
          </button>
        </div>
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
            <>
              ✓ Sent to {sendResult.sentCount} of {sendResult.totalRecipients} recipients.
              Redirecting...
            </>
          ) : (
            <>
              <AlertTriangle className="size-4" />
              {sendResult.error}
            </>
          )}
        </div>
      )}

      {/* Main Split Layout */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left: Editor */}
        <div className="w-[45%] border-r border-gray-200 overflow-y-auto bg-white">
          <div className="p-6 space-y-5">
            {/* Shared: title + subject */}
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
                Internal Title (optional)
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. June 2026 Creative Tactics"
                className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-blue-400 transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
                Email Subject Line <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="Subject line subscribers will see"
                className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-blue-400 transition-colors"
              />
            </div>

            {/* Manual mode */}
            {mode === "manual" && (
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
                  HTML Content <span className="text-red-400">*</span>
                </label>
                <textarea
                  value={htmlContent}
                  onChange={(e) => setHtmlContent(e.target.value)}
                  placeholder="Paste your HTML email content here..."
                  rows={20}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm font-mono outline-none focus:border-blue-400 transition-colors resize-none"
                />
                <div className="mt-3">
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
                    Plain Text Version (optional)
                  </label>
                  <textarea
                    value={plainText}
                    onChange={(e) => setPlainText(e.target.value)}
                    placeholder="Plain text fallback for email clients that don't support HTML..."
                    rows={6}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm font-mono outline-none focus:border-blue-400 transition-colors resize-none"
                  />
                </div>
              </div>
            )}

            {/* AI Generate mode */}
            {mode === "generated" && (
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
                    Topic / Theme <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    placeholder="e.g. How AI is changing UGC ad production in 2026"
                    className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-blue-400 transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
                    Subject Hint (optional)
                  </label>
                  <input
                    type="text"
                    value={hintSubject}
                    onChange={(e) => setHintSubject(e.target.value)}
                    placeholder="Hint for the subject line"
                    className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-blue-400 transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
                    Context / Brief (optional)
                  </label>
                  <textarea
                    value={context}
                    onChange={(e) => setContext(e.target.value)}
                    placeholder="Add context, tone guidance, specific angles to cover..."
                    rows={4}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-blue-400 transition-colors resize-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
                    References (optional)
                  </label>
                  <textarea
                    value={references}
                    onChange={(e) => setReferences(e.target.value)}
                    placeholder="Links, stats, quotes, examples to reference..."
                    rows={3}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm outline-none focus:border-blue-400 transition-colors resize-none"
                  />
                </div>

                <label className="flex items-center gap-3 cursor-pointer select-none">
                  <div
                    onClick={() => setUseWebSearch((v) => !v)}
                    className={`w-10 h-5 rounded-full transition-colors ${
                      useWebSearch ? "bg-[#0A1628]" : "bg-gray-200"
                    } relative`}
                  >
                    <span
                      className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${
                        useWebSearch ? "translate-x-5" : "translate-x-0.5"
                      }`}
                    />
                  </div>
                  <div className="flex items-center gap-1.5 text-sm font-medium text-gray-700">
                    <Globe className="size-4 text-gray-400" />
                    Enable web search (Google Search grounding)
                  </div>
                </label>

                {genError && (
                  <p className="text-xs text-red-500 font-mono bg-red-50 px-3 py-2 rounded-lg">
                    {genError}
                  </p>
                )}

                <button
                  onClick={handleGenerate}
                  disabled={generating || !topic}
                  className="w-full flex items-center justify-center gap-2 bg-violet-600 text-white py-3 rounded-lg text-sm font-bold hover:bg-violet-700 disabled:opacity-50 transition-colors"
                >
                  {generating ? (
                    <>
                      <Loader2 className="size-4 animate-spin" />
                      {useWebSearch ? "Searching & generating..." : "Generating..."}
                    </>
                  ) : (
                    <>
                      <Sparkles className="size-4" />
                      {generated ? "Regenerate" : "Generate Newsletter"}
                    </>
                  )}
                </button>

                {generated && (
                  <div className="border border-gray-200 rounded-lg overflow-hidden">
                    <div className="bg-gray-50 px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Generated HTML (editable)
                    </div>
                    <textarea
                      value={htmlContent}
                      onChange={(e) => setHtmlContent(e.target.value)}
                      rows={8}
                      className="w-full px-3 py-2.5 text-xs font-mono outline-none focus:ring-1 focus:ring-blue-400 resize-none"
                    />
                  </div>
                )}
              </div>
            )}

            {/* Recipients */}
            <div className="border border-gray-200 rounded-xl overflow-hidden">
              <button
                className="w-full flex items-center justify-between px-4 py-3 bg-gray-50 hover:bg-gray-100 transition-colors text-sm font-semibold text-gray-700"
                onClick={() => setShowRecipients((v) => !v)}
              >
                <span className="flex items-center gap-2">
                  <Users className="size-4" />
                  Recipients
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
                        {m === "all" ? "All Active Subscribers" : "Custom List"}
                      </button>
                    ))}
                  </div>
                  {recipientMode === "custom" && (
                    <div>
                      <textarea
                        value={customEmails}
                        onChange={(e) => setCustomEmails(e.target.value)}
                        placeholder="one@email.com&#10;two@email.com&#10;three@email.com"
                        rows={5}
                        className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-xs font-mono outline-none focus:border-blue-400 transition-colors resize-none"
                      />
                      <p className="text-xs text-gray-400 mt-1.5">
                        {getCustomRecipientList().length} valid email
                        {getCustomRecipientList().length !== 1 ? "s" : ""}
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right: Preview */}
        <div className="flex-1 overflow-y-auto bg-gray-100 p-6">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4 font-mono">
            Preview
          </p>
          <MacOSEmailPreview html={previewHtml} subject={subject} />
        </div>
      </div>

      {/* Confirm Modal */}
      {showConfirm && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl">
            <h2 className="font-bold text-gray-900 text-lg mb-2">Send Campaign?</h2>
            <p className="text-sm text-gray-500 mb-1">
              <strong>{subject}</strong>
            </p>
            <p className="text-sm text-gray-500 mb-5">
              {recipientMode === "all"
                ? "This will be sent to all active subscribers."
                : `This will be sent to ${getCustomRecipientList().length} custom recipients.`}
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowConfirm(false)}
                className="flex-1 border border-gray-200 text-gray-700 font-medium py-2.5 rounded-lg text-sm hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSendConfirmed}
                className="flex-1 bg-[#0A1628] text-white font-bold py-2.5 rounded-lg text-sm hover:bg-[#0A1628]/90 transition-colors"
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
