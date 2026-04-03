-- Placar visível antes do login: leitura por role anon (chave anónima Supabase)
drop policy if exists "pet_records_select_anon" on public.pet_records;
create policy "pet_records_select_anon"
  on public.pet_records for select
  to anon
  using (true);

drop policy if exists "profiles_select_anon" on public.profiles;
create policy "profiles_select_anon"
  on public.profiles for select
  to anon
  using (true);
