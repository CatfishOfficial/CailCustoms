-- Migration 005 — availability + inventory.
--   * products.available — a manual "currently unavailable" toggle.
--   * product_stock       — current on-hand qty per listing + size.
--   * shipments / shipment_items — batch orders (total_price is your COST,
--                           admin-only); recording one bumps product_stock.
--   * restock_requests    — public "notify me when it's back" submissions.
--
-- Run ONCE in the Supabase SQL editor after migration 004. Safe to re-run.
-- Requires public.is_admin() from 004.

-- ---------------------------------------------------------------------------
-- 1. Manual availability toggle
-- ---------------------------------------------------------------------------
alter table public.products add column if not exists available boolean not null default true;

-- ---------------------------------------------------------------------------
-- 2. Current on-hand stock (size '' = one-size). Public read (storefront shows
--    what's available); admin-only write.
-- ---------------------------------------------------------------------------
create table if not exists public.product_stock (
  product_id text not null references public.products(id) on delete cascade,
  size       text not null default '',
  qty        int  not null default 0 check (qty >= 0),
  updated_at timestamptz not null default now(),
  primary key (product_id, size)
);
alter table public.product_stock enable row level security;
drop policy if exists "product_stock_read" on public.product_stock;
create policy "product_stock_read" on public.product_stock for select using (true);
drop policy if exists "product_stock_write" on public.product_stock;
create policy "product_stock_write" on public.product_stock
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

-- ---------------------------------------------------------------------------
-- 3. Shipments + line items — admin-only (contains supplier cost)
-- ---------------------------------------------------------------------------
create table if not exists public.shipments (
  id          uuid primary key default gen_random_uuid(),
  created_at  timestamptz not null default now(),
  received_on date,
  total_price numeric(10,2) not null default 0,
  note        text not null default ''
);
create table if not exists public.shipment_items (
  id          uuid primary key default gen_random_uuid(),
  shipment_id uuid not null references public.shipments(id) on delete cascade,
  product_id  text references public.products(id) on delete set null,
  item_label  text not null default '',
  size        text not null default '',
  quantity    int  not null default 0
);
alter table public.shipments      enable row level security;
alter table public.shipment_items enable row level security;
drop policy if exists "shipments_admin" on public.shipments;
create policy "shipments_admin" on public.shipments
  for all to authenticated using (public.is_admin()) with check (public.is_admin());
drop policy if exists "shipment_items_admin" on public.shipment_items;
create policy "shipment_items_admin" on public.shipment_items
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

-- ---------------------------------------------------------------------------
-- 4. Restock / "notify me" requests — public insert; admin manages
-- ---------------------------------------------------------------------------
create table if not exists public.restock_requests (
  id           uuid primary key default gen_random_uuid(),
  created_at   timestamptz not null default now(),
  status       text not null default 'new' check (status in ('new','contacted','done','cancelled')),
  product_id   text,
  product_name text not null default '',
  size         text not null default '',
  qty          int  not null default 1,
  name         text not null default '',
  email        text not null default '',
  phone        text not null default '',
  message      text not null default ''
);
create index if not exists restock_requests_created_idx on public.restock_requests (created_at desc);
alter table public.restock_requests enable row level security;
drop policy if exists "restock_insert_public" on public.restock_requests;
create policy "restock_insert_public" on public.restock_requests
  for insert to anon, authenticated with check (true);
drop policy if exists "restock_staff_read" on public.restock_requests;
create policy "restock_staff_read" on public.restock_requests
  for select to authenticated using (public.is_admin());
drop policy if exists "restock_staff_update" on public.restock_requests;
create policy "restock_staff_update" on public.restock_requests
  for update to authenticated using (public.is_admin()) with check (public.is_admin());
drop policy if exists "restock_staff_delete" on public.restock_requests;
create policy "restock_staff_delete" on public.restock_requests
  for delete to authenticated using (public.is_admin());

-- ---------------------------------------------------------------------------
-- 5. record_shipment — insert a shipment + items and add to product_stock,
--    atomically. p_items: [{product_id, item_label, size, quantity}, ...].
-- ---------------------------------------------------------------------------
create or replace function public.record_shipment(p_total numeric, p_received date, p_note text, p_items jsonb)
returns uuid
language plpgsql security definer set search_path = public
as $$
declare
  new_id uuid;
  it jsonb;
  q int;
begin
  if not public.is_admin() then raise exception 'not authorized'; end if;
  insert into public.shipments (received_on, total_price, note)
  values (p_received, coalesce(p_total, 0), coalesce(p_note, ''))
  returning id into new_id;

  for it in select * from jsonb_array_elements(coalesce(p_items, '[]'::jsonb))
  loop
    q := coalesce((it->>'quantity')::int, 0);
    insert into public.shipment_items (shipment_id, product_id, item_label, size, quantity)
    values (new_id, nullif(it->>'product_id', ''), coalesce(it->>'item_label', ''), coalesce(it->>'size', ''), q);

    if nullif(it->>'product_id', '') is not null and q <> 0 then
      insert into public.product_stock (product_id, size, qty)
      values (it->>'product_id', coalesce(it->>'size', ''), q)
      on conflict (product_id, size)
        do update set qty = greatest(0, product_stock.qty + excluded.qty), updated_at = now();
    end if;
  end loop;
  return new_id;
end;
$$;
grant execute on function public.record_shipment(numeric, date, text, jsonb) to authenticated;

-- ---------------------------------------------------------------------------
-- 6. list_shipments — recent shipments with their items, for the admin view.
-- ---------------------------------------------------------------------------
create or replace function public.list_shipments()
returns table(id uuid, created_at timestamptz, received_on date, total_price numeric, note text, items jsonb)
language sql security definer stable set search_path = public
as $$
  select s.id, s.created_at, s.received_on, s.total_price, s.note,
    coalesce((
      select jsonb_agg(jsonb_build_object(
        'product_id', si.product_id, 'item_label', si.item_label,
        'size', si.size, 'quantity', si.quantity) order by si.item_label)
      from public.shipment_items si where si.shipment_id = s.id
    ), '[]'::jsonb)
  from public.shipments s
  where public.is_admin()
  order by s.created_at desc;
$$;
grant execute on function public.list_shipments() to authenticated;
