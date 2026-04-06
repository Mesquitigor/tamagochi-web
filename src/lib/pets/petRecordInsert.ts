import type { SupabaseClient } from "@supabase/supabase-js";
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

/** Grava recorde de placar; ignora duplicado (user_id, died_at) após migração única. */
export async function upsertPetRecordForDeadPet(
  supabase: SupabaseClient,
  deadPet: PetRow,
  userId: string,
): Promise<{ error: string | null }> {
  const recordRow = petRecordRowFromDeadPet(deadPet, userId);
  if (!recordRow) return { error: null };

  const { error } = await supabase.from("pet_records").upsert(recordRow, {
    onConflict: "user_id,died_at",
    ignoreDuplicates: true,
  });

  if (error) {
    const missing =
      error.code === "42P01" ||
      (error.message?.toLowerCase().includes("pet_records") &&
        error.message?.toLowerCase().includes("does not exist"));
    if (missing) return { error: null };
    return { error: error.message };
  }
  return { error: null };
}

/** Chamado quando o estado passa de vivo para morto (acção ou decaimento). */
export async function tryInsertPetRecordOnDeathTransition(
  supabase: SupabaseClient,
  wasAlive: boolean,
  petAfter: PetRow,
  userId: string,
): Promise<{ error: string | null }> {
  if (wasAlive && !petAfter.is_alive) {
    return upsertPetRecordForDeadPet(supabase, petAfter, userId);
  }
  return { error: null };
}
