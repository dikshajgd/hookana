/**
 * Business details used by the Privacy, Terms and Refunds pages and the footer.
 *
 * Everything the legal pages say about the business comes from this one file,
 * so updating a detail here updates every page. Values marked PENDING are
 * waiting on Diksha's answers; `legalReady` stays false (and the pages show a
 * "being finalised" note instead of a blank) until they are filled in.
 */
export const legal = {
  /** Registered business name, e.g. "Hookana Creative LLP" */
  businessName: "PENDING",
  /** Business type, e.g. "sole proprietorship", "LLP", "private limited company" */
  businessType: "PENDING",
  /** Registered address, shown on the legal pages and in the footer */
  address: "PENDING",
  /** GST number if registered, otherwise leave as "" */
  gstin: "",
  /** Where people write about privacy, data, refunds */
  contactEmail: "admin@hookana.com",
  /** Courts / law that govern the terms */
  governingLaw: "the laws of India",
  /** How clients cancel a plan, in plain words */
  cancellation: "PENDING",
  /** What happens to money already paid when a client cancels */
  refunds: "PENDING",
  /** How long lead-form details are kept after the last contact */
  leadRetention: "PENDING",
  /** Date the current versions took effect */
  effectiveDate: "PENDING",
}

export const legalReady = !Object.values(legal).some((v) => v === "PENDING")
