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

const INTER = `'Inter',-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif`

function nl2p(text: string, style = `margin:0 0 14px;color:#374151;font-size:15px;line-height:1.75;font-family:${INTER};`): string {
  return text
    .split(/\n\n+/)
    .filter((para) => para.trim() !== "")
    .map((para) => `<p style="${style}">${para.replace(/\n/g, " ").trim()}</p>`)
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

  const s2Block = section2Heading
    ? `
      <tr><td class="divider-td" style="background:#ffffff;padding:0 40px;"><hr style="border:none;border-top:1px solid #e8ecf3;margin:24px 0;"></td></tr>
      <tr><td class="section-td" style="background:#ffffff;padding:0 40px 24px;">
        <h2 class="section-h2" style="margin:0 0 14px;color:#0A1628;font-size:20px;font-weight:700;line-height:1.3;font-family:${INTER};">${section2Heading}</h2>
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
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet" type="text/css">
<style>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
body,td,th,p,h1,h2,h3,a,span,div{font-family:'Inter',-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;}
@media only screen and (max-width:600px){
  .outer-td{padding:16px 8px!important;}
  .header-td{padding:20px 20px!important;border-radius:8px 8px 0 0!important;}
  .hookana-logo{font-size:20px!important;letter-spacing:5px!important;}
  .hookana-sub{font-size:8px!important;letter-spacing:2px!important;}
  .headline-td{padding:24px 20px 0!important;}
  .headline{font-size:22px!important;letter-spacing:-0.3px!important;}
  .intro-td{padding:14px 20px 0!important;}
  .divider-td{padding:0 20px!important;}
  .section-td{padding:0 20px 18px!important;}
  .section-h2{font-size:17px!important;}
  .highlight-td{padding:0 20px 22px!important;}
  .highlight-box{padding:14px 16px!important;}
  .cta-td{padding:0 20px 28px!important;}
  .cta-btn a{padding:11px 22px!important;font-size:13px!important;}
  .footer-td{padding:22px 20px!important;border-radius:0 0 8px 8px!important;}
  .footer-text{font-size:10px!important;letter-spacing:2px!important;}
  p{font-size:14px!important;line-height:1.7!important;}
}
</style>
</head>
<body style="margin:0;padding:0;background-color:#f0f4ff;-webkit-text-size-adjust:100%;-ms-text-size-adjust:100%;">
<div style="display:none;max-height:0;overflow:hidden;">${preheader}&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f0f4ff;">
<tr><td class="outer-td" align="center" style="padding:32px 16px;">
<table role="presentation" width="100%" style="max-width:600px;" cellpadding="0" cellspacing="0">

  <!-- Header -->
  <tr><td class="header-td" style="background:#0A1628;border-radius:12px 12px 0 0;padding:30px 40px;text-align:center;">
    <a href="https://hookana.com" style="text-decoration:none;display:block;">
      <span class="hookana-logo" style="display:block;color:#ffffff;font-family:'Inter',-apple-system,BlinkMacSystemFont,sans-serif;font-size:28px;font-weight:800;letter-spacing:8px;text-transform:uppercase;">HOOKANA</span>
      <span class="hookana-sub" style="display:block;margin-top:7px;color:#7da3c8;font-size:10px;letter-spacing:4px;text-transform:uppercase;font-family:'Inter',-apple-system,BlinkMacSystemFont,sans-serif;font-weight:500;">CREATIVE EDGE WEEKLY</span>
    </a>
  </td></tr>

  <!-- Headline -->
  <tr><td class="headline-td" style="background:#ffffff;padding:36px 40px 0;">
    <h1 class="headline" style="margin:0;color:#0A1628;font-size:28px;font-weight:800;line-height:1.2;letter-spacing:-0.5px;font-family:'Inter',-apple-system,BlinkMacSystemFont,sans-serif;">${headline}</h1>
  </td></tr>

  <!-- Intro -->
  <tr><td class="intro-td" style="background:#ffffff;padding:18px 40px 0;">${nl2p(intro, `margin:0 0 14px;color:#374151;font-size:15px;line-height:1.75;font-family:${INTER};`)}</td></tr>

  <!-- Divider -->
  <tr><td class="divider-td" style="background:#ffffff;padding:0 40px;"><hr style="border:none;border-top:1px solid #e8ecf3;margin:24px 0;"></td></tr>

  <!-- Section 1 -->
  <tr><td class="section-td" style="background:#ffffff;padding:0 40px 24px;">
    <h2 class="section-h2" style="margin:0 0 14px;color:#0A1628;font-size:20px;font-weight:700;line-height:1.3;font-family:'Inter',-apple-system,BlinkMacSystemFont,sans-serif;">${section1Heading}</h2>
    ${nl2p(section1Body)}
  </td></tr>

  ${s2Block}

  <!-- Highlight Box -->
  <tr><td class="highlight-td" style="background:#ffffff;padding:0 40px 28px;">
    <div class="highlight-box" style="background:#f0f4ff;border-left:4px solid #0A1628;border-radius:0 8px 8px 0;padding:18px 22px;">
      <p style="margin:0;color:#0A1628;font-size:15px;font-weight:600;line-height:1.65;font-family:'Inter',-apple-system,BlinkMacSystemFont,sans-serif;">${highlight}</p>
    </div>
  </td></tr>

  <!-- CTA -->
  <tr><td class="cta-td" style="background:#ffffff;padding:0 40px 40px;">
    <p style="margin:0 0 18px;color:#374151;font-size:15px;line-height:1.65;font-family:'Inter',-apple-system,BlinkMacSystemFont,sans-serif;">${ctaContext}</p>
    <table class="cta-btn" role="presentation" cellpadding="0" cellspacing="0">
      <tr><td style="border-radius:8px;background:#0A1628;">
        <a href="https://hookana.com" style="display:inline-block;padding:13px 28px;color:#ffffff;font-size:14px;font-weight:700;text-decoration:none;letter-spacing:0.5px;font-family:'Inter',-apple-system,BlinkMacSystemFont,sans-serif;">${ctaText} &rarr;</a>
      </td></tr>
    </table>
  </td></tr>

  <!-- Footer -->
  <tr><td class="footer-td" style="background:#0A1628;border-radius:0 0 12px 12px;padding:26px 40px;text-align:center;">
    <p class="footer-text" style="margin:0 0 8px;color:#7da3c8;font-size:11px;font-family:'Inter',-apple-system,BlinkMacSystemFont,sans-serif;letter-spacing:3px;text-transform:uppercase;font-weight:500;">HOOKANA &middot; CREATIVE PRODUCTION</p>
    <p style="margin:0;font-size:11px;color:#4a6380;line-height:1.8;font-family:'Inter',-apple-system,BlinkMacSystemFont,sans-serif;">
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
