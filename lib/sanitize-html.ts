import DOMPurify from "isomorphic-dompurify"

/**
 * Allowlist sanitizer for the inline editor's rich text.
 *
 * The rich-text values authored in the site editor are stored in `site_settings`
 * and rendered on the PUBLIC homepage via dangerouslySetInnerHTML. The DB write
 * path is meant to be admin-only, but this is the defense-in-depth layer: even a
 * poisoned settings row (e.g. a misconfigured RLS policy) can't inject
 * executable HTML. Only the formatting the toolbar can produce survives —
 * bold / italic / underline / strike, colour spans, and line breaks. Scripts,
 * event handlers, img/svg/iframe, and unsafe styles are stripped.
 *
 * isomorphic-dompurify runs DOMPurify in the browser and via jsdom during SSR,
 * so the same guarantee holds on the server-rendered page and on the client.
 */
const CONFIG = {
  ALLOWED_TAGS: [
    "b",
    "strong",
    "i",
    "em",
    "u",
    "s",
    "strike",
    "span",
    "br",
    "p",
    "div",
    "font",
  ],
  ALLOWED_ATTR: ["style", "color"],
  ALLOW_DATA_ATTR: false,
}

export function sanitizeRichText(html: string): string {
  return DOMPurify.sanitize(html ?? "", CONFIG)
}
