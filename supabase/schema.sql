-- Cail Customs — database schema
-- Run this in the Supabase SQL editor (or `supabase db push`) once, then run seed.sql.
--
-- Design notes:
--  * Content mirrors the prototype's `data` shape: settings / categories / products / hero_slides.
--  * Storefront reads published content (public SELECT). Only authenticated users
--    (the team, via Supabase Auth) can INSERT/UPDATE/DELETE — enforced by RLS.
--  * `products.description` maps to the prototype's `desc` (a reserved word in SQL);
--    the data layer renames it back to `desc` for the front end.
--  * `hero_lines` / `images` are stored as JSONB arrays to match the prototype exactly.

-- ---------------------------------------------------------------------------
-- SETTINGS (single row, id = 1)
-- ---------------------------------------------------------------------------
create table if not exists public.settings (
  id         smallint primary key default 1,
  email      text not null default '',
  phone      text not null default '',
  location   text not null default '',
  tagline    text not null default '',
  hero_lines jsonb not null default '["","",""]'::jsonb,
  hero_sub   text not null default '',
  statement  text not null default '',
  about      text not null default '',
  bigmark    text not null default '',
  ticker     text not null default '',
  marquee    text not null default '',
  instagram  text not null default '',
  youtube    text not null default '',
  updated_at timestamptz not null default now(),
  constraint settings_singleton check (id = 1)
);

-- ---------------------------------------------------------------------------
-- CATEGORIES
-- ---------------------------------------------------------------------------
create table if not exists public.categories (
  id       uuid primary key default gen_random_uuid(),
  name     text not null,
  blurb    text not null default '',
  tone     text not null default 't2',
  image    text not null default '',
  position int  not null default 0,
  created_at timestamptz not null default now()
);
create index if not exists categories_position_idx on public.categories (position);

-- ---------------------------------------------------------------------------
-- PRODUCTS (id is a human slug, e.g. "static-tee")
-- ---------------------------------------------------------------------------
create table if not exists public.products (
  id          text primary key,
  name        text not null default '',
  cat         text not null default '',
  price       text not null default '',
  tone        text not null default 't2',
  blurb       text not null default '',
  description text not null default '',
  images      jsonb not null default '[]'::jsonb,
  featured    boolean not null default false,
  position    int not null default 0,
  created_at  timestamptz not null default now()
);
create index if not exists products_position_idx on public.products (position);
create index if not exists products_cat_idx on public.products (cat);

-- ---------------------------------------------------------------------------
-- ADDITIVE COLUMNS (safe to re-run) — sub-categories, per-category layout
-- tags, the "got an idea?" grid box, and editable product spec rows.
-- (products.sizes is added in orders.sql.)
-- ---------------------------------------------------------------------------
alter table public.categories add column if not exists parent_id uuid references public.categories(id) on delete set null;
alter table public.categories add column if not exists layout text not null default 'standard';
alter table public.categories add column if not exists is_item boolean not null default false;
create index if not exists categories_parent_idx on public.categories (parent_id);

alter table public.products add column if not exists specs jsonb not null default '[]'::jsonb;

-- ---------------------------------------------------------------------------
-- HERO SLIDES
-- ---------------------------------------------------------------------------
create table if not exists public.hero_slides (
  id       uuid primary key default gen_random_uuid(),
  tone     text not null default 't2',
  label    text not null default '',
  image    text not null default '',
  position int  not null default 0,
  created_at timestamptz not null default now()
);
create index if not exists hero_slides_position_idx on public.hero_slides (position);

-- ---------------------------------------------------------------------------
-- ROW LEVEL SECURITY
-- Public read; authenticated write.
-- ---------------------------------------------------------------------------
alter table public.settings    enable row level security;
alter table public.categories  enable row level security;
alter table public.products    enable row level security;
alter table public.hero_slides enable row level security;

-- settings: public read, authenticated write
drop policy if exists "settings_read"  on public.settings;
create policy "settings_read"  on public.settings for select using (true);
drop policy if exists "settings_write" on public.settings;
create policy "settings_write" on public.settings for all to authenticated using (true) with check (true);

-- categories: public read, authenticated write
drop policy if exists "categories_read"  on public.categories;
create policy "categories_read"  on public.categories for select using (true);
drop policy if exists "categories_write" on public.categories;
create policy "categories_write" on public.categories for all to authenticated using (true) with check (true);

-- products: public read, authenticated write
drop policy if exists "products_read"  on public.products;
create policy "products_read"  on public.products for select using (true);
drop policy if exists "products_write" on public.products;
create policy "products_write" on public.products for all to authenticated using (true) with check (true);

-- hero_slides: public read, authenticated write
drop policy if exists "hero_slides_read"  on public.hero_slides;
create policy "hero_slides_read"  on public.hero_slides for select using (true);
drop policy if exists "hero_slides_write" on public.hero_slides;
create policy "hero_slides_write" on public.hero_slides for all to authenticated using (true) with check (true);

-- ---------------------------------------------------------------------------
-- STORAGE — public "media" bucket for uploaded images
-- ---------------------------------------------------------------------------
insert into storage.buckets (id, name, public)
values ('media', 'media', true)
on conflict (id) do update set public = true;

-- public read of media objects
drop policy if exists "media_public_read" on storage.objects;
create policy "media_public_read" on storage.objects
  for select using (bucket_id = 'media');

-- authenticated users can upload / update / delete media
drop policy if exists "media_authenticated_insert" on storage.objects;
create policy "media_authenticated_insert" on storage.objects
  for insert to authenticated with check (bucket_id = 'media');

drop policy if exists "media_authenticated_update" on storage.objects;
create policy "media_authenticated_update" on storage.objects
  for update to authenticated using (bucket_id = 'media') with check (bucket_id = 'media');

drop policy if exists "media_authenticated_delete" on storage.objects;
create policy "media_authenticated_delete" on storage.objects
  for delete to authenticated using (bucket_id = 'media');
