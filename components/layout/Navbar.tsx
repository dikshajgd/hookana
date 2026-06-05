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

const FALLBACK_LINKS = [
  { label: "Home", href: "/" },
  { label: "How it works", href: "#how-it-works" },
  { label: "Services", href: "#services" },
  { label: "Pricing", href: "#pricing" },
  // { label: "Portfolio", href: "/portfolio" },
  { label: "Tools", href: "/tools" },
  { label: "Contact", href: "#contact" },
]

const FALLBACK_GROUPS = [
  FALLBACK_LINKS.slice(0, 3),
  FALLBACK_LINKS.slice(3, 5),
  FALLBACK_LINKS.slice(5, 7),
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
            className="font-sans text-[42px] leading-8 font-black tracking-tight text-black xl:text-[60px] xl:leading-10 2xl:text-[64px] 2xl:leading-12 2xl:tracking-[-1.5px]"
            onClick={(e) => {
              e.preventDefault()
              window.scrollTo({ top: 0 })
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
                    className="2xl:type-heading-4 text-sm font-semibold whitespace-nowrap text-primary-foreground transition-opacity hover:opacity-70 xl:text-lg"
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
            ))}
          </nav>

          <Button
            size="lg"
            className="h-10 rounded-md px-4 text-xs xl:h-11 xl:px-5 xl:text-sm 2xl:px-6 2xl:text-base"
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
        <div className="flex items-center gap-4 rounded-full bg-secondary py-3 pr-3 pl-6 shadow-xl">
          <Link
            href="/"
            className="font-sans text-lg leading-none font-black tracking-[-1px] whitespace-nowrap text-white"
            onClick={(e) => {
              e.preventDefault()
              window.scrollTo({ top: 0 })
            }}
          >
            {logoText}
          </Link>

          <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
            <SheetTrigger asChild>
              <button
                className="flex size-9 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20"
                aria-label="Open menu"
              >
                <Menu className="size-4" />
              </button>
            </SheetTrigger>
            <SheetContent
              side="right"
              className="w-full max-w-full border-none bg-secondary p-0 sm:w-180! sm:max-w-[720px]"
              showCloseButton={false}
            >
              <VisuallyHidden>
                <SheetTitle>Navigation menu</SheetTitle>
              </VisuallyHidden>
              <div className="flex h-full flex-col">
                {/* Drawer header */}
                <div className="flex items-start justify-between px-6 pt-8 pb-6 sm:px-14 sm:pt-14 sm:pb-12">
                  <Link
                    href="/"
                    className="font-sans text-[56px] leading-none font-black tracking-[-2px] text-white"
                  >
                    {logoText}
                  </Link>
                  <SheetClose asChild>
                    <button
                      className="mt-2 flex size-10 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20"
                      aria-label="Close menu"
                    >
                      <X className="size-5" />
                    </button>
                  </SheetClose>
                </div>

                {/* Nav links */}
                <nav className="flex flex-1 flex-col border-t border-white/10 px-6 pt-2 sm:px-14">
                  {allLinks.map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      className="group flex items-center justify-between border-b border-white/10 py-6 last:border-none"
                      onClick={(e) => {
                        e.preventDefault()
                        closeAndScroll(link.href)
                      }}
                    >
                      <span className="type-heading-3 text-white/60 transition-colors group-hover:text-white">
                        {link.label}
                      </span>
                      <ArrowUpRight className="size-5 text-white/20 transition-colors group-hover:text-white/60" />
                    </Link>
                  ))}
                </nav>

                {/* CTA */}
                <div className="px-6 py-8 sm:px-14 sm:py-12">
                  <Button
                    size="lg"
                    className="w-full rounded-md"
                    variant="destructive"
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
