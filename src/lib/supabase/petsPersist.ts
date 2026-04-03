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

/** Colunas `sex` / `color_theme` em falta (migração não aplicada). */
export function isMissingPetProfileColumnsDbError(
  message: string | undefined,
): boolean {
  if (!message) return false;
  const m = message.toLowerCase();
  const mentionsNewCol = m.includes("sex") || m.includes("color_theme");
  const looksLikeMissingColumn =
    m.includes("schema cache") ||
    m.includes("could not find") ||
    m.includes("does not exist");
  return mentionsNewCol && looksLikeMissingColumn;
}

export function isMissingDiedAtDbError(message: string | undefined): boolean {
  if (!message) return false;
  const m = message.toLowerCase();
  return (
    m.includes("died_at") &&
    (m.includes("schema cache") ||
      m.includes("could not find") ||
      m.includes("does not exist"))
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

  if ("died_at" in patch && isMissingDiedAtDbError(first.error.message)) {
    const rest = { ...patch };
    delete rest.died_at;
    return supabase.from("pets").update(rest).eq("id", petId);
  }

  return first;
}

export async function insertPetOrOmitLastEventAt(
  supabase: SupabaseClient,
  row: Record<string, unknown>,
) {
  let attempt: Record<string, unknown> = { ...row };
  for (let i = 0; i < 4; i++) {
    const result = await supabase
      .from("pets")
      .insert(attempt)
      .select("*")
      .single();
    if (!result.error) return result;
    const msg = result.error.message;
    if (isMissingPetProfileColumnsDbError(msg)) {
      const next = { ...attempt };
      delete next.sex;
      delete next.color_theme;
      attempt = next;
      continue;
    }
    if ("last_event_at" in attempt && isMissingLastEventAtDbError(msg)) {
      const next = { ...attempt };
      delete next.last_event_at;
      attempt = next;
      continue;
    }
    if ("died_at" in attempt && isMissingDiedAtDbError(msg)) {
      const next = { ...attempt };
      delete next.died_at;
      attempt = next;
      continue;
    }
    return result;
  }
  return await supabase.from("pets").insert(attempt).select("*").single();
}

export async function updatePetsByUserIdOrOmitLastEventAt(
  supabase: SupabaseClient,
  userId: string,
  patch: Record<string, unknown>,
) {
  const run = (p: Record<string, unknown>) =>
    supabase.from("pets").update(p).eq("user_id", userId).select("*").single();

  let attempt = { ...patch };
  for (let i = 0; i < 4; i++) {
    const r = await run(attempt);
    if (!r.error) return r;
    const msg = r.error.message;
    if (isMissingPetProfileColumnsDbError(msg)) {
      const next = { ...attempt };
      delete next.sex;
      delete next.color_theme;
      attempt = next;
      continue;
    }
    if ("last_event_at" in attempt && isMissingLastEventAtDbError(msg)) {
      const next = { ...attempt };
      delete next.last_event_at;
      attempt = next;
      continue;
    }
    if ("died_at" in attempt && isMissingDiedAtDbError(msg)) {
      const next = { ...attempt };
      delete next.died_at;
      attempt = next;
      continue;
    }
    return r;
  }
  return await run(attempt);
}
