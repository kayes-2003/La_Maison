-- ============================================================
--  La Maison — Feature Migration v2
--  Announcements · Order Tracking · New-item flag
--  Run in: Supabase SQL Editor  OR  supabase db push
-- ============================================================

-- ── 1. Announcements (admin-posted, time-limited) ─────────────
create table if not exists public.announcements (
  id          uuid        default uuid_generate_v4() primary key,
  title       text        not null default '',
  body        text        not null default '',
  type        text        not null default 'info'
                check (type in ('info','success','warning','alert')),
  show_from   timestamptz not null default now(),
  show_until  timestamptz,            -- null = show forever
  active      boolean     not null default true,
  created_at  timestamptz not null default now()
);
alter table public.announcements enable row level security;
drop policy if exists "ann_select_all"   on public.announcements;
drop policy if exists "ann_admin_write"  on public.announcements;
create policy "ann_select_all"  on public.announcements for select using (true);
create policy "ann_admin_write" on public.announcements for all using (
  exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
);

-- ── 2. Order tracking statuses ────────────────────────────────
--  Extend orders table with new tracking columns
alter table public.orders
  add column if not exists tracking_status text not null default 'pending'
    check (tracking_status in (
      'pending','confirmed','preparing',
      'parcel_picked','on_the_way','delivered','cancelled'
    )),
  add column if not exists delivery_name    text    default null,
  add column if not exists delivery_phone   text    default null,
  add column if not exists tracking_note    text    default null,
  add column if not exists delivered_at     timestamptz default null;

-- ── 3. is_new flag on menu_items ──────────────────────────────
alter table public.menu_items
  add column if not exists is_new boolean not null default false;

-- Mark items created in last 7 days as new (run once, then admin controls it)
update public.menu_items
  set is_new = true
  where created_at >= now() - interval '7 days';