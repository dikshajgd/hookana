-- Newsletter migration: subscribers + campaigns move from Sanity to Supabase.
--
-- Run this once in the Supabase SQL editor (or via `supabase db push`) before
-- deploying the Supabase-backed newsletter-db. Mirrors the old Sanity documents
-- `subscriber` and `newsletterCampaign`.
--
-- IDs are uuid (like portfolio_items); lib/newsletter-db.ts maps id -> _id and
-- created_at -> _createdAt so no API/admin code changes are needed.

create extension if not exists "pgcrypto";

-- ─── Subscribers ─────────────────────────────────────────────────────────────
create table if not exists public.subscribers (
  id            uuid primary key default gen_random_uuid(),
  email         text not null,
  name          text,
  status        text not null default 'active' check (status in ('active', 'unsubscribed')),
  source        text,
  subscribed_at timestamptz default now(),
  created_at    timestamptz not null default now()
);

-- Case-insensitive uniqueness on email (matches the app's lower-cased dedupe).
create unique index if not exists subscribers_email_lower_idx
  on public.subscribers (lower(email));

create index if not exists subscribers_status_idx on public.subscribers (status);
create index if not exists subscribers_subscribed_at_idx on public.subscribers (subscribed_at desc);

-- ─── Campaigns ───────────────────────────────────────────────────────────────
create table if not exists public.newsletter_campaigns (
  id              uuid primary key default gen_random_uuid(),
  title           text,
  subject         text,
  html_content    text,
  plain_text      text,
  mode            text check (mode in ('manual', 'generated')),
  prompt          text,
  status          text not null default 'draft' check (status in ('draft', 'sent')),
  sent_at         timestamptz,
  sent_count      integer not null default 0,
  recipient_count integer not null default 0,
  created_at      timestamptz not null default now()
);

create index if not exists newsletter_campaigns_status_idx on public.newsletter_campaigns (status);
create index if not exists newsletter_campaigns_created_at_idx on public.newsletter_campaigns (created_at desc);
create index if not exists newsletter_campaigns_sent_at_idx on public.newsletter_campaigns (sent_at desc);

-- Both tables are written only via the service-role key from server routes, so
-- RLS is left disabled here (consistent with portfolio_items). Enable + add
-- policies if you ever expose them to the anon client.

-- Force PostgREST to reload its schema cache immediately, so the REST API sees
-- the new tables without waiting for the periodic reload (fixes the
-- "Could not find the table in the schema cache" error right after creation).
notify pgrst, 'reload schema';
