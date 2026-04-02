import type { SupabaseClient } from "@supabase/supabase-js";

/** PostgREST quando a coluna ainda não existe na base (migração não aplicada). */
export function isMissingLastEventAtDbError(message: string | undefined): boolean {
  if (!message) return false;
  const m = message.toLowerCase();
  return (
    m.includes("last_event_at") ||
    (m.includes("schema cache") && m.includes("could not find"))
  );
}

export async function updatePetOrOmitLastEventAt(
  supabase: SupabaseClient,
  petId: string,
  patch: Record<string, unknown>,
) {
  const first = await supabase.from("pets").update(patch).eq("id", petId);
  if (!first.error) return first;

  if ("last_event_at" in patch && isMissingLastEventAtDbError(first.error.message)) {
    const rest = { ...patch };
    delete rest.last_event_at;
    return supabase.from("pets").update(rest).eq("id", petId);
  }

  return first;
}

export async function insertPetOrOmitLastEventAt(
  supabase: SupabaseClient,
  row: Record<string, unknown>,
) {
  let result = await supabase.from("pets").insert(row).select("*").single();
  if (
    result.error &&
    "last_event_at" in row &&
    isMissingLastEventAtDbError(result.error.message)
  ) {
    const rest = { ...row };
    delete rest.last_event_at;
    result = await supabase.from("pets").insert(rest).select("*").single();
  }
  return result;
}

export async function updatePetsByUserIdOrOmitLastEventAt(
  supabase: SupabaseClient,
  userId: string,
  patch: Record<string, unknown>,
) {
  const run = (p: Record<string, unknown>) =>
    supabase.from("pets").update(p).eq("user_id", userId).select("*").single();

  let r = await run(patch);
  if (
    r.error &&
    "last_event_at" in patch &&
    isMissingLastEventAtDbError(r.error.message)
  ) {
    const rest = { ...patch };
    delete rest.last_event_at;
    r = await run(rest);
  }
  return r;
}
