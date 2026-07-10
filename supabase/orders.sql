-- Cail Customs — orders, custom-idea submissions, and product sizes
-- Run this in the Supabase SQL editor AFTER schema.sql (idempotent — safe to re-run).
-- IMPORTANT: run this BEFORE deploying the cart/orders code; the admin autosave
-- writes the new products.sizes column and will fail against an unmigrated DB.
--
-- Design notes:
--  * orders / idea_submissions are inquiry inboxes, not commerce: anyone can
--    INSERT (submit a request), but only authenticated staff can read, update
--    status, or delete. No anon SELECT — customers never see each other's data.
--  * items / fields / files are JSONB snapshots so rows stay readable even if
--    products or form configs change later.
--  * The "submissions" storage bucket is PRIVATE (staff view files via signed
--    URLs); size and mime limits are enforced at the bucket level.

-- ---------------------------------------------------------------------------
-- PRODUCTS — admin-defined sizes (e.g. ["S","M","L","XL"]; empty = one size)
-- ---------------------------------------------------------------------------
alter table public.products
  add column if not exists sizes jsonb not null default '[]'::jsonb;

-- backfill the seeded apparel so it matches DEFAULT_DATA (no-op if already set)
update public.products
  set sizes = '["S","M","L","XL"]'::jsonb
  where id in ('static-tee', 'hoodie') and sizes = '[]'::jsonb;

-- ---------------------------------------------------------------------------
-- COPY REFRESH — Mat. Stuff leans electronics now. Only touches rows still
-- carrying the original seeded copy; anything you've edited in the admin
-- stays as-is.
-- ---------------------------------------------------------------------------
update public.categories
  set blurb = 'electronics, light, and gadgets that actually exist.'
  where name = 'Mat. Stuff' and blurb = 'physical builds and objects that actually exist.';

update public.settings
  set hero_sub = 'a small crew making a lot of different things — shirts, circuits, sound, design. pick a lane below and have a look around.'
  where id = 1 and hero_sub = 'a small crew making a lot of different things — shirts, builds, sound, design. pick a lane below and have a look around.';

-- ---------------------------------------------------------------------------
-- ORDERS — cart order requests
-- ---------------------------------------------------------------------------
create table if not exists public.orders (
  id         uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  status     text not null default 'new'
             check (status in ('new','contacted','confirmed','shipped','done','cancelled')),
  name       text not null default '',
  email      text not null default '',
  phone      text not null default '',
  items      jsonb not null default '[]'::jsonb,  -- snapshot: [{id,name,price,size,qty}]
  message    text not null default ''
);
create index if not exists orders_created_idx on public.orders (created_at desc);

-- ---------------------------------------------------------------------------
-- IDEA SUBMISSIONS — per-category custom idea forms
-- ---------------------------------------------------------------------------
create table if not exists public.idea_submissions (
  id         uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  status     text not null default 'new'
             check (status in ('new','contacted','approved','designing','building','finishing','done','passed')),
  category   text not null default '',
  fields     jsonb not null default '{}'::jsonb,  -- structured per-category answers
  idea       text not null default '',
  files      jsonb not null default '[]'::jsonb,  -- storage paths in the private "submissions" bucket
  name       text not null default '',
  email      text not null default ''
);
create index if not exists idea_submissions_created_idx on public.idea_submissions (created_at desc);

-- upgrade path: earlier versions of this file created the table with only
-- ('new','contacted','done') — swap in the full custom-work pipeline.
alter table public.idea_submissions drop constraint if exists idea_submissions_status_check;
alter table public.idea_submissions add constraint idea_submissions_status_check
  check (status in ('new','contacted','approved','designing','building','finishing','done','passed'));

-- extra ways to reach the customer: phone on ideas, and a free-form list of
-- handles ([{type,value}] — instagram / tiktok / discord / …) on both inboxes.
alter table public.idea_submissions add column if not exists phone text not null default '';
alter table public.orders           add column if not exists contacts jsonb not null default '[]'::jsonb;
alter table public.idea_submissions add column if not exists contacts jsonb not null default '[]'::jsonb;

-- ---------------------------------------------------------------------------
-- ROW LEVEL SECURITY — public insert only; staff read/update/delete
-- ---------------------------------------------------------------------------
alter table public.orders           enable row level security;
alter table public.idea_submissions enable row level security;

drop policy if exists "orders_insert_public" on public.orders;
create policy "orders_insert_public" on public.orders
  for insert to anon, authenticated with check (true);
drop policy if exists "orders_staff_read" on public.orders;
create policy "orders_staff_read" on public.orders
  for select to authenticated using (true);
drop policy if exists "orders_staff_update" on public.orders;
create policy "orders_staff_update" on public.orders
  for update to authenticated using (true) with check (true);
drop policy if exists "orders_staff_delete" on public.orders;
create policy "orders_staff_delete" on public.orders
  for delete to authenticated using (true);

drop policy if exists "ideas_insert_public" on public.idea_submissions;
create policy "ideas_insert_public" on public.idea_submissions
  for insert to anon, authenticated with check (true);
drop policy if exists "ideas_staff_read" on public.idea_submissions;
create policy "ideas_staff_read" on public.idea_submissions
  for select to authenticated using (true);
drop policy if exists "ideas_staff_update" on public.idea_submissions;
create policy "ideas_staff_update" on public.idea_submissions
  for update to authenticated using (true) with check (true);
drop policy if exists "ideas_staff_delete" on public.idea_submissions;
create policy "ideas_staff_delete" on public.idea_submissions
  for delete to authenticated using (true);

-- ---------------------------------------------------------------------------
-- STORAGE — private "submissions" bucket for idea-form file drops
-- 10MB per file; images + PDF only (enforced server-side by the bucket).
-- ---------------------------------------------------------------------------
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'submissions', 'submissions', false, 10485760,
  array['image/png','image/jpeg','image/webp','image/gif','application/pdf']
)
on conflict (id) do update
  set public = false,
      file_size_limit = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;

-- anyone can upload (submit files with an idea)
drop policy if exists "submissions_public_insert" on storage.objects;
create policy "submissions_public_insert" on storage.objects
  for insert to anon, authenticated with check (bucket_id = 'submissions');

-- only staff can read (signed URLs are generated by the authed admin page)
drop policy if exists "submissions_staff_read" on storage.objects;
create policy "submissions_staff_read" on storage.objects
  for select to authenticated using (bucket_id = 'submissions');

-- staff can clean up
drop policy if exists "submissions_staff_delete" on storage.objects;
create policy "submissions_staff_delete" on storage.objects
  for delete to authenticated using (bucket_id = 'submissions');
