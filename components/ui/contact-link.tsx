"use client"

import Link from "next/link"

export function ContactLink({
  children,
  className,
  disabled = false,
}: {
  children: React.ReactNode
  className?: string
  /** When true, clicks don't scroll — e.g. while editing the button's label. */
  disabled?: boolean
}) {
  return (
    <Link
      href="#contact"
      className={className}
      onClick={(e) => {
        e.preventDefault()
        if (!disabled)
          document.getElementById("contact")?.scrollIntoView({ behavior: "smooth" })
      }}
    >
      {children}
    </Link>
  )
}
