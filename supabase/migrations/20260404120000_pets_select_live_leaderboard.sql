-- Placar público: ler pets vivos (uma linha por utilizador) para idade actual.
-- Expõe linhas a anon/authenticated; o cliente só pede name, stage, age_minutes, user_id.
drop policy if exists "pets_select_live_leaderboard" on public.pets;
create policy "pets_select_live_leaderboard"
  on public.pets for select
  to anon, authenticated
  using (is_alive = true);
