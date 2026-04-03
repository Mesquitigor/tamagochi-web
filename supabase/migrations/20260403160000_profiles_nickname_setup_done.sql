-- Ecrã de apelido só na primeira vez: após gravar, fica true para não voltar a mostrar.
alter table public.profiles
  add column if not exists nickname_setup_done boolean not null default false;

update public.profiles
set nickname_setup_done = true
where trim(coalesce(nickname, '')) <> '';
