-- Awards / Recognitions (admin-controlled, shown on homepage)
create table if not exists public.awards (
  id          uuid        default uuid_generate_v4() primary key,
  title       text        not null default '',
  issuer      text        not null default '',
  year        text        not null default '',
  icon_url    text        not null default '',
  description text        not null default '',
  sort_order  int         not null default 0,
  active      boolean     not null default true,
  created_at  timestamptz not null default now()
);
alter table public.awards enable row level security;
drop policy if exists "awards_select_all"  on public.awards;
drop policy if exists "awards_admin_write" on public.awards;
create policy "awards_select_all"  on public.awards for select using (true);
create policy "awards_admin_write" on public.awards for all using (
  exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
);
insert into public.awards (title, issuer, year, description, sort_order) values
  ('Michelin Star',     'Michelin Guide',       '2023', 'Awarded for outstanding culinary excellence', 0),
  ('Best Fine Dining',  'Dhaka Food Awards',    '2024', 'Voted best fine dining restaurant in Dhaka',  1),
  ('5-Star Service',    'TripAdvisor',          '2024', 'Recognised for exceptional guest service',    2)
on conflict do nothing;