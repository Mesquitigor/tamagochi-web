-- Perfil (apelido para o placar global)
create table if not exists public.profiles (
  user_id uuid primary key references auth.users (id) on delete cascade,
  nickname text not null default '',
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "profiles_select_authenticated"
  on public.profiles for select
  to authenticated
  using (true);

create policy "profiles_insert_own"
  on public.profiles for insert
  to authenticated
  with check (auth.uid() = user_id);

create policy "profiles_update_own"
  on public.profiles for update
  to authenticated
  using (auth.uid() = user_id);

-- Histórico de pets falecidos (placar)
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

create policy "pet_records_insert_own"
  on public.pet_records for insert
  to authenticated
  with check (auth.uid() = user_id);

-- Momento da morte (persistido quando applyDecay define is_alive = false)
alter table public.pets add column if not exists died_at timestamptz;
