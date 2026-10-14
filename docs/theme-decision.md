# Theme decision: what the "lime playground" theme is (IMPH0)

Date: 2026-10-13 · Source: `AUDIT.md` P0 + P2 "six accents" · Follow-ups: IMPH1 (P0 contrast), IMPH3 (accents)

**Decision: option (b).** Lime playground is a light theme everywhere: white canvas (`#ffffff`), near-black
ink (`#161900`), lime highlight (`#eefe90`), olive accent (`#3e4600`). The dark charcoal stays retired. Text
that still assumes a dark section gets recoloured to ink or fog. IMPH1 and IMPH3 should apply the tables below
as written.

Legend: **FIXED** means it follows from contrast rules or from how the code works, so don't reopen it.
**ISHAN'S CALL** means palette taste. The value given is the default to ship unless Ishan says otherwise.

---

## 0. What the audit got slightly wrong (read this first)

- **The public logo ticker is not broken.** On the live site (`hero-carousel.tsx:91-120`) the logos sit on
  `/svg/the-roll.svg`, which has its own dark fills (`#2f2c29`, the old charcoal). They do not sit on `bg-charcoal`.
  White logos (`brightness-0 invert`) on `#2f2c29` give 13.88:1. The `bg-charcoal` + `text-white/50..70`
  code in the ticker (`hero-carousel.tsx:34-78`) only runs in the **editor** (`editing === true`). It is
  still white-on-white, but only Ishan and editors see it. Don't touch the public marquee.
- **The footer bug is `text-primary-foreground`, not `text-white/*`.** `footer.tsx:28` sets all footer text to
  `text-primary-foreground`. Commit `947877a` changed `--primary-foreground` from `#161900` to `#ffffff`
  (so olive buttons could have white text). That made the whole footer (tagline, social links, copyright,
  legal links) `#fff` on `bg-charcoal` = `#fff`, which is **1.00:1**. This is the real public P0.
  `text-white/70` and `border-white/30` appear in the footer only on the editor-only "Add link" button
  (`footer.tsx:76`).
- In commit `eedd248` the footer was correctly restyled to ink/fog on the light canvas. That work was lost when
  the footer was rewritten for inline editing (`8eab6b7`) and went back to `text-primary-foreground`.

## 1. Every use of the 10 tokens, and whether its surroundings expect dark or light

Grep: `(bg|text|border|…)-(charcoal|warm-linen|sand|paper-white|sun-yellow|hot-pink|lime-burst|periwinkle|spring-green|bubblegum)`
across `app/`, `components/` and `lib/`.

### Surface tokens (all currently `#ffffff`)

| Token | Location | What it's on / what's on it | Surroundings expect | Status |
|---|---|---|---|---|
| `bg-charcoal` | `components/landing/landing-sections.tsx:36` | wrapper for contact + how-it-works | **light**: CtaForm is a `bg-paper-white` card with `text-ink` fields; HookanaWay uses ink text | OK as white |
| `bg-charcoal` | `landing-sections.tsx:37` | `#contact` wrapper (guy/girl SVG illustrations) | **light** (same) | OK as white |
| `bg-charcoal` | `landing-sections.tsx:109` | footer section | **dark** (footer text is `text-primary-foreground` = #fff) | **BROKEN, 1.00:1** |
| `bg-charcoal` | `components/landing/hero-carousel.tsx:34` | editor-only logo panel | **dark** (`text-white/40..70`, `border-white/10..30`, `bg-white/5`, inverted logos) | **BROKEN (editor only)** |
| `bg-warm-linen` | `app/(site)/portfolio/page.tsx:32` | portfolio page main | light (ink text) | OK |
| `bg-warm-linen` | `landing-sections.tsx:80,93,99,103` | services/stats/testimonial, pricing, CTA, FAQ sections | light | OK |
| `bg-warm-linen` | `components/landing/newsletter.tsx:46` | newsletter section | light (inner card is `bg-white`, ink text) | OK |
| `bg-paper-white` | `app/(site)/layout.tsx:17` | skip link (`focus:text-ink`) | light | OK (17.9:1) |
| `bg-paper-white` | `newsletter.tsx:80`, `cta-form.tsx:75,127,137,147,158,196` | form card + inputs, `text-ink`, `placeholder:text-fog` | light | OK |
| `bg-paper-white` | `components/landing/stats-marquee.tsx:35`, `components/landing/pricing.tsx:87` | pills/cards with ash border | light | OK |
| `bg-paper-white` | `components/consent/analytics-consent.tsx:77` | consent banner, `text-ink` | light | OK |
| `text-paper-white` | `analytics-consent.tsx:97` | on `bg-ink` button | light-on-dark by design | OK (17.9:1) |
| `bg-sand` | `components/landing/portfolio-gallery.tsx:157` | card placeholder behind media | light | OK |
| `--color-charcoal/warm-linen/sand` | `lib/admin/theme-tokens.ts:27` | editor "Page background" control writes all four with `--color-cream` | light (they are *defined* as the page background) | see note below |
| `--color-paper-white` | `theme-tokens.ts:34` | editor "Cards & panels" control | light | OK |

**Why this rules out option (a) (FIXED):** the theme editor's "Page background" control writes to
`--color-charcoal` (`theme-tokens.ts:27`). Any saved theme would overwrite a restored dark charcoal with the
page colour, so (a) also needs editor changes. Worse, restoring dark charcoal turns the whole contact +
how-it-works block (`landing-sections.tsx:36-37`) dark. That section's form card, illustrations and HookanaWay copy
were all restyled for light, so that would be a redesign, not a fix. Only 2 of the 6 `bg-charcoal` uses expect dark,
and one of those is editor-only.

### Accent tokens (all currently `#3e4600`)

| Token | Uses | Surroundings |
|---|---|---|
| `text-hot-pink` | `components/landing/cta-form.tsx:269` (required `*`), `components/landing/faq.tsx:71` (FAQ heading line 2), `components/landing/what-we-do.tsx:246` (services eyebrow label) | light canvas; olive on white = 10.09:1 |
| `--color-hot-pink` | `lib/admin/theme-tokens.ts:48` ("Accent text" control, together with `--color-primary`) | |
| `sun-yellow`, `lime-burst`, `periwinkle`, `spring-green`, `bubblegum` | **zero uses** in `app/`, `components/`, `lib/`, `sanity/` | n/a |

## 2. Footer and editor ticker: exact changes (IMPH1)

All on white `#ffffff`. Ratios are WCAG 2.x relative-luminance contrast ratios, computed from these exact hex values.

### `components/landing/footer.tsx`

| Line | Now | Change to | Resolves to | Contrast on #fff | Kind |
|---|---|---|---|---|---|
| 28 | `text-primary-foreground` | `text-ink` | #161900 | **17.90:1** | FIXED |
| 28 | (no border) | add `border-t border-ash` | #e2e8f0 hairline | 1.23:1 (decorative divider, not text) | ISHAN'S CALL (matches `eedd248`; drop it if he wants no rule) |
| 61 | `text-primary-foreground/50 hover:text-red-400` | `text-fog hover:text-red-600` | #6b7280 | **4.83:1** | FIXED |
| 76 | `border-white/30 text-white/70 hover:border-white hover:text-white` | `border-ash text-fog hover:border-ink hover:text-ink` | text #6b7280 / hover #161900 | **4.83:1** / 17.90:1 | FIXED |

Leave the social links, copyright and legal links unchanged. They inherit the `text-ink` from line 28.
- Optional muted copyright (`text-fog`, 4.83:1, as in `eedd248`) is **ISHAN'S CALL**. Default: keep it all ink.
- Leave `landing-sections.tsx:109` `bg-charcoal` as is. It is page background by definition, and the editor drives it.

### `components/landing/hero-carousel.tsx` (editor-only panel, lines 34-78)

| Line | Now | Change to | Resolves to | Contrast on #fff | Kind |
|---|---|---|---|---|---|
| 35 | `text-white/50` | `text-fog` | #6b7280 | **4.83:1** | FIXED |
| 52 | `border-white/10 bg-white/5` | `border-ash bg-muted` | border #e2e8f0, tile #f4f6ea | n/a (surface) | FIXED |
| 58 | `brightness-0 invert` | `brightness-0` (drop `invert`) | black logo on #f4f6ea | ~19:1 | FIXED |
| 61 | `text-white/40` | `text-fog` | #6b7280 on #f4f6ea tile | **4.42:1** (≥3:1 is fine for 10px uppercase hint; ≥4.5 would need `text-ink`) | FIXED |
| 68 | `text-white/60` | `text-fog` | #6b7280 | **4.83:1** | FIXED |
| 75 | `border-white/30 text-white/70 hover:border-white hover:text-white` | `border-ash text-fog hover:border-ink hover:text-ink` | #6b7280 / #161900 | **4.83:1** / 17.90:1 | FIXED |
| 44 | `bg-white text-neutral-900 shadow` remove button | leave | | 17+:1 | FIXED (no change) |
| 91-120 | public marquee on `the-roll.svg`, `brightness-0 invert`, `border-white` dividers | **do not change** | white on #2f2c29 | 13.88:1 | FIXED (no change) |

Also leave `--primary-foreground: #ffffff` alone (`globals.css:71`). It is correct for anything *on* an
olive `bg-primary`. The footer was wrong to use it as a general text colour.

## 3. The six accent tokens (IMPH3)

| Token | Used? | Resolves to | Action | Kind |
|---|---|---|---|---|
| `--color-hot-pink` | yes, 3 call sites + editor | `#3e4600` (olive), 10.09:1 on white | Replace `text-hot-pink` with `text-primary` at `cta-form.tsx:269`, `faq.tsx:71`, `what-we-do.tsx:246`. Then delete `--color-hot-pink` from `globals.css:272` and from the `vars` array at `theme-tokens.ts:48` (leaving `["--color-primary"]`). Same colour, and the editor's "Accent text" knob still drives it, because `text-primary` is already in that var list. Saved themes are keyed by `"accent"`, not by var name, so no data migration. | FIXED (the name lies; the colour does not change) |
| `--color-sun-yellow` | no | `#3e4600` | delete (`globals.css:271`) | FIXED |
| `--color-lime-burst` | no | `#3e4600` | delete (`globals.css:273`) | FIXED |
| `--color-periwinkle` | no | `#3e4600` | delete (`globals.css:274`) | FIXED |
| `--color-spring-green` | no | `#3e4600` | delete (`globals.css:275`) | FIXED |
| `--color-bubblegum` | no | `#3e4600` | delete (`globals.css:276`) | FIXED |

Before deleting, IMPH3 should re-run the grep over `app components lib sanity` and confirm zero hits.
Run `npm run build` afterwards: Tailwind v4 only emits utilities for tokens that exist, so a missed use shows up as
missing colour, not as a build error. The grep is the real check.

**ISHAN'S CALL: should the accent be something other than olive?** The olive `#3e4600` on white (10.09:1) is the shipped
choice from `51e0011`/`947877a`, and it is the default. If Ishan wants the FAQ second line or the services eyebrow
to *pop* (they were hot pink `#ff4dd5` before the re-theme), that is a palette decision. Any replacement must
still be ≥4.5:1 on `#ffffff` for the small eyebrow and asterisk; the 96px FAQ heading only needs ≥3:1.
Raw `#ff4dd5` is 2.65:1, so it fails both and should not come back as-is. Until he says otherwise: olive.

## 4. Out of scope, but don't do these

- Don't restore `--color-charcoal: #2f2c29` (option a). See §1.
- Don't rename `warm-linen` / `paper-white` / `sand` / `charcoal` in this pass. They all work as "page" or "card"
  surfaces and the editor depends on them. Renaming them is a later cleanup, not part of the P0.
- Don't touch `.dark { … }` in `globals.css`. Nothing toggles `.dark` on the public site.
