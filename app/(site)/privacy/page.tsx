import type { Metadata } from "next"
import { LegalPage } from "@/components/legal/legal-page"
import { CookieSettingsLink } from "@/components/consent/analytics-consent"
import { legal } from "@/lib/legal"

export const metadata: Metadata = {
  title: "Privacy Policy - Hookana",
  description: "What Hookana collects, why, who it's shared with, and your choices.",
}

// Keep this page in step with the code. If you add a form field, a tracker,
// an embed or a new service, this page has to change too.
export default function PrivacyPage() {
  return (
    <LegalPage title="Privacy Policy">
      <section>
        <p>
          This page explains what information Hookana (&ldquo;we&rdquo;) collects when you use this website, why we
          collect it, who helps us handle it, and what you can ask us to do with it.
        </p>
      </section>

      <section>
        <h2>What we collect</h2>
        <ul>
          <li>
            <strong>When you ask for free concepts</strong> (the form on the homepage): your name,
            brand name, website, email, and anything you tell us about your product, budget, ad
            spend, brief and brand assets. We use this to reply to you and prepare your concepts.
          </li>
          <li>
            <strong>When you join the newsletter:</strong> your email address. We use it only to
            send you the newsletter. Every issue has an unsubscribe link.
          </li>
          <li>
            <strong>If you agree to analytics:</strong> Google Analytics records how the site is
            used, such as pages viewed, rough location, and device type. It only runs after you
            say yes in the cookie banner.
          </li>
          <li>
            <strong>Like every website,</strong> our hosting provider processes your IP address to
            deliver the pages to you.
          </li>
        </ul>
        <p className="mt-3">We don&rsquo;t sell your information, and we don&rsquo;t use it for anything else.</p>
      </section>

      <section>
        <h2>Who helps us handle it</h2>
        <p>We use a small number of services to run the site. Each one only gets what it needs:</p>
        <ul className="mt-3">
          <li>Vercel hosts the website.</li>
          <li>Google (Apps Script and Sheets) receives and stores the free-concepts form.</li>
          <li>Supabase stores the newsletter subscriber list.</li>
          <li>Resend sends our emails, including the newsletter.</li>
          <li>Cloudinary delivers the images and videos on the site.</li>
          <li>Google Analytics measures site usage, only if you allow it.</li>
          <li>YouTube plays some videos, using its privacy-enhanced player.</li>
        </ul>
        <p className="mt-3">
          Some of these services store data outside your country, including in the United States.
        </p>
      </section>

      <section id="cookies" className="scroll-mt-32">
        <h2>Cookies</h2>
        <p>
          The site works without cookies. The only optional ones are Google Analytics cookies, and
          they&rsquo;re set only if you click &ldquo;Allow&rdquo; in the banner. We remember your
          choice in your browser so we don&rsquo;t ask again. You can change it any time:{" "}
          <CookieSettingsLink />.
        </p>
      </section>

      <section>
        <h2>How long we keep it</h2>
        <ul>
          <li>Free-concepts requests: {legal.leadRetention}.</li>
          <li>Newsletter: until you unsubscribe.</li>
          <li>Analytics: Google Analytics keeps usage data for up to 14 months.</li>
        </ul>
      </section>

      <section>
        <h2>Your choices and rights</h2>
        <p>
          Wherever you are, you can ask us to show you the information we hold about you, correct
          it, or delete it. You can also withdraw your consent to analytics or the newsletter at any
          time. Email <a href={`mailto:${legal.contactEmail}`}>{legal.contactEmail}</a> and
          we&rsquo;ll respond within 30 days. In India this includes your rights under the Digital
          Personal Data Protection Act, 2023. If you&rsquo;re not happy with our answer, you can
          complain to the data protection authority where you live.
        </p>
      </section>

      <section>
        <h2>Children</h2>
        <p>This site is for businesses and isn&rsquo;t meant for anyone under 18.</p>
      </section>
    </LegalPage>
  )
}
