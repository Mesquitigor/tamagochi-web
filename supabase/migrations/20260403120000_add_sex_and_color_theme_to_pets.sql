-- sex: 'male' | 'female' | null (null = ainda não configurado / novo ovo após reset)
-- color_theme: chave do tema do invólucro oval (src/lib/game/colorThemes.ts) | null = padrão rosa
alter table public.pets add column if not exists sex text;
alter table public.pets add column if not exists color_theme text;
