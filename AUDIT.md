# Technical Audit — Hookana

<!-- impeccable:audit — 2026-10-13 -->

Code-level audit only (a11y, performance, theming, responsive, implementation integrity).
No design-taste changes made. Dev server run on `localhost:3917` (pre-existing, reused;
page HTML and compiled CSS inspected directly) plus static code review.

## Audit Health Score

| # | Dimension | Score | Key Finding |
|---|-----------|-------|-------------|
| 1 | Accessibility | 2/4 | Testimonial video's play/pause control is a `<div onClick>` with no role, tabIndex, or keydown — unreachable by keyboard/screen reader |
| 2 | Performance | 3/4 | Images consistently use `loading="lazy"`/`decoding="async"`; no `will-change` overuse or obvious layout thrash found |
| 3 | Theming | 1/4 | `--color-charcoal`, `--color-warm-linen`, `--color-sand`, `--color-paper-white` all alias to `#fff`; components still styled for a dark `bg-charcoal` (`text-white/50`, `text-white/70`) render white-on-white in the shipped "lime playground" theme |
| 4 | Responsive Design | 3/4 | Mobile nav open/close buttons are 36×36px (`size-9`), under the 44px touch-target minimum |
| 5 | Implementation Integrity | 2/4 | Detector + manual review found slop-pattern decoration and a dead component shipping a flash-rate animation |
| **Total** | | **11/20** | **Acceptable — significant work needed** |

## Implementation Integrity Verdict

**Pass, with one real regression.** The codebase is a coherent, product-specific
implementation (CMS-driven settings, a working in-browser editor, a themeable token
system) — it is not generic or templated. The one systemic problem is the "lime
playground" re-theme (commits `51e0011`, `947877a`) that collapsed several legacy
semantic color names onto the new flat palette as "compatibility aliases," without
updating the components that still assume the old dark/light split those names used
to carry. That is a genuine implementation defect, not a style complaint.

## Executive Summary

- Audit Health Score: **11/20** (Acceptable — significant work needed)
- Issues found: 1 P0, 2 P1, 3 P2, 2 P3
- Top issues:
  1. **White-on-white footer/logo-ticker text** under the live default theme (P0)
  2. Testimonial video toggle is keyboard/screen-reader unreachable (P1)
  3. No `<h1>` anywhere on the public homepage (P1)
  4. Mobile menu buttons below the 44px touch-target minimum (P2)
  5. Six distinct brand accent colors collapsed onto one dark olive hex (P2)

## Detailed Findings by Severity

### P0 Blocking

**[P0] Footer and logo-ticker text invisible on its own background**
- **Location**: `components/landing/footer.tsx:56,76`, `components/landing/hero-carousel.tsx:35,61,68,75`; root cause in `app/globals.css:264-268`
- **Category**: Theming / Accessibility
- **Impact**: `bg-charcoal` resolves to `#fff` (confirmed in the compiled stylesheet served by the running dev build: `--color-charcoal: #fff;`), but the footer and the logo-ticker section still style their text as `text-white/50`, `text-white/60`, `text-white/70`, `border-white/30` — i.e. near-transparent white on a now-white background. The footer links/copyright line and the logo-ticker caption text are effectively unreadable under the shipped default theme. Same class of bug as a scroll-reveal stuck at `opacity: 0`: content is present in the DOM and never visible to a real user.
- **WCAG/Standard**: WCAG 1.4.3 (contrast minimum) — contrast ratio ≈1:1, far under the 4.5:1 requirement
- **Recommendation**: Either restore a real dark value for `--color-charcoal` or update the footer/logo-ticker text classes to a color that's legible against `#fff`. This needs a human call on which the "lime playground" theme intends, not a mechanical find-replace.
- **Suggested command**: `$impeccable harden`

### P1 Major

