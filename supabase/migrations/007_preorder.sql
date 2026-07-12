-- Migration 007 — pre-order state.
--   * products.preorder — when on, the listing shows a bright "pre-order" label
--     (not grayed out) and a reserve form instead of add-to-cart. Takes
--     precedence over the unavailable/notify state.
--   * restock_requests.kind — 'notify' (back-in-stock) vs 'preorder' (reserve),
--     so the inbox can tell hot pre-orders from restock pings.
--
-- Run ONCE in the Supabase SQL editor. Additive and safe to re-run.

alter table public.products add column if not exists preorder boolean not null default false;
alter table public.restock_requests add column if not exists kind text not null default 'notify';
