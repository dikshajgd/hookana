"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { ArrowUpRight, Menu, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Sheet,
  SheetContent,
  SheetClose,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { VisuallyHidden } from "@radix-ui/react-visually-hidden"
import { cn } from "@/lib/utils"
import type { NavbarContent } from "@/sanity/lib/types"

const PORTFOLIO_SUB_LINKS = [
  { label: "AI", href: "/portfolio/ai" },
  { label: "Statics", href: "/portfolio/statics" },
  { label: "Videos", href: "/portfolio/videos" },
]

const PORTFOLIO_SUB_HREFS = PORTFOLIO_SUB_LINKS.map((l) => l.href)

const FALLBACK_LINKS = [
  { label: "How it works", href: "#how-it-works" },
  { label: "Services", href: "#services" },
  { label: "Pricing", href: "#pricing" },
  { label: "Portfolio", href: "/portfolio" },
  { label: "Tools", href: "/tools" },
  { label: "Contact", href: "#contact" },
  ...PORTFOLIO_SUB_LINKS,
]

const FALLBACK_GROUPS = [
  FALLBACK_LINKS.slice(0, 3),
  FALLBACK_LINKS.slice(3, 6),
  FALLBACK_LINKS.slice(6, 9),
]

export function Navbar({ content }: { content: NavbarContent | null }) {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const pathname = usePathname()
  const router = useRouter()

  function navigateTo(href: string) {
    if (href.startsWith("#")) {
      const id = href.slice(1)
      if (pathname === "/") {
        document.getElementById(id)?.scrollIntoView()
      } else {
        router.push(`/${href}`)
      }
    } else if (href.startsWith("/")) {
      if (href === pathname) {
        window.scrollTo({ top: 0 })
      } else {
        router.push(href)
      }
    }
  }

  function closeAndScroll(href: string) {
    setMenuOpen(false)
    navigateTo(href)
  }

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 80)
    window.addEventListener("scroll", handleScroll, { passive: true })
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  useEffect(() => {
    if (pathname !== "/") return
    if (typeof window === "undefined") return
    const hash = window.location.hash
    if (!hash) return
    const id = hash.slice(1)
    requestAnimationFrame(() => {
      document.getElementById(id)?.scrollIntoView()
    })
  }, [pathname])

  const allLinks = content?.links ?? FALLBACK_LINKS
  const logoText = content?.logoText ?? "HOOKANA"
  const ctaText = content?.ctaText ?? "GET 2 FREE CONCEPTS"

  // Group desktop links 3-2-2 (or split evenly if different count)
  const navGroups = content?.links
    ? [allLinks.slice(0, 3), allLinks.slice(3, 5), allLinks.slice(5)]
    : FALLBACK_GROUPS

  return (
    <>
      {/* Full static navbar — desktop only */}
      <header className="mt-12 hidden w-full px-6 lg:block 2xl:px-10">
        <div className="flex w-full items-start justify-between">
          <Link
            href="/"
            className="font-ease text-[42px] leading-8 font-normal tracking-[-0.04em] text-ink xl:text-[60px] xl:leading-10 2xl:text-[64px] 2xl:leading-12"
            onClick={(e) => {
              if (pathname === "/") {
                e.preventDefault()
                window.scrollTo({ top: 0 })
              }
            }}
          >
            {logoText}
          </Link>

          <nav className="hidden w-full max-w-108 justify-between lg:flex xl:max-w-160 2xl:max-w-210">
            {navGroups.map((group, i) => (
              <div key={i} className="flex flex-col gap-1 2xl:gap-2">
                {group.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href.startsWith("#") && pathname !== "/" ? `/${link.href}` : link.href}
                    onClick={(e) => {
                      e.preventDefault()
                      navigateTo(link.href)
                    }}
                    className="font-ease text-sm font-normal tracking-[-0.02em] whitespace-nowrap text-ink transition-opacity hover:opacity-60 xl:text-lg"
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
            ))}
          </nav>

          <Button
            size="lg"
            className="font-ease h-11 shrink-0 rounded-[160px] border border-ink bg-sun-yellow px-6 text-xs font-normal tracking-[-0.02em] text-ink shadow-none hover:bg-sun-yellow/90 xl:h-12 xl:px-7 xl:text-sm"
            variant="default"
            asChild
          >
            <Link
              href={pathname === "/" ? "#contact" : "/#contact"}
              onClick={(e) => {
                e.preventDefault()
                navigateTo("#contact")
              }}
            >
              {ctaText}
              <ArrowUpRight className="size-4" />
            </Link>
          </Button>
        </div>
      </header>

      {/* Compact floating navbar on scroll */}
      <div
        className={cn(
          "fixed top-5 left-1/2 z-50 -translate-x-1/2 transition-all duration-300",
          scrolled
            ? "pointer-events-auto translate-y-0 opacity-100"
            : "pointer-events-auto translate-y-0 opacity-100 lg:pointer-events-none lg:-translate-y-3 lg:opacity-0"
        )}
      >
        <div className="flex items-center gap-4 rounded-full border border-ink bg-paper-white py-3 pr-3 pl-6 shadow-[1px_0px_5px_0px_rgba(0,0,0,0.13),2px_2px_4px_1px_rgba(0,0,0,0.08)]">
          <Link
            href="/"
            className="font-ease text-lg leading-none font-normal tracking-[-0.03em] whitespace-nowrap text-ink"
            onClick={(e) => {
              if (pathname === "/") {
                e.preventDefault()
                window.scrollTo({ top: 0 })
              }
            }}
          >
            {logoText}
          </Link>

          <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
            <SheetTrigger asChild>
              <button
                className="flex size-9 items-center justify-center rounded-full bg-ink text-paper-white transition-colors hover:bg-charcoal"
                aria-label="Open menu"
              >
                <Menu className="size-4" />
              </button>
            </SheetTrigger>
            <SheetContent
              side="right"
              className="w-full max-w-full border-none bg-charcoal p-0 sm:w-180! sm:max-w-[720px]"
              showCloseButton={false}
            >
              <VisuallyHidden>
                <SheetTitle>Navigation menu</SheetTitle>
              </VisuallyHidden>
              <div className="flex h-full flex-col">
                {/* Drawer header */}
                <div className="flex items-center justify-between px-6 pt-8 pb-6 sm:items-start sm:px-14 sm:pt-14 sm:pb-12">
                  <Link
                    href="/"
                    className="font-sans text-[40px] leading-none font-black tracking-[-2px] text-white sm:text-[56px] sm:tracking-[-2px]"
                  >
                    {logoText}
                  </Link>
                  <SheetClose asChild>
                    <button
                      className="flex size-9 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20 sm:mt-2 sm:size-10"
                      aria-label="Close menu"
                    >
                      <X className="size-4 sm:size-5" />
                    </button>
                  </SheetClose>
                </div>

                {/* Nav links */}
                <nav className="flex flex-1 flex-col border-t border-white/10 px-6 sm:px-14">
                  {allLinks
                    .filter((link) => !PORTFOLIO_SUB_HREFS.includes(link.href))
                    .map((link) => (
                      <div key={link.href} className="border-b border-white/10 last:border-none">
                        <Link
                          href={link.href}
                          className="group flex items-center justify-between py-4 sm:py-6"
                          onClick={(e) => {
                            e.preventDefault()
                            closeAndScroll(link.href)
                          }}
                        >
                          <span className="text-[28px] font-light leading-tight text-white/60 transition-colors group-hover:text-white sm:text-2xl sm:font-semibold">
                            {link.label}
                          </span>
                          <ArrowUpRight className="size-5 text-white/40 transition-colors group-hover:text-white sm:size-5" />
                        </Link>
                        {link.href === "/portfolio" && (
                          <div className="flex items-center gap-4 pb-3">
                            {PORTFOLIO_SUB_LINKS.map((sub) => (
                              <Link
                                key={sub.href}
                                href={sub.href}
                                onClick={() => setMenuOpen(false)}
                                className={cn(
                                  "text-base font-medium transition-colors",
                                  pathname === sub.href
                                    ? "text-white"
                                    : "text-white/70 hover:text-white"
                                )}
                              >
                                {sub.label}
                              </Link>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                </nav>

                {/* CTA */}
                <div className="px-6 py-4 sm:px-14 sm:py-12">
                  <Button
                    size="lg"
                    className="w-full"
                    variant="default"
                    asChild
                  >
                    <Link
                      href="#contact"
                      onClick={(e) => {
                        e.preventDefault()
                        closeAndScroll("#contact")
                      }}
                    >
                      {ctaText}
                      <ArrowUpRight className="size-4" />
                    </Link>
                  </Button>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </>
  )
}
