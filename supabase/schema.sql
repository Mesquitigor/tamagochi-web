-- Run in Supabase SQL Editor
create table if not exists public.pets (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  name text not null default 'Tamago',
  stage text not null default 'egg',
  character_type text not null default 'baby_cared',
  hunger int not null default 5 check (hunger >= 0 and hunger <= 5),
  happiness int not null default 5 check (happiness >= 0 and happiness <= 5),
  discipline int not null default 0 check (discipline >= 0 and discipline <= 5),
  weight int not null default 5 check (weight >= 1 and weight <= 99),
  age_minutes int not null default 0 check (age_minutes >= 0),
  is_alive boolean not null default true,
  is_sick boolean not null default false,
  is_sleeping boolean not null default false,
  is_lights_on boolean not null default true,
  poop_count int not null default 0 check (poop_count >= 0 and poop_count <= 9),
  care_misses int not null default 0,
  last_interaction_at timestamptz not null default now(),
  last_decay_at timestamptz not null default now(),
  last_event_at timestamptz not null default now(),
  born_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  died_at timestamptz
);

create unique index if not exists pets_one_per_user on public.pets (user_id);

alter table public.pets enable row level security;

create policy "Users read own pet"
  on public.pets for select
  using (auth.uid() = user_id);

create policy "Users insert own pet"
  on public.pets for insert
  with check (auth.uid() = user_id);

create policy "Users update own pet"
  on public.pets for update
  using (auth.uid() = user_id);

create table if not exists public.push_subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  endpoint text not null,
  keys jsonb not null,
  created_at timestamptz not null default now()
);

create unique index if not exists push_subscriptions_endpoint
  on public.push_subscriptions (endpoint);

alter table public.push_subscriptions enable row level security;

create policy "Users read own push subs"
  on public.push_subscriptions for select
  using (auth.uid() = user_id);

create policy "Users insert own push subs"
  on public.push_subscriptions for insert
  with check (auth.uid() = user_id);

create policy "Users delete own push subs"
  on public.push_subscriptions for delete
  using (auth.uid() = user_id);

create policy "Users update own push subs"
  on public.push_subscriptions for update
  using (auth.uid() = user_id);

-- Migração para bases criadas antes de last_event_at (idempotente)
alter table public.pets
  add column if not exists last_event_at timestamptz not null default now();

alter table public.pets add column if not exists sex text;
alter table public.pets add column if not exists color_theme text;
alter table public.pets add column if not exists died_at timestamptz;

-- Perfil: apelido no placar global
create table if not exists public.profiles (
  user_id uuid primary key references auth.users (id) on delete cascade,
  nickname text not null default '',
  nickname_setup_done boolean not null default false,
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "profiles_select_authenticated"
  on public.profiles for select
  to authenticated
  using (true);

create policy "profiles_select_anon"
  on public.profiles for select
  to anon
  using (true);

create policy "profiles_insert_own"
  on public.profiles for insert
  to authenticated
  with check (auth.uid() = user_id);

create policy "profiles_update_own"
  on public.profiles for update
  to authenticated
  using (auth.uid() = user_id);

alter table public.profiles
  add column if not exists nickname_setup_done boolean not null default false;

-- Recordes (pets falecidos)
create table if not exists public.pet_records (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  pet_name text not null,
  stage text not null,
  character_type text not null,
  age_minutes int not null check (age_minutes >= 0),
  born_at timestamptz not null,
  died_at timestamptz not null,
  created_at timestamptz not null default now()
);

create index if not exists pet_records_age_desc on public.pet_records (age_minutes desc);

alter table public.pet_records enable row level security;

create policy "pet_records_select_authenticated"
  on public.pet_records for select
  to authenticated
  using (true);

create policy "pet_records_select_anon"
  on public.pet_records for select
  to anon
  using (true);

create policy "pet_records_insert_own"
  on public.pet_records for insert
  to authenticated
  with check (auth.uid() = user_id);
