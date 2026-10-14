# Impeccable audit re-check (IMPHP)

Date: 2026-10-13 · Source: `AUDIT.md` · Decisions: `docs/theme-decision.md` · Checked against the code on branch `tick/IMPHP`.

## Findings

- **P0 footer / logo-ticker text invisible**: fixed. `footer.tsx` is `text-ink` on the white canvas; the editor-only ticker (`hero-carousel.tsx`) uses `text-fog`/`border-ash`/`bg-muted`; the editor "No logo" label moved from `text-fog` to `text-ink` in this pass (fog on `--muted` was 4.42:1, below 4.5). The public logo ticker was never broken (it sits on its own dark SVG, white logos on `#2f2c29` = 13.88:1 per the theme decision).
- **P1 testimonial play/pause not keyboard operable**: fixed. `testimonial.tsx` wraps it in `<button type="button">` with `aria-label` that tracks paused state and a `focus-visible` ring.
- **P1 no `<h1>`**: fixed. `hero.tsx:148` renders `as="h1"`. It is the only `<h1>` on the homepage; the legal pages have their own.
- **P2 mobile nav buttons 36px**: fixed. Both `Navbar.tsx` buttons are `size-11` (44px). Left open: the portfolio gallery's decorative play badge (`h-9 w-9`, `pointer-events-none`) is not a target, so no change.
- **P2 six collapsed accent tokens**: fixed. The six `--color-*` accents are removed from `globals.css`; their uses now resolve to `primary`. No references remain (grep for sun-yellow/hot-pink/lime-burst/periwinkle/spring-green/bubblegum is empty).
- **P2 blanket reduced-motion rule**: fixed. The rule is scoped to `.animate-marquee`, `.animate-marquee-stats`, `.animate-scroll`, `.animate-nudge`, `.animate-ping`, plus `scroll-behavior: auto`. Hover and focus transitions are kept. This pass removed the dead `.animate-bounce` selector (no element uses it any more).
- **P3 dead `FadeIn` with flash-rate keyframe**: fixed. The file is deleted and nothing references `FadeIn` or `blinkIn`.
- **P3 `animate-bounce`**: fixed. The hero scroll cue uses `animate-nudge` (single ease-out bob, 1.6s, one cycle per 1.6s).
- **P3 thick side-tab borders**: left alone, taste call (reduced from `border-l-8/10/20` to `border-l-4`, `border-l-[6px]` at larger breakpoints). The stock `border-pink-500` colour stays; it is the design's accent stripe.
- **Final polish pass**: done. See loose ends below.

## Left alone, taste call

Italic serif headlines, kicker labels, cream/white backgrounds, glow effects, the `pink-500` stripe on service cards, and the compatibility aliases `warm-linen`/`paper-white`/`charcoal`/`sand` (all `#ffffff`, intentionally kept so existing classes still work; the name `charcoal` is misleading but renaming touches many files).

## Loose ends fixed in this pass

- `newsletter.tsx` comment said "charcoal footer"; the footer is light now. Comment corrected.
- Dead `.animate-bounce` selector removed from the reduced-motion block.
- Editor "No logo" label contrast (above).

## Measured

Contrast (WCAG 2.x, computed from the token hex values):

| Pair | Ratio |
|---|---|
| ink `#161900` on white | 17.90:1 |
| olive `#3e4600` on white (and white on olive) | 10.09:1 |
| ink on lime `#eefe90` | 16.38:1 |
| fog `#6b7280` on white | 4.83:1 |
| fog on `--muted` `#f4f6ea` | 4.42:1 (not used for small text any more) |
| ash `#e2e8f0` on white | 1.23:1 (borders only, decorative) |
| pink-500 on white | 3.53:1 (decorative stripe only) |
| old footer, `#fff` on `#fff` | 1.00:1 (the P0) |

Sizes: nav open and close buttons 44×44px (was 36). Editor ticker labels are 10–12px, fog on white or ink on muted.
