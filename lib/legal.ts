/**
 * Business details used by the Privacy and Terms pages.
 *
 * Hookana has no public pricing checkout: every client works under their own
 * written contract, so payment and cancellation live in those contracts, not
 * on the website. Address and GST aren't shown on purpose (not required for a
 * portfolio site; GST belongs on invoices).
 */
export const legal = {
  /** Who runs the site, as shown in the policies */
  businessName: "Hookana",
  /** Where people write about privacy and their data */
  contactEmail: "admin@hookana.com",
  /** Law that governs the terms */
  governingLaw: "the laws of India",
  /** How long free-concepts requests are kept */
  leadRetention: "12 months after we last spoke",
  /** Date the current versions took effect */
  effectiveDate: "23 September 2026",
}
