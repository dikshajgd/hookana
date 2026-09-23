import type { Metadata } from "next"
import { LegalPage, Detail } from "@/components/legal/legal-page"
import { legal } from "@/lib/legal"

export const metadata: Metadata = {
  title: "Refunds & Cancellation - Hookana",
  description: "How Hookana plans are cancelled and when refunds apply.",
}

export default function RefundsPage() {
  return (
    <LegalPage title="Refunds & Cancellation">
      <section>
        <h2>Free concepts</h2>
        <p>Free concepts are free. No payment is taken, so there&rsquo;s nothing to refund.</p>
      </section>

      <Detail value={legal.cancellation}>
        <section>
          <h2>Cancelling a plan</h2>
          <p>{legal.cancellation}</p>
        </section>
      </Detail>

      <Detail value={legal.refunds}>
        <section>
          <h2>Refunds</h2>
          <p>{legal.refunds}</p>
        </section>
      </Detail>

      <section>
        <h2>Questions</h2>
        <p>
          Email <a href={`mailto:${legal.contactEmail}`}>{legal.contactEmail}</a> about any payment
          or cancellation question and we&rsquo;ll get back to you.
        </p>
      </section>
    </LegalPage>
  )
}
