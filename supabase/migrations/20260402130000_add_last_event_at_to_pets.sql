-- Executar no Supabase → SQL Editor (ou `supabase db push` se usar CLI).
-- Corrige: "Could not find the 'last_event_at' column of 'pets' in the schema cache"

alter table public.pets
  add column if not exists last_event_at timestamptz not null default now();

comment on column public.pets.last_event_at is
  'Último instante do evento aleatório horário no motor de jogo (webgotchi).';
