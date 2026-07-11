-- Migration 003 — sub-categories, per-category layout tags, the "got an idea?"
-- grid box flag, and editable product spec rows.
--
-- Run this once in the Supabase SQL editor (or `supabase db push`) on an
-- existing database. Everything is additive and safe to re-run.
-- (products.sizes was added earlier in orders.sql.)

alter table public.categories add column if not exists parent_id uuid references public.categories(id) on delete set null;
alter table public.categories add column if not exists layout text not null default 'standard';
alter table public.categories add column if not exists is_item boolean not null default false;
create index if not exists categories_parent_idx on public.categories (parent_id);

alter table public.products add column if not exists specs jsonb not null default '[]'::jsonb;
