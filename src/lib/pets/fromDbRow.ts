import type { PetRow } from "@/types/pet";
import { normalizeCharacterType } from "@/lib/game/characters";

export function petRowFromDb(r: Record<string, unknown>): PetRow {
  return {
    id: r.id as string,
    user_id: r.user_id as string,
    name: r.name as string,
    sex: (r.sex as string | null | undefined) ?? null,
    color_theme: (r.color_theme as string | null | undefined) ?? null,
    stage: r.stage as string,
    character_type: normalizeCharacterType(r.character_type as string),
    hunger: r.hunger as number,
    happiness: r.happiness as number,
    discipline: r.discipline as number,
    weight: r.weight as number,
    age_minutes: r.age_minutes as number,
    is_alive: r.is_alive as boolean,
    is_sick: r.is_sick as boolean,
    is_sleeping: r.is_sleeping as boolean,
    is_lights_on: r.is_lights_on as boolean,
    poop_count: r.poop_count as number,
    care_misses: r.care_misses as number,
    last_interaction_at: r.last_interaction_at as string,
    last_decay_at: r.last_decay_at as string,
    last_event_at:
      (r.last_event_at as string | undefined) ??
      (r.last_decay_at as string),
    born_at: r.born_at as string,
    created_at: r.created_at as string,
    died_at: (r.died_at as string | null | undefined) ?? null,
  };
}
