-- Novos pets sem ovo: default alinhado com IDs neutros em src/lib/game/characters.ts
-- Valores antigos (marutchi, etc.) continuam válidos na BD até o próximo GET normalizar via app.
alter table public.pets
  alter column character_type set default 'baby_cared';
