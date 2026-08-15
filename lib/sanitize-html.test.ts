import { describe, it, expect } from "vitest"
import { sanitizeRichText } from "./sanitize-html"

describe("sanitizeRichText", () => {
  describe("keeps what the toolbar produces", () => {
    it("preserves the formatting tags", () => {
      const html = "<b>bold</b> <i>it</i> <u>u</u> <s>s</s> <strong>st</strong> <em>em</em>"
      expect(sanitizeRichText(html)).toBe(html)
    })

    it("preserves execCommand's styled spans", () => {
      expect(sanitizeRichText('<span style="font-weight: bold;">hi</span>')).toBe(
        '<span style="font-weight: bold">hi</span>'
      )
      expect(sanitizeRichText('<span style="color: rgb(30, 58, 138);">hi</span>')).toBe(
        '<span style="color: rgb(30, 58, 138)">hi</span>'
      )
      expect(sanitizeRichText('<span style="text-decoration: underline;">hi</span>')).toBe(
        '<span style="text-decoration: underline">hi</span>'
      )
    })

    it("preserves legacy <font color>", () => {
      expect(sanitizeRichText('<font color="#65a30d">x</font>')).toBe(
        '<font color="#65a30d">x</font>'
      )
    })

    it("preserves <br> and block wrappers", () => {
      expect(sanitizeRichText("a<br>b")).toBe("a<br>b")
      expect(sanitizeRichText("<p>a</p><div>b</div>")).toBe("<p>a</p><div>b</div>")
    })

    it("leaves existing character references alone", () => {
      expect(sanitizeRichText("a&nbsp;b &amp; c")).toBe("a&nbsp;b &amp; c")
    })

    it("escapes a bare ampersand", () => {
      expect(sanitizeRichText("Ben & Jerry")).toBe("Ben &amp; Jerry")
    })

    it("passes plain text through untouched", () => {
      expect(sanitizeRichText("PERFORMANCE MARKETERS WHO REFUSE TO COMPROMISE.")).toBe(
        "PERFORMANCE MARKETERS WHO REFUSE TO COMPROMISE."
      )
    })

    it("handles empty and nullish input", () => {
      expect(sanitizeRichText("")).toBe("")
      expect(sanitizeRichText(undefined as unknown as string)).toBe("")
    })
  })

  describe("strips script execution vectors", () => {
    it("drops a script tag and its contents", () => {
      expect(sanitizeRichText("a<script>alert(1)</script>b")).toBe("ab")
    })

    it("drops script contents even when the tag has attributes", () => {
      expect(sanitizeRichText("a<script type='text/javascript'>alert(1)</script>b")).toBe("ab")
    })

    it("drops an unclosed script entirely", () => {
      expect(sanitizeRichText("a<script>alert(1)")).toBe("a")
    })

    it("drops event handlers from allowed tags", () => {
      expect(sanitizeRichText('<span onclick="alert(1)">x</span>')).toBe("<span>x</span>")
      expect(sanitizeRichText('<b onmouseover=alert(1)>x</b>')).toBe("<b>x</b>")
    })

    it("drops img/svg/iframe payloads", () => {
      expect(sanitizeRichText('<img src=x onerror="alert(1)">')).toBe("")
      expect(sanitizeRichText("<svg><script>alert(1)</script></svg>")).toBe("")
      expect(sanitizeRichText('<iframe src="javascript:alert(1)"></iframe>')).toBe("")
    })

    it("drops anchors, keeping their text", () => {
      expect(sanitizeRichText('<a href="javascript:alert(1)">click</a>')).toBe("click")
    })

    it("leaves nested-tag smuggling as inert text", () => {
      // The <scr<script> soup parses as one unknown tag and is dropped; what
      // remains is escaped text, with no tag of any kind left in the output.
      const out = sanitizeRichText("<scr<script>ipt>alert(1)</script>")
      expect(out).toBe("ipt&gt;alert(1)")
      expect(out).not.toMatch(/</)
    })

    it("does not resurrect markup from escaped text", () => {
      expect(sanitizeRichText("&lt;script&gt;alert(1)&lt;/script&gt;")).toBe(
        "&lt;script&gt;alert(1)&lt;/script&gt;"
      )
    })
  })

  describe("filters styles", () => {
    it("drops non-allowlisted properties", () => {
      expect(sanitizeRichText('<span style="position: fixed; color: red">x</span>')).toBe(
        '<span style="color: red">x</span>'
      )
    })

    it("drops url() values", () => {
      expect(
        sanitizeRichText('<span style="background-color: url(javascript:alert(1))">x</span>')
      ).toBe("<span>x</span>")
    })

    it("drops values carrying a colon or escape", () => {
      expect(sanitizeRichText('<span style="color: javascript:alert(1)">x</span>')).toBe(
        "<span>x</span>"
      )
      expect(sanitizeRichText('<span style="color: \\6a avascript">x</span>')).toBe("<span>x</span>")
    })

    it("drops entity-encoded style payloads", () => {
      expect(sanitizeRichText('<span style="color: &#106;avascript">x</span>')).toBe("<span>x</span>")
    })

    it("drops a bogus color attribute", () => {
      expect(sanitizeRichText('<font color="javascript:alert(1)">x</font>')).toBe("<font>x</font>")
    })

    it("drops an empty style attribute", () => {
      expect(sanitizeRichText('<span style="">x</span>')).toBe("<span>x</span>")
    })
  })

  describe("normalises structure", () => {
    it("closes tags left open", () => {
      expect(sanitizeRichText("<b>bold")).toBe("<b>bold</b>")
      expect(sanitizeRichText("<b><i>x")).toBe("<b><i>x</i></b>")
    })

    it("drops stray closing tags", () => {
      expect(sanitizeRichText("x</b>")).toBe("x")
    })

    it("repairs crossed nesting", () => {
      expect(sanitizeRichText("<b><i>x</b></i>")).toBe("<b><i>x</i></b>")
    })

    it("drops comments", () => {
      expect(sanitizeRichText("a<!-- note -->b")).toBe("ab")
    })

    it("keeps a bare < as text", () => {
      expect(sanitizeRichText("5 < 10")).toBe("5 &lt; 10")
    })

    it("keeps no attributes off an unterminated tag", () => {
      expect(sanitizeRichText('a<span style="color: red')).toBe("a<span></span>")
    })

    it("does not leave a self-closed span open", () => {
      expect(sanitizeRichText("<span/>x")).toBe("<span></span>x")
    })
  })
})