**[P1] Testimonial play/pause control is not operable by keyboard or screen reader**
- **Location**: `components/landing/testimonial.tsx:75`
- **Category**: Accessibility
- **Impact**: `<div className="... cursor-pointer" onClick={togglePlay}>` wraps the only control for pausing/resuming the autoplaying testimonial video. No `role="button"`, `tabIndex`, or `onKeyDown`. Keyboard and screen-reader users cannot pause an autoplaying video — a WCAG failure with a real usability cost (autoplay that can't be stopped).
- **WCAG/Standard**: WCAG 2.1.1 (keyboard), 2.2.2 (pause, stop, hide)
- **Recommendation**: Change to a real `<button type="button">` (the portfolio gallery's own play button at `components/landing/portfolio-gallery.tsx:151` already does this correctly — reuse that pattern).
- **Suggested command**: `$impeccable harden`

**[P1] No `<h1>` anywhere on the public homepage**
- **Location**: `components/landing/hero.tsx:148` (`<EditableText as="p" path="hero.headline" ...>`)
- **Category**: Accessibility
- **Impact**: The homepage's main headline renders as a `<p>`, not a heading. Grepping the whole `app/(site)` tree plus `hero.tsx` found zero `<h1>` elements on the homepage. Screen-reader users navigating by heading structure get no page title landmark; this also weakens on-page SEO signal for a marketing site whose whole job is being found and converting visitors.
- **WCAG/Standard**: WCAG 1.3.1 (info and relationships) / 2.4.6 (headings and labels)
- **Recommendation**: Render the hero headline as `as="h1"` (the `EditableText` component already supports an `as` prop per its own usage elsewhere).
- **Suggested command**: `$impeccable harden`

### P2 Minor

**[P2] Mobile nav buttons under the 44px touch-target minimum**
- **Location**: `components/layout/Navbar.tsx:181,205` (`size-9` = 36px menu-open and menu-close buttons)
- **Category**: Responsive Design
- **Impact**: Both the hamburger trigger and the drawer's close button are 36×36px circles, below the 44×44px minimum recommended for reliable touch accuracy, on the one nav control every mobile visitor uses.
- **WCAG/Standard**: WCAG 2.5.5 (target size, AAA) / platform touch-target guidance
- **Recommendation**: Bump to `size-11` (44px) or add invisible hit-area padding.
- **Suggested command**: `$impeccable adapt`

**[P2] Six brand accent colors collapsed onto one hex**
- **Location**: `app/globals.css:270-275` (`--color-sun-yellow`, `--color-hot-pink`, `--color-lime-burst`, `--color-periwinkle`, `--color-spring-green`, `--color-bubblegum` all set to `#3e4600`)
- **Category**: Theming
- **Impact**: `text-hot-pink` is used for the required-field asterisk in `cta-form.tsx:269` and for an accent heading in `faq.tsx:71` and `what-we-do.tsx:246`. None of these render pink; they render the same dark olive as every other "accent" token. Anywhere the design intent relies on these being visually distinct colors, that distinction no longer exists.
- **Recommendation**: Decide whether these six names still need to resolve to distinct hues under the new palette, or should be deprecated/renamed so future code doesn't reach for a "hot-pink" expecting pink.
- **Suggested command**: `$impeccable colorize`

**[P2] Global `prefers-reduced-motion` rule kills all transitions, not just loops**
- **Location**: `app/globals.css:472-482`
- **Category**: Accessibility
- **Impact**: The comment says this is meant to stop "the logo/stats marquees and other looping animations," but the selector is `*, *::before, *::after` with `animation-duration` and `transition-duration` forced to `0.001ms`. That also kills ordinary hover/focus/state-change transitions (menu open/close, button hover) for every motion-sensitive user, not just decorative loops — removing useful feedback, not just comfort-breaking motion.
- **WCAG/Standard**: WCAG 2.3.3 (animation from interactions, AAA) — over-correction in the opposite direction
- **Recommendation**: Scope the reduced-motion override to the specific looping/marquee animations instead of a blanket `*` rule.
- **Suggested command**: `$impeccable harden`

### P3 Polish

**[P3] Dead component ships a flash-rate animation**
- **Location**: `components/landing/fade-in.tsx`
- **Category**: Implementation Integrity / Accessibility
- **Impact**: `FadeIn` is fully implemented (IntersectionObserver reveal) but unused anywhere in `app/` or `components/` — confirmed via repo-wide search for `<FadeIn` and its import path. Its `blinkIn` keyframe oscillates opacity 0→1→0.2→1→0.4→1 within 0.7s, roughly 5 flashes in well under a second — above the 3-flashes-per-second threshold WCAG 2.3.1 treats as a seizure risk — and it ignores `prefers-reduced-motion` entirely. Currently harmless because it's dead code, but it's a landmine if someone wires it up later without re-reading it.
- **Recommendation**: Either delete the component or fix the keyframe (single smooth fade, no oscillation) and respect reduced-motion before it's ever used.
- **Suggested command**: `$impeccable optimize`

**[P3] Three AI-slop decoration patterns (detector, advisory/warning)**
- **Location**: `components/landing/hero.tsx:355` (`animate-bounce`), `components/landing/what-we-do.tsx:190,308` (`border-l-8`/`border-l-10`/`border-l-20` thick side-tab accent borders)
- **Category**: Implementation Integrity
- **Impact**: Cosmetic only — bounce easing and thick one-sided accent borders are the detector's "looks AI-generated" tells, not functional bugs.
- **Recommendation**: Swap bounce for an exponential ease-out; replace the side-tab border with a subtler accent treatment.
- **Suggested command**: `$impeccable polish`

## Patterns & Systemic Issues

- **Token-alias drift from the "lime playground" re-theme** is the one systemic issue:
  it touches theming (charcoal/linen/sand collapsing to white), accessibility (the
  resulting contrast failure), and implementation integrity (components left
  un-migrated) all from the same root cause. Fixing the aliases fixes three
  dimensions at once.

## Positive Findings

- Image handling is consistently good: `loading="lazy"`, `decoding="async"`, and
  correctly empty `alt=""` + `aria-hidden` on purely decorative SVGs, real
  descriptive `alt` text everywhere content actually needs it.
- `components/landing/portfolio-gallery.tsx` and `components/landing/animated-stat.tsx`
  show the right patterns already in this codebase: real `<button>` elements with
  `aria-label` for interactive media, and explicit `prefers-reduced-motion` handling
  in the stat counter — the testimonial toggle and the global motion rule should be
  brought in line with these, not the other way around.
- No `will-change` overuse and no layout-thrash patterns found anywhere in the scan.

## Recommended Actions

1. **[P0] `$impeccable harden`**: Fix the white-on-white footer/logo-ticker text —
   decide the right dark value for `--color-charcoal` or recolor the dependent text.
2. **[P1] `$impeccable harden`**: Make the testimonial play/pause control a real
   `<button>`; promote the hero headline to `<h1>`.
3. **[P2] `$impeccable adapt`**: Bring mobile nav buttons up to a 44px touch target.
4. **[P2] `$impeccable colorize`**: Decide the fate of the six collapsed accent
   color tokens.
5. **[P2] `$impeccable harden`**: Scope the global reduced-motion rule to loops only.
6. **[P3] `$impeccable optimize`**: Delete or fix the dead `FadeIn` component's
   flash-rate animation.
7. **[P3] `$impeccable polish`**: Clean up the bounce easing and side-tab borders.
8. **`$impeccable polish`**: Final pass once the above land.

You can ask me to run these one at a time, all at once, or in any order you prefer.

Re-run `$impeccable audit` after fixes to see your score improve.
