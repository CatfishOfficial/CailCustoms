-- Migration 008 — "custom design" tag.
--   * products.custom — a purely visual flag for listings that are custom
--     designs (e.g. a custom Spotify shirt). Adds a rainbow label on the card
--     and product page; does not change the buy flow.
--
-- Run ONCE in the Supabase SQL editor. Additive and safe to re-run.

alter table public.products add column if not exists custom boolean not null default false;
