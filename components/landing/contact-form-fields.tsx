"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { FormField } from "./form-field"

type Status = "idle" | "submitting" | "success" | "error"

export function ContactFormFields() {
  const [status, setStatus] = useState<Status>("idle")
  const [errorMsg, setErrorMsg] = useState<string>("")

  const inputClass =
    "w-full rounded-sm border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-950 outline-none focus:border-neutral-950"

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setStatus("submitting")
    setErrorMsg("")
    const data = Object.fromEntries(new FormData(e.currentTarget).entries())
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })
      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        setErrorMsg(body.error || "Something went wrong. Please try again.")
        setStatus("error")
        return
      }
      setStatus("success")
      ;(e.target as HTMLFormElement).reset()
    } catch {
      setErrorMsg("Network error. Please try again.")
      setStatus("error")
    }
  }

  if (status === "success") {
    return (
      <div className="mt-12 rounded-sm border border-neutral-200 bg-white p-8 text-center shadow-xl 2xl:mt-24">
        <p className="type-heading-3 text-foreground">Thanks — we got it.</p>
        <p className="mt-3 font-mono text-xs text-blue-500">
          We&apos;ll be in touch within 1 business day.
        </p>
      </div>
    )
  }

  return (
    <form
      onSubmit={onSubmit}
      className="mt-12 flex flex-col gap-8 rounded-sm border border-neutral-200 bg-white p-6 shadow-xl 2xl:mt-24 2xl:p-8"
    >
      <FormField label="Your name" help="So we know who we're talking to.">
        <input
          name="name"
          type="text"
          required
          autoComplete="name"
          className={inputClass}
        />
      </FormField>

      <FormField label="Work email" help="We'll reply here within 1 business day.">
        <input
          name="email"
          type="email"
          required
          autoComplete="email"
          className={inputClass}
        />
      </FormField>

      <FormField label="Brand / company" help="Whose ads will we be making?">
        <input
          name="brand"
          type="text"
          autoComplete="organization"
          className={inputClass}
        />
      </FormField>

      <FormField label="Website" help="Optional — drop a link so we can study you.">
        <input
          name="website"
          type="url"
          inputMode="url"
          autoComplete="url"
          placeholder="https://"
          className={inputClass}
        />
      </FormField>

      <FormField label="Tell us about your brand" help="What you sell, who you sell to, what you're stuck on.">
        <textarea
          name="message"
          rows={4}
          className={`${inputClass} resize-y`}
        />
      </FormField>

      {status === "error" && (
        <p className="font-mono text-xs text-red-600">{errorMsg}</p>
      )}

      <Button
        type="submit"
        size="lg"
        className="w-full rounded-md sm:w-auto sm:self-start"
        disabled={status === "submitting"}
      >
        {status === "submitting" ? "Sending..." : "Get 2 free concepts"}
      </Button>
    </form>
  )
}
