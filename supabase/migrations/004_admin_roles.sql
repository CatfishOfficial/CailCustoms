-- Migration 004 — separate ADMIN/STAFF accounts from customer accounts.
--
-- Before this, every RLS policy used `to authenticated` — i.e. ANY signed-in
-- user (including a customer who used the public signup) counted as staff and
-- could edit the shop and read every order / idea submission.
--
-- This migration adds an explicit `admins` allow-list + an `is_admin()` helper,
-- then rewrites the staff/write policies to require it. Storefront reads and the
-- public submit-a-form/upload paths stay open; customer profiles are untouched.
--
-- Run this ONCE in the Supabase SQL editor (or `supabase db push`). Safe to
-- re-run. IMPORTANT: seed at least one admin (step 3) whose account already
-- exists in Auth, or admin saves will fail for everyone.

-- ---------------------------------------------------------------------------
-- 1. ADMINS allow-list (one row per staff user)
-- ---------------------------------------------------------------------------
create table if not exists public.admins (
  user_id  uuid primary key references auth.users(id) on delete cascade,
  added_at timestamptz not null default now()
);

alter table public.admins enable row level security;

-- ---------------------------------------------------------------------------
-- 2. is_admin() — true when the current user is in the allow-list.
--    SECURITY DEFINER so it can read public.admins regardless of that table's
--    RLS (no recursion); STABLE so the planner can cache it per statement.
--    Defined before any policy references it.
-- ---------------------------------------------------------------------------
create or replace function public.is_admin()
returns boolean
language sql
security definer
stable
set search_path = public
as $$
  select exists (
    select 1 from public.admins where user_id = auth.uid()
  );
$$;

grant execute on function public.is_admin() to anon, authenticated;

-- Admins may read the list (e.g. a future "manage staff" screen). No INSERT/
-- UPDATE/DELETE policy on purpose — membership is managed here in SQL / via the
-- service role, never through the anon-key client.
drop policy if exists "admins_read" on public.admins;
create policy "admins_read" on public.admins
  for select using (public.is_admin());

-- ---------------------------------------------------------------------------
-- 2b. Admin management from the site (admin page calls these via RPC).
--     All SECURITY DEFINER + gated on is_admin(), so a non-admin who calls
--     them gets "not authorized". Promotion only works for an account that
--     already exists in Auth (have the person sign up first).
-- ---------------------------------------------------------------------------
create or replace function public.list_admins()
returns table(email text, added_at timestamptz, is_self boolean)
language sql security definer stable set search_path = public
as $$
  select u.email::text, a.added_at, (a.user_id = auth.uid())
  from public.admins a
  join auth.users u on u.id = a.user_id
  where public.is_admin()   -- non-admins simply get no rows
  order by a.added_at;
$$;

create or replace function public.add_admin(target_email text)
returns text
language plpgsql security definer set search_path = public
as $$
declare
  target_id uuid;
begin
  if not public.is_admin() then
    raise exception 'not authorized';
  end if;
  select id into target_id from auth.users where lower(email) = lower(trim(target_email));
  if target_id is null then
    raise exception 'no account exists for %; ask them to sign up first', target_email;
  end if;
  insert into public.admins (user_id) values (target_id) on conflict (user_id) do nothing;
  return target_email;
end;
$$;

create or replace function public.remove_admin(target_email text)
returns text
language plpgsql security definer set search_path = public
as $$
declare
  target_id uuid;
begin
  if not public.is_admin() then
    raise exception 'not authorized';
  end if;
  select id into target_id from auth.users where lower(email) = lower(trim(target_email));
  if target_id is null then
    raise exception 'no admin with that email';
  end if;
  if target_id = auth.uid() then
    raise exception 'you can''t remove yourself';
  end if;
  if (select count(*) from public.admins) <= 1 then
    raise exception 'can''t remove the last admin';
  end if;
  delete from public.admins where user_id = target_id;
  return target_email;
end;
$$;

grant execute on function public.list_admins()          to authenticated;
grant execute on function public.add_admin(text)        to authenticated;
grant execute on function public.remove_admin(text)     to authenticated;

-- ---------------------------------------------------------------------------
-- 3. SEED the first admin(s).
--    The account(s) must already exist in Auth (create them under
--    Authentication → Users first). Edit the email list below, then run.
-- ---------------------------------------------------------------------------
insert into public.admins (user_id)
select id from auth.users
where email in (
  'solomon.d.wylie@gmail.com'      -- <-- add/replace admin emails, comma-separated
  -- , 'cailandco@gmail.com'
)
on conflict (user_id) do nothing;

-- ---------------------------------------------------------------------------
-- 4. SHOP CONTENT — public read stays; writes now require an admin.
-- ---------------------------------------------------------------------------
drop policy if exists "settings_write" on public.settings;
create policy "settings_write" on public.settings
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

drop policy if exists "categories_write" on public.categories;
create policy "categories_write" on public.categories
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

drop policy if exists "products_write" on public.products;
create policy "products_write" on public.products
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

drop policy if exists "hero_slides_write" on public.hero_slides;
create policy "hero_slides_write" on public.hero_slides
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

-- ---------------------------------------------------------------------------
-- 5. ORDERS + IDEA SUBMISSIONS — public INSERT stays (storefront forms);
--    reading/updating/deleting is now admin-only.
-- ---------------------------------------------------------------------------
drop policy if exists "orders_staff_read" on public.orders;
create policy "orders_staff_read" on public.orders
  for select to authenticated using (public.is_admin());
drop policy if exists "orders_staff_update" on public.orders;
create policy "orders_staff_update" on public.orders
  for update to authenticated using (public.is_admin()) with check (public.is_admin());
drop policy if exists "orders_staff_delete" on public.orders;
create policy "orders_staff_delete" on public.orders
  for delete to authenticated using (public.is_admin());

drop policy if exists "ideas_staff_read" on public.idea_submissions;
create policy "ideas_staff_read" on public.idea_submissions
  for select to authenticated using (public.is_admin());
drop policy if exists "ideas_staff_update" on public.idea_submissions;
create policy "ideas_staff_update" on public.idea_submissions
  for update to authenticated using (public.is_admin()) with check (public.is_admin());
drop policy if exists "ideas_staff_delete" on public.idea_submissions;
create policy "ideas_staff_delete" on public.idea_submissions
  for delete to authenticated using (public.is_admin());

-- ---------------------------------------------------------------------------
-- 6. STORAGE — media (product/category images): public read stays; only admins
--    may upload/change/remove. submissions bucket: public upload stays; only
--    admins may read (signed URLs) or delete.
-- ---------------------------------------------------------------------------
drop policy if exists "media_authenticated_insert" on storage.objects;
create policy "media_authenticated_insert" on storage.objects
  for insert to authenticated with check (bucket_id = 'media' and public.is_admin());

drop policy if exists "media_authenticated_update" on storage.objects;
create policy "media_authenticated_update" on storage.objects
  for update to authenticated using (bucket_id = 'media' and public.is_admin()) with check (bucket_id = 'media' and public.is_admin());

drop policy if exists "media_authenticated_delete" on storage.objects;
create policy "media_authenticated_delete" on storage.objects
  for delete to authenticated using (bucket_id = 'media' and public.is_admin());

drop policy if exists "submissions_staff_read" on storage.objects;
create policy "submissions_staff_read" on storage.objects
  for select to authenticated using (bucket_id = 'submissions' and public.is_admin());

drop policy if exists "submissions_staff_delete" on storage.objects;
create policy "submissions_staff_delete" on storage.objects
  for delete to authenticated using (bucket_id = 'submissions' and public.is_admin());

-- ---------------------------------------------------------------------------
-- 7. Confirm who the admins are (review the output before you rely on it).
-- ---------------------------------------------------------------------------
select u.email, a.added_at
from public.admins a join auth.users u on u.id = a.user_id
order by a.added_at;
