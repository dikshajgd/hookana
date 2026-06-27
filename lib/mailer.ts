import { Resend } from "resend"

export function getResend() {
  if (!process.env.RESEND_API_KEY) {
    throw new Error("RESEND_API_KEY is not configured")
  }
  return new Resend(process.env.RESEND_API_KEY)
}

export const FROM_ADDRESS =
  process.env.NEWSLETTER_FROM ?? "Hookana <newsletter@hookana.com>"
