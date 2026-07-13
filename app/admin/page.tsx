import Link from "next/link"
import { Wand2, ArrowRight, Image as ImageIcon, Inbox } from "lucide-react"
import { NewsletterPanel } from "@/components/admin/hub/newsletter-panel"

export default function AdminOverviewPage() {
  return (
    <div className="mx-auto max-w-5xl space-y-8 p-6 sm:p-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Overview</h1>
        <p className="mt-1 text-sm text-gray-500">Everything for the Hookana site in one place.</p>
      </div>

      {/* Primary: the visual, in-place site editor */}
      <Link
        href="/admin/site"
        className="flex items-center justify-between gap-4 rounded-xl border border-neutral-900 bg-neutral-900 p-6 text-white transition-colors hover:bg-neutral-800"
      >
        <div className="flex items-start gap-3">
          <Wand2 className="mt-0.5 h-6 w-6 shrink-0" />
          <div>
            <h2 className="text-lg font-semibold">Open the visual site editor</h2>
            <p className="mt-1 text-sm text-neutral-300">
              Edit the homepage exactly as it looks — click any text to rewrite it, and hover any
              card, logo or video to upload a replacement.
            </p>
          </div>
        </div>
        <span className="hidden shrink-0 items-center gap-1.5 rounded-md bg-white px-4 py-2 text-sm font-semibold text-neutral-900 sm:flex">
          Open editor <ArrowRight className="h-4 w-4" />
        </span>
      </Link>

      {/* Secondary shortcuts */}
      <div className="grid gap-4 sm:grid-cols-2">
        <Link
          href="/admin/portfolio"
          className="group flex items-center gap-4 rounded-xl border border-gray-200 bg-white p-5 transition-all hover:border-gray-900 hover:shadow-sm"
        >
          <div className="flex size-10 items-center justify-center rounded-lg bg-gray-900/5 text-gray-900">
            <ImageIcon className="size-5" />
          </div>
          <div>
            <p className="font-semibold text-gray-900">Portfolio</p>
            <p className="text-sm text-gray-500">Upload and reorder work in the gallery grid.</p>
          </div>
          <ArrowRight className="ml-auto size-4 text-gray-400 transition-transform group-hover:translate-x-0.5" />
        </Link>
        <Link
          href="/admin/leads"
          className="group flex items-center gap-4 rounded-xl border border-gray-200 bg-white p-5 transition-all hover:border-gray-900 hover:shadow-sm"
        >
          <div className="flex size-10 items-center justify-center rounded-lg bg-gray-900/5 text-gray-900">
            <Inbox className="size-5" />
          </div>
          <div>
            <p className="font-semibold text-gray-900">Leads</p>
            <p className="text-sm text-gray-500">Free-concept requests from the contact form.</p>
          </div>
          <ArrowRight className="ml-auto size-4 text-gray-400 transition-transform group-hover:translate-x-0.5" />
        </Link>
      </div>

      {/* Newsletter analytics */}
      <div className="border-t border-gray-200 pt-8">
        <NewsletterPanel />
      </div>
    </div>
  )
}
