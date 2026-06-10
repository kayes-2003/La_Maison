-- ============================================================
--  La Maison Restaurant — Reviews Table Migration
--  Run in Supabase SQL Editor, or: supabase db push
-- ============================================================

create table if not exists public.reviews (
  id          uuid        primary key default uuid_generate_v4(),
  name        text        not null,
  profession  text,
  comment     text        not null,
  stars       int         not null default 5 check (stars between 1 and 5),
  created_at  timestamptz not null default now()
);

-- RLS: anyone can read, anyone can insert (no login required for reviews)
alter table public.reviews enable row level security;

drop policy if exists "reviews_select_all" on public.reviews;
drop policy if exists "reviews_insert_all" on public.reviews;

create policy "reviews_select_all" on public.reviews
  for select using (true);

create policy "reviews_insert_all" on public.reviews
  for insert with check (true);

-- Index for fast ordering
create index if not exists reviews_created_at_idx on public.reviews (created_at desc);
