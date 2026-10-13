# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

[Inferred — no interview round was available this session; see disclosure below.]
Primary users are two groups: (1) D2C / performance-marketing brands evaluating Hookana as a creative production vendor (landing page visitors, portfolio viewers, "Creative Health Check" diagnostic users, contact-form leads), and (2) Hookana's own non-technical site owner (Diksha) and team, who manage content through the in-browser editor and `/admin` dashboard (campaigns, leads, portfolio, newsletter subscribers, site settings).

## Product Purpose

[Inferred] Hookana is a creative production agency's marketing site plus a lightweight internal ops tool. The public site (`app/(site)/*`) pitches Hookana's video-ad and static-creative production work to D2C brands, offers a "Creative Health Check" diagnostic tool (`/tools`) as a lead magnet, and showcases a portfolio (`/portfolio/[category]`). The `/admin/*` area runs lead capture, a newsletter/campaign system (Resend-backed), portfolio management, and CMS-driven site settings so the site owner can edit copy/media without a developer.

## Positioning

[Inferred] Positions Hookana as creative production specifically for performance marketers — "Creative Health Check" diagnostic and portfolio framed around ad performance ("Creative that converts"), not general branding/design work.

## Operating Context

[Inferred] Content is CMS-driven via Supabase (`getSiteSettings`, `getPortfolioBundles`) and rendered dynamically (`force-dynamic`) so edits made in `/admin/site` show up immediately rather than requiring a rebuild/redeploy. Leads and newsletter signups flow through Resend. A custom in-browser site editor (`useEditor`/`useEditable`/`useListControls` hooks per repo CLAUDE.md) lets the non-technical owner edit the live site directly.

## Capabilities and Constraints

- Next.js 16 (App Router, Turbopack dev), React 19, Supabase, Tailwind v4, shadcn/ui.
- Public routes: home, portfolio (+ category), tools (diagnostic), privacy, terms.
- Admin routes: dashboard, campaigns (+ new/[id]), leads, login, portfolio, site, subscribers.
- API routes: contact, diagnostic, lead(s), newsletter (auth, campaigns, stats, subscribe/unsubscribe, generate, analytics), portfolio, settings, upload/media.
- [Undecided/unknown] Exact accessibility standard target, specific brand guideline constraints beyond what's visible in code, and whether the diagnostic tool's output is rule-based or AI-generated (repo includes `@google/generative-ai` as a dependency, used somewhere in lead/diagnostic flow — not confirmed which).

## Brand Commitments

[Inferred from code] Name: Hookana. Tagline (from `public/hookana.html` `<title>`): "Creative Production for Performance Marketers." Visual vocabulary observed in code: "warm-linen" background, "voltage-blue" and "ink" text colors, "font-editorial" / "font-ease" type families — these are incumbent tokens, not confirmed brand decisions from the owner.

## Evidence on Hand

No case studies, testimonials, or press were found/confirmed during this pass. Portfolio fallback content exists in code (`PORTFOLIO_BUNDLES_FALLBACK`) — treat as placeholder, not verified client work, unless the owner confirms otherwise.

## Product Principles

[Inferred — not owner-confirmed]
1. Non-technical owner must be able to change copy/media without a developer (CMS + in-browser editor).
2. The public site's job is lead generation for a creative-production service, not just brand expression.
3. Content changes should be visible immediately (dynamic rendering over static builds).

## Accessibility & Inclusion

[Undecided] No explicit accessibility standard was found or confirmed this session; flagged as a gap for the audit to check empirically rather than assumed.
