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
 * Implemented with no dependencies so it runs identically during SSR and in the
 * browser. It deliberately does NOT use DOMPurify: that needs a real DOM, and
 * the isomorphic wrapper pulled jsdom into the server bundle, which Next
 * externalises and then `require()`s — jsdom 29 is ESM-only, so every SSR render
 * of the homepage crashed with ERR_REQUIRE_ESM in production.
 *
 * The safety property comes from re-serialising rather than filtering in place:
 * output is built only from allowlisted tags and validated attribute values, and
 * every text run is escaped. Anything unrecognised is dropped, so malformed or
 * hostile input fails closed.
 */

const ALLOWED_TAGS = new Set([
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
])

const VOID_TAGS = new Set(["br"])

/** Dropped along with everything up to their closing tag, not just the tag. */
const DROP_CONTENT_TAGS = new Set([
  "script",
  "style",
  "iframe",
  "noscript",
  "noembed",
  "object",
  "embed",
  "template",
  "svg",
  "math",
  "textarea",
  "title",
  "xmp",
])

/** What execCommand(styleWithCSS) emits for bold/italic/underline/foreColor. */
const ALLOWED_STYLE_PROPS = new Set([
  "color",
  "background-color",
  "font-weight",
  "font-style",
  "text-decoration",
  "text-decoration-line",
  "text-decoration-color",
  "text-decoration-style",
])

const ALLOWED_ATTRS = new Set(["style", "color"])

/**
 * Escape a text run, leaving existing character references intact so the
 * &nbsp; that contentEditable sprays everywhere doesn't turn into "&amp;nbsp;".
 */
function escapeText(text: string): string {
  return text
    .replace(/&(?!(?:#\d{1,7}|#x[0-9a-fA-F]{1,6}|[a-zA-Z][a-zA-Z0-9]{1,31});)/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
}

/**
 * A CSS value is safe only if it sticks to a tight charset. No colon means no
 * `javascript:`; no backslash means no CSS escapes; no `&` means no character
 * references — so the encoded variants of every blocked construct fail here too.
 */
function isSafeCssValue(value: string): boolean {
  if (!value || value.length > 100) return false
  if (!/^[\w\s#.,%()/-]+$/.test(value)) return false
  return !/url\(|expression|@import/i.test(value)
}

function sanitizeStyle(value: string): string | null {
  const kept: string[] = []
  for (const decl of value.split(";")) {
    const colon = decl.indexOf(":")
    if (colon === -1) continue
    const prop = decl.slice(0, colon).trim().toLowerCase()
    const val = decl.slice(colon + 1).trim()
    if (!ALLOWED_STYLE_PROPS.has(prop)) continue
    if (!isSafeCssValue(val)) continue
    kept.push(`${prop}: ${val}`)
  }
  return kept.length ? kept.join("; ") : null
}

function sanitizeColor(value: string): string | null {
  const v = value.trim()
  return /^(?:#[0-9a-f]{3,8}|[a-z]{1,32})$/i.test(v) ? v : null
}

/** Index just past this tag's ">", respecting quoted attribute values. */
function findTagEnd(html: string, start: number): number {
  let quote: string | null = null
  for (let i = start + 1; i < html.length; i++) {
    const ch = html[i]
    if (quote) {
      if (ch === quote) quote = null
      continue
    }
    if (ch === '"' || ch === "'") {
      quote = ch
      continue
    }
    if (ch === ">") return i + 1
  }
  // Unterminated tag (or an unclosed attribute quote): consume the rest of the
  // input, so nothing after it is parsed as markup.
  return html.length
}

const ATTR_RE = /([a-zA-Z_:][-a-zA-Z0-9_:.]*)\s*(?:=\s*("[^"]*"|'[^']*'|[^\s"'>`]+))?/g

function sanitizeAttrs(raw: string): string {
  let out = ""
  ATTR_RE.lastIndex = 0
  let m: RegExpExecArray | null
  while ((m = ATTR_RE.exec(raw)) !== null) {
    const name = m[1].toLowerCase()
    if (!ALLOWED_ATTRS.has(name)) continue
    let value = m[2] ?? ""
    if (/^["']/.test(value)) value = value.slice(1, -1)
    const clean = name === "style" ? sanitizeStyle(value) : sanitizeColor(value)
    if (clean === null) continue
    out += ` ${name}="${clean.replace(/"/g, "&quot;")}"`
  }
  return out
}

export function sanitizeRichText(html: string): string {
  const input = html ?? ""
  let out = ""
  const open: string[] = []
  let i = 0

  while (i < input.length) {
    const lt = input.indexOf("<", i)
    if (lt === -1) {
      out += escapeText(input.slice(i))
      break
    }
    out += escapeText(input.slice(i, lt))

    if (input.startsWith("<!--", lt)) {
      const end = input.indexOf("-->", lt + 4)
      i = end === -1 ? input.length : end + 3
      continue
    }
    if (input.startsWith("<!", lt) || input.startsWith("<?", lt)) {
      i = findTagEnd(input, lt)
      continue
    }

    const m = /^<(\/?)([a-zA-Z][a-zA-Z0-9:-]*)/.exec(input.slice(lt))
    if (!m) {
      // A bare "<" in the copy — text, not markup.
      out += "&lt;"
      i = lt + 1
      continue
    }

    const closing = m[1] === "/"
    const name = m[2].toLowerCase()
    const tagEnd = findTagEnd(input, lt)

    if (DROP_CONTENT_TAGS.has(name)) {
      if (closing) {
        i = tagEnd
        continue
      }
      const close = new RegExp(`</${name}[\\s>]`, "i").exec(input.slice(tagEnd))
      i = close ? findTagEnd(input, tagEnd + close.index) : input.length
      continue
    }

    if (!ALLOWED_TAGS.has(name)) {
      // Unknown tag: drop the markup, keep whatever it wrapped.
      i = tagEnd
      continue
    }

    if (closing) {
      if (!VOID_TAGS.has(name)) {
        const at = open.lastIndexOf(name)
        if (at !== -1) {
          // Close anything left dangling inside it, then the tag itself.
          for (let k = open.length - 1; k >= at; k--) out += `</${open[k]}>`
          open.length = at
        }
      }
      i = tagEnd
      continue
    }

    const attrsRaw = input.slice(lt + m[0].length, Math.max(lt + m[0].length, tagEnd - 1))
    const attrs = sanitizeAttrs(attrsRaw.replace(/\/\s*$/, ""))
    if (VOID_TAGS.has(name)) {
      out += `<${name}${attrs}>`
    } else if (/\/\s*$/.test(attrsRaw)) {
      // Self-closed non-void tag (<span/>) — nothing can be inside it.
      out += `<${name}${attrs}></${name}>`
    } else {
      out += `<${name}${attrs}>`
      open.push(name)
    }
    i = tagEnd
  }

  for (let k = open.length - 1; k >= 0; k--) out += `</${open[k]}>`
  return out
}
