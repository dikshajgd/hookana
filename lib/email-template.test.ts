import { describe, it, expect } from "vitest"
import { buildEmailHtml, buildPlainText, type NewsletterContent } from "./email-template"

function content(o: Partial<NewsletterContent> = {}): NewsletterContent {
  return {
    subject: "Subj",
    preheader: "Pre",
    headline: "The Headline",
    intro: "Intro line one.\n\nIntro line two.",
    section1Heading: "First Section",
    section1Body: "Body one.",
    highlight: "Key stat here",
    ctaText: "Book a call",
    ctaContext: "Ready to go?",
    ...o,
  }
}

describe("buildEmailHtml", () => {
  it("renders a full HTML document with headline + cta", () => {
    const html = buildEmailHtml(content())
    expect(html.startsWith("<!DOCTYPE html>")).toBe(true)
    expect(html).toContain("The Headline")
    expect(html).toContain("Book a call")
    expect(html).toContain("Key stat here")
    expect(html).toContain("Ready to go?")
  })

  it("splits double-newline intro into separate <p> paragraphs", () => {
    const html = buildEmailHtml(content())
    const paras = html.match(/Intro line one\.|Intro line two\./g)
    expect(paras).toHaveLength(2)
  })

  it("omits the second section block when section2Heading is absent", () => {
    const html = buildEmailHtml(content({ section2Heading: undefined, section2Body: undefined }))
    expect(html).not.toContain("</h2>\n          ") // no second heading block
    // sanity: with a section 2 it IS present
    const withS2 = buildEmailHtml(content({ section2Heading: "Second", section2Body: "More" }))
    expect(withS2).toContain("Second")
    expect(withS2).toContain("More")
  })

  it("always includes an unsubscribe link", () => {
    expect(buildEmailHtml(content())).toContain("hookana.com/unsubscribe")
  })
})

describe("buildPlainText", () => {
  it("uppercases the headline and includes the CTA url", () => {
    const txt = buildPlainText(content())
    expect(txt).toContain("THE HEADLINE")
    expect(txt).toContain("Book a call: https://hookana.com")
    expect(txt).toContain("KEY TAKEAWAY")
  })

  it("includes section 2 only when present", () => {
    expect(buildPlainText(content())).not.toContain("SECOND")
    expect(buildPlainText(content({ section2Heading: "Second", section2Body: "x" }))).toContain("SECOND")
  })

  it("always includes an unsubscribe pointer", () => {
    expect(buildPlainText(content())).toContain("Unsubscribe: https://hookana.com/unsubscribe")
  })
})
