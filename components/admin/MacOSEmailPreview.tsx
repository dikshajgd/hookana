"use client"

export function MacOSEmailPreview({
  html,
  subject,
  from = "Hookana <newsletter@hookana.com>",
}: {
  html: string
  subject: string
  from?: string
}) {
  return (
    <div
      className="rounded-xl overflow-hidden border border-gray-300 shadow-2xl"
      style={{ fontFamily: "-apple-system, BlinkMacSystemFont, 'San Francisco', sans-serif" }}
    >
      {/* macOS Title Bar */}
      <div className="bg-[#3C3C3C] h-9 flex items-center px-3.5 gap-0 select-none">
        <div className="flex gap-1.5 mr-4">
          <span className="w-3 h-3 rounded-full bg-[#FF5F57] border border-[#E0443E]" />
          <span className="w-3 h-3 rounded-full bg-[#FFBD2E] border border-[#DEA123]" />
          <span className="w-3 h-3 rounded-full bg-[#28C840] border border-[#1AAB29]" />
        </div>
        <div className="flex-1 text-center">
          <span className="text-[#BBBBBE] text-[11px] font-medium">
            {subject || "New Message"} — Mail
          </span>
        </div>
      </div>

      {/* Toolbar */}
      <div className="bg-[#EBEBEB] border-b border-gray-300 px-4 py-1.5 flex items-center gap-4">
        <div className="flex gap-1">
          {["←", "→"].map((a) => (
            <button
              key={a}
              className="w-6 h-5 rounded text-gray-500 text-xs font-bold bg-white/60 border border-gray-300/70 flex items-center justify-center hover:bg-white transition-colors"
            >
              {a}
            </button>
          ))}
        </div>
        <div className="flex gap-3 text-[11px] text-gray-500 ml-2">
          <span>↩ Reply</span>
          <span>↪ Forward</span>
          <span>⤷ Archive</span>
        </div>
        <div className="ml-auto flex gap-2 text-[11px] text-gray-500">
          <span>🗑 Delete</span>
          <span>⋯ More</span>
        </div>
      </div>

      {/* Email Metadata */}
      <div className="bg-white border-b border-gray-200 px-5 py-3.5">
        <div className="space-y-1 text-sm">
          <div className="flex gap-2">
            <span className="text-gray-400 text-xs w-14 pt-0.5">From</span>
            <span className="text-gray-800 font-medium text-xs">{from}</span>
          </div>
          <div className="flex gap-2">
            <span className="text-gray-400 text-xs w-14 pt-0.5">To</span>
            <span className="text-gray-500 text-xs">subscriber@example.com</span>
          </div>
          <div className="flex gap-2">
            <span className="text-gray-400 text-xs w-14 pt-0.5">Subject</span>
            <span className="text-gray-900 font-semibold text-sm">
              {subject || <span className="text-gray-300 font-normal">(no subject)</span>}
            </span>
          </div>
        </div>
      </div>

      {/* Email Body */}
      <div className="h-[520px] overflow-auto bg-[#F5F5F5]">
        {html ? (
          <iframe
            srcDoc={html}
            className="w-full h-full border-none bg-white"
            sandbox="allow-same-origin"
            title="Email Preview"
          />
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-gray-400 text-sm gap-2">
            <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-400 text-xl">
              ✉
            </div>
            <p>Preview will appear here</p>
          </div>
        )}
      </div>
    </div>
  )
}
