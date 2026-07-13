-- 0002: Row-Level Security lockdown.
--
-- Run this once in the Supabase SQL editor (or `supabase db push`).
--
-- WHY: the public anon key (NEXT_PUBLIC_SUPABASE_ANON_KEY) ships in the browser
-- bundle. With RLS disabled (as 0001 left it), anyone can hit PostgREST directly
-- with that key and read/write these tables — bypassing the app + middleware.
-- Concretely that allowed: (a) writing malicious HTML into site_settings, which
-- the homepage renders (stored XSS), and (b) dumping subscriber emails/names.
--
-- MODEL after this migration:
--   * site_settings, portfolio_items  -> PUBLIC content: anon may SELECT, never write.
--   * subscribers, newsletter_campaigns -> PRIVATE: NO anon access at all.
-- All writes and all admin reads go through the service-role key in server
-- routes, and service_role BYPASSES RLS — so the app keeps working unchanged.

-- 1) Turn RLS on for every table.
alter table public.site_settings        enable row level security;
alter table public.portfolio_items      enable row level security;
alter table public.subscribers          enable row level security;
alter table public.newsletter_campaigns enable row level security;

-- 2) Public-read policies for display content ONLY (SELECT, no writes).
--    (The admin portfolio page reads portfolio_items with the anon key.)
drop policy if exists "anon read site_settings" on public.site_settings;
create policy "anon read site_settings" on public.site_settings
  for select to anon, authenticated using (true);

drop policy if exists "anon read portfolio_items" on public.portfolio_items;
create policy "anon read portfolio_items" on public.portfolio_items
  for select to anon, authenticated using (true);

-- (No policies on subscribers / newsletter_campaigns => RLS denies anon every
--  row for read AND write. Only the service role can touch them.)

-- 3) Belt-and-suspenders: strip direct table grants from the public roles so
--    nothing but the service role can mutate content, and the PII tables aren't
--    reachable even if a permissive policy is later added by mistake.
revoke insert, update, delete on public.site_settings   from anon, authenticated;
revoke insert, update, delete on public.portfolio_items from anon, authenticated;
revoke all on public.subscribers          from anon, authenticated;
revoke all on public.newsletter_campaigns from anon, authenticated;

-- Reload PostgREST so the policy/grant changes take effect immediately.
notify pgrst, 'reload schema';
