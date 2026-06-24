-- Trusted Brands (admin-controlled marquee)
create table if not exists public.trusted_brands (
  id         uuid        default uuid_generate_v4() primary key,
  name       text        not null default '',
  logo_url   text        not null default '',
  sort_order int         not null default 0,
  active     boolean     not null default true,
  created_at timestamptz not null default now()
);
alter table public.trusted_brands enable row level security;
drop policy if exists "brands_select_all"  on public.trusted_brands;
drop policy if exists "brands_admin_write" on public.trusted_brands;
create policy "brands_select_all"  on public.trusted_brands for select using (true);
create policy "brands_admin_write" on public.trusted_brands for all using (
  exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
);

insert into public.trusted_brands (name, logo_url, sort_order) values
  ('Michelin Guide',   'https://upload.wikimedia.org/wikipedia/commons/thumb/0/0d/Michelin_Guide.svg/200px-Michelin_Guide.svg.png', 0),
  ('TripAdvisor',      'https://static.tacdn.com/img2/brand_refresh/Tripadvisor_lockup_horizontal_registered_dark.svg', 1),
  ('James Beard',      'https://upload.wikimedia.org/wikipedia/commons/thumb/3/36/James_Beard_Foundation_logo.svg/200px-James_Beard_Foundation_logo.svg.png', 2),
  ('Forbes Travel',    'https://upload.wikimedia.org/wikipedia/commons/thumb/0/0c/Forbes_logo.svg/200px-Forbes_logo.svg.png', 3),
  ('Zagat',            'https://upload.wikimedia.org/wikipedia/commons/thumb/6/6e/Zagat_Logo.svg/200px-Zagat_Logo.svg.png', 4),
  ('World's 50 Best',  'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1a/The_World%27s_50_Best_Restaurants_logo.png/200px-The_World%27s_50_Best_Restaurants_logo.png', 5)
on conflict do nothing;