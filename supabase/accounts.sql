-- Cail Customs — user accounts
-- Run in the Supabase SQL editor AFTER schema.sql and orders.sql (idempotent).
--
-- Design notes:
--   * profiles.id is the same UUID as auth.users.id — no separate FK column needed.
--   * A trigger creates the profile row immediately on user signup so the account
--     page never has to handle a missing row.
--   * RLS restricts every operation to the row owner; no profile is ever visible
--     to another user or anonymous visitors.
--   * email lives in auth.users — we don't duplicate it here.

-- ---------------------------------------------------------------------------
-- PROFILES — one row per signed-up user
-- ---------------------------------------------------------------------------
create table if not exists public.profiles (
  id          uuid primary key references auth.users(id) on delete cascade,
  full_name   text not null default '',
  phone       text not null default '',
  address     text not null default '',
  updated_at  timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- TRIGGER — auto-create profile on signup
-- ---------------------------------------------------------------------------
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public
as $$
begin
  insert into public.profiles (id)
  values (new.id)
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ---------------------------------------------------------------------------
-- ROW LEVEL SECURITY — each user sees only their own row
-- ---------------------------------------------------------------------------
alter table public.profiles enable row level security;

drop policy if exists "profiles_own" on public.profiles;
create policy "profiles_own" on public.profiles
  for all using (auth.uid() = id) with check (auth.uid() = id);
