-- Template for new tables. Copy to NNNN_<name>.sql, rename example_items, and
-- delete the roles/policies you don't need. Not run automatically (leading
-- underscore keeps it out of the numbered migration sequence).
--
-- Since 30 Oct 2026, new public tables in existing Supabase projects are NOT
-- exposed to the Data API by default, so supabase-js errors until the table is
-- explicitly granted to the role(s) that need it. Grant only what is needed.

-- 1) Create the table and turn RLS on in the same migration.
create table if not exists public.example_items (
  id         uuid primary key default gen_random_uuid(),
  name       text not null,
  created_at timestamptz not null default now()
);

alter table public.example_items enable row level security;

-- 2) Explicit grants (required after 30 Oct; RLS policies alone are not enough).
--    Example: public read-only content. Writes go through the service role.
grant select on public.example_items to anon, authenticated;
grant select, insert, update, delete on public.example_items to service_role;

-- 3) Policies: RLS denies everything not covered by a policy.
drop policy if exists "anon read example_items" on public.example_items;
create policy "anon read example_items" on public.example_items
  for select to anon, authenticated using (true);

-- Reload PostgREST so the new table and grants are visible immediately.
notify pgrst, 'reload schema';
