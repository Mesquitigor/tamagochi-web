-- Evita duplicar o mesmo óbito (ex.: morte já gravada e depois «Novo ovo»).
create unique index if not exists pet_records_user_id_died_at_key
  on public.pet_records (user_id, died_at);
