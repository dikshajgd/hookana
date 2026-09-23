import type { Metadata } from "next"
import { LegalPage } from "@/components/legal/legal-page"
import { legal } from "@/lib/legal"

export const metadata: Metadata = {
  title: "Terms of Service - Hookana",
  description: "The terms for using the Hookana website and working with Hookana.",
}

export default function TermsPage() {
  return (
    <LegalPage title="Terms of Service">
      <section>
        <p>
          These terms cover your use of this website and any creative work you order from Hookana.
          By using the site or working with us, you agree to them.
        </p>
      </section>

      <section>
        <h2>Our service</h2>
        <p>
          Hookana produces ad creatives for brands. The scope, deliverables, timelines and price of
          any paid work are agreed with you in writing before we start. If anything on this website
          differs from what we agree in writing, the written agreement wins.
        </p>
        <p className="mt-3">
          Free concepts are offered at our discretion. Asking for them doesn&rsquo;t oblige you to
          buy anything, and doesn&rsquo;t oblige us to take on the project.
        </p>
      </section>

      <section>
        <h2>Your materials</h2>
        <p>
          When you send us product photos, footage, logos or brand guides, you confirm you have the
          right to let us use them for your project. You keep ownership of everything you send us.
        </p>
      </section>

      <section>
        <h2>Ownership of the creatives</h2>
        <p>
          Once a creative is paid for in full, you can use it for your brand&rsquo;s marketing. We may
          show finished work in our portfolio unless you ask us not to.
        </p>
      </section>

      <section>
        <h2>Payments and cancellation</h2>
        <p>
          Fees, payment timing and how either side can end the work are set out in the written
          agreement for each project. Nothing on this website is a price list or an offer to sell.
        </p>
      </section>

      <section>
        <h2>Results</h2>
        <p>
          We work hard to make creatives that perform, but we can&rsquo;t guarantee specific
          advertising results, because those depend on things outside our control, like your
          targeting, budget and product.
        </p>
      </section>

      <section>
        <h2>Liability</h2>
        <p>
          The website is provided as it is. To the extent the law allows, our total responsibility
          for any claim about our work is limited to the amount you paid us for that work in the
          three months before the claim.
        </p>
      </section>

      <section>
        <h2>Changes and governing law</h2>
        <p>
          We may update these terms. The date at the top shows the latest version. These terms are
          governed by {legal.governingLaw}.
        </p>
      </section>

      <section>
        <h2>Contact</h2>
        <p>
          Questions about these terms: <a href={`mailto:${legal.contactEmail}`}>{legal.contactEmail}</a>
        </p>
      </section>
    </LegalPage>
  )
}
