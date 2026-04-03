import type { PetRow } from "@/types/pet";

/** Linha para `pet_records` a partir do estado final de um pet morto. */
export function petRecordRowFromDeadPet(
  prev: PetRow,
  userId: string,
): Record<string, unknown> | null {
  if (prev.is_alive) return null;
  return {
    user_id: userId,
    pet_name: prev.name,
    stage: prev.stage,
    character_type: prev.character_type,
    age_minutes: prev.age_minutes,
    born_at: prev.born_at,
    died_at: prev.died_at ?? prev.last_decay_at,
  };
}
