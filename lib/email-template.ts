export type NewsletterContent = {
  subject: string
  preheader: string
  headline: string
  intro: string
  section1Heading: string
  section1Body: string
  section2Heading?: string
  section2Body?: string
  highlight: string
  ctaText: string
  ctaContext: string
}

function nl2p(text: string, style = "margin:0 0 16px;color:#374151;font-size:15px;line-height:1.75;"): string {
  return text
    .split(/\n\n+/)
    .map((para) => `<p style="${style}">${para.replace(/\n/g, " ")}</p>`)
    .join("")
}

export function buildEmailHtml(content: NewsletterContent): string {
  const {
    preheader,
    headline,
    intro,
    section1Heading,
    section1Body,
    section2Heading,
    section2Body,
    highlight,
    ctaText,
    ctaContext,
  } = content

  const s2Block =
    section2Heading
      ? `
        <tr><td style="padding:0 40px;"><hr style="border:none;border-top:1px solid #e8ecf3;margin:28px 0;"></td></tr>
        <tr><td style="padding:0 40px 24px;">
          <h2 style="margin:0 0 14px;color:#0A1628;font-size:20px;font-weight:700;line-height:1.3;">${section2Heading}</h2>
          ${nl2p(section2Body ?? "")}
        </td></tr>`
      : ""

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="x-apple-disable-message-reformatting">
<title>${headline}</title>
</head>
<body style="margin:0;padding:0;background-color:#f0f4ff;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
<div style="display:none;max-height:0;overflow:hidden;">${preheader}&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f0f4ff;">
<tr><td align="center" style="padding:32px 16px;">
<table role="presentation" width="100%" style="max-width:600px;" cellpadding="0" cellspacing="0">

  <!-- Header -->
  <tr><td style="background:#0A1628;border-radius:12px 12px 0 0;padding:32px 40px;text-align:center;">
    <a href="https://hookana.com" style="text-decoration:none;">
      <span style="color:#ffffff;font-family:'Courier New',Courier,monospace;font-size:22px;font-weight:700;letter-spacing:5px;">HOOKANA</span>
    </a>
    <p style="margin:8px 0 0;color:#7da3c8;font-size:10px;letter-spacing:3px;text-transform:uppercase;font-family:'Courier New',Courier,monospace;">CREATIVE EDGE WEEKLY</p>
  </td></tr>

  <!-- Headline -->
  <tr><td style="background:#ffffff;padding:40px 40px 0;">
    <h1 style="margin:0;color:#0A1628;font-size:30px;font-weight:800;line-height:1.2;letter-spacing:-0.5px;">${headline}</h1>
  </td></tr>

  <!-- Intro -->
  <tr><td style="background:#ffffff;padding:20px 40px 0;">${nl2p(intro, "margin:0 0 16px;color:#374151;font-size:16px;line-height:1.75;")}</td></tr>

  <!-- Divider -->
  <tr><td style="background:#ffffff;padding:0 40px;"><hr style="border:none;border-top:1px solid #e8ecf3;margin:28px 0;"></td></tr>

  <!-- Section 1 -->
  <tr><td style="background:#ffffff;padding:0 40px 24px;">
    <h2 style="margin:0 0 14px;color:#0A1628;font-size:20px;font-weight:700;line-height:1.3;">${section1Heading}</h2>
    ${nl2p(section1Body)}
  </td></tr>

  ${s2Block}

  <!-- Highlight Box -->
  <tr><td style="background:#ffffff;padding:0 40px 28px;">
    <div style="background:#e8f0fe;border-left:4px solid #0A1628;border-radius:0 8px 8px 0;padding:20px 24px;">
      <p style="margin:0;color:#0A1628;font-size:15px;font-weight:600;line-height:1.65;">${highlight}</p>
    </div>
  </td></tr>

  <!-- CTA -->
  <tr><td style="background:#ffffff;padding:0 40px 40px;">
    <p style="margin:0 0 20px;color:#374151;font-size:15px;line-height:1.65;">${ctaContext}</p>
    <table role="presentation" cellpadding="0" cellspacing="0">
      <tr><td style="border-radius:8px;background:#0A1628;">
        <a href="https://hookana.com" style="display:inline-block;padding:14px 32px;color:#ffffff;font-size:14px;font-weight:700;text-decoration:none;letter-spacing:0.5px;">${ctaText} &rarr;</a>
      </td></tr>
    </table>
  </td></tr>

  <!-- Footer -->
  <tr><td style="background:#0A1628;border-radius:0 0 12px 12px;padding:28px 40px;text-align:center;">
    <p style="margin:0 0 10px;color:#7da3c8;font-size:11px;font-family:'Courier New',Courier,monospace;letter-spacing:3px;text-transform:uppercase;">HOOKANA &middot; CREATIVE PRODUCTION</p>
    <p style="margin:0;font-size:11px;color:#4a6380;line-height:1.8;">
      <a href="https://hookana.com" style="color:#7da3c8;text-decoration:none;">hookana.com</a>
      &nbsp;&middot;&nbsp;
      <a href="https://hookana.com/unsubscribe" style="color:#7da3c8;text-decoration:none;">Unsubscribe</a>
    </p>
  </td></tr>

</table>
</td></tr>
</table>
</body>
</html>`
}

export function buildPlainText(content: NewsletterContent): string {
  const lines: string[] = [
    content.headline.toUpperCase(),
    "=".repeat(52),
    "",
    content.intro,
    "",
    content.section1Heading.toUpperCase(),
    "-".repeat(content.section1Heading.length),
    content.section1Body,
    "",
  ]

  if (content.section2Heading) {
    lines.push(
      content.section2Heading.toUpperCase(),
      "-".repeat(content.section2Heading.length),
      content.section2Body ?? "",
      ""
    )
  }

  lines.push(
    "KEY TAKEAWAY",
    "-".repeat(12),
    content.highlight,
    "",
    content.ctaContext,
    `${content.ctaText}: https://hookana.com`,
    "",
    "---",
    "HOOKANA · Creative Production for D2C Brands",
    "https://hookana.com  |  Unsubscribe: https://hookana.com/unsubscribe"
  )

  return lines.join("\n")
}
