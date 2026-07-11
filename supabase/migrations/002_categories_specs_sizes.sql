-- Migration 002 — sub-categories, layout tags, item box, product sizes,
-- editable specs, and the shared "give us your idea" link.
--
-- Run this once in the Supabase SQL editor (or `supabase db push`) on an
-- existing database. Everything is additive and safe to re-run.

alter table public.categories add column if not exists parent_id uuid references public.categories(id) on delete set null;
alter table public.categories add column if not exists layout text not null default 'standard';
alter table public.categories add column if not exists is_item boolean not null default false;
create index if not exists categories_parent_idx on public.categories (parent_id);

alter table public.products add column if not exists sizes jsonb not null default '[]'::jsonb;
alter table public.products add column if not exists specs jsonb not null default '[]'::jsonb;

alter table public.settings add column if not exists idea_link text not null default '';
