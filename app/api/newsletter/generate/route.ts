import { GoogleGenerativeAI } from "@google/generative-ai"
import { NextRequest, NextResponse } from "next/server"
import { buildEmailHtml, buildPlainText, type NewsletterContent } from "@/lib/email-template"

const gemini = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!)

function parse(text: string, key: string): string {
  const match = text.match(
    new RegExp(`${key}:\\s*([\\s\\S]*?)(?=\\n[A-Z][A-Z_0-9]+:|$)`)
  )
  return match?.[1]?.trim() ?? ""
}

export async function POST(req: NextRequest) {
  const {
    topic,
    context,
    references,
    useWebSearch,
    hintSubject,
  } = await req.json().catch(() => ({}))

  if (!topic) {
    return NextResponse.json({ error: "Topic is required" }, { status: 400 })
  }

  try {
    // Step 1: Generate structured newsletter content (with optional web search)
    const contentModel = gemini.getGenerativeModel({
      model: "gemini-2.5-flash",
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      tools: useWebSearch ? [{ google_search: {} } as any] : [],
    })

    const contentPrompt = `You are writing a weekly newsletter for Hookana — a creative production agency that makes high-performing ads for D2C brands. The readers are performance marketers and brand founders.

Write newsletter content about: ${topic}
${hintSubject ? `Suggested subject line: ${hintSubject}` : ""}
${context ? `Additional context: ${context}` : ""}
${references ? `References/sources to weave in: ${references}` : ""}
${useWebSearch ? "Use Google Search to find current data, recent examples, and timely information." : ""}

Format your response EXACTLY like this (include all labels, one value per label):
SUBJECT: [compelling subject line, max 60 chars, no quotes]
PREHEADER: [preview text shown after subject in inbox, max 90 chars]
HEADLINE: [newsletter main headline, punchy and specific]
INTRO: [1-2 sentence hook paragraph]
SECTION_1_HEADING: [first section heading]
SECTION_1_BODY: [2-3 paragraph body, data-driven and specific]
SECTION_2_HEADING: [second section heading]
SECTION_2_BODY: [2-3 paragraph body]
HIGHLIGHT: [one punchy key takeaway or stat to call out]
CTA_CONTEXT: [1-2 sentences setting up the call to action]
CTA_TEXT: [call to action button text, max 5 words]

Be specific, data-driven, and useful. No generic advice. Write for performance marketers who run D2C brands.`

    const contentResult = await contentModel.generateContent(contentPrompt)
    const contentText = contentResult.response.text()

    const structured: NewsletterContent = {
      subject: parse(contentText, "SUBJECT") || topic,
      preheader: parse(contentText, "PREHEADER"),
      headline: parse(contentText, "HEADLINE") || topic,
      intro: parse(contentText, "INTRO"),
      section1Heading: parse(contentText, "SECTION_1_HEADING"),
      section1Body: parse(contentText, "SECTION_1_BODY"),
      section2Heading: parse(contentText, "SECTION_2_HEADING") || undefined,
      section2Body: parse(contentText, "SECTION_2_BODY") || undefined,
      highlight: parse(contentText, "HIGHLIGHT"),
      ctaContext: parse(contentText, "CTA_CONTEXT"),
      ctaText: parse(contentText, "CTA_TEXT") || "See How Hookana Can Help",
    }

    const htmlContent = buildEmailHtml(structured)
    const plainText = buildPlainText(structured)

    return NextResponse.json({
      subject: structured.subject,
      htmlContent,
      plainText,
      structured,
    })
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Generation failed" },
      { status: 500 }
    )
  }
}
