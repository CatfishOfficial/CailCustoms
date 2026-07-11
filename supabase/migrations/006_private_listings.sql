-- Migration 006 — private (link-only) listings for custom orders.
--   * products.private — hidden from the shop; reachable only by its URL, so an
--     admin can build a listing for a custom order and hand the link to the
--     customer to complete it.
--   * idea_submissions.linked_product_id — the private listing tied to a
--     custom-idea request (set from the dropdown in the orders inbox).
--
-- Run ONCE in the Supabase SQL editor. Additive and safe to re-run. Private
-- products stay publicly readable (that's how the link works) — they're just
-- never listed in the storefront, sitemap, or search.

alter table public.products add column if not exists private boolean not null default false;

alter table public.idea_submissions
  add column if not exists linked_product_id text references public.products(id) on delete set null;
