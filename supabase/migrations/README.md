# Supabase migrations

Start new migrations from `_template.sql`.

## Rules for new tables

- Every new table needs an explicit `GRANT` to the roles that use it (`anon`, `authenticated`, `service_role`). Since 30 Oct 2026, new public tables are not exposed to the Data API by default, and supabase-js errors until they are granted.
- Enable RLS on every new table (`alter table ... enable row level security;`) and add policies for any role that is granted access.
- Never grant to a table with RLS off. Grants without RLS expose every row to the granted role via the public anon key.
- Grant only the roles and privileges that are needed. No blanket grants (`grant all ... to anon`).
- Do not edit `0001` or `0002`; add a new numbered migration instead.
