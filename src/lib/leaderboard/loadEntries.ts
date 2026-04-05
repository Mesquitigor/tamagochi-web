import type { SupabaseClient } from "@supabase/supabase-js";
import type { LeaderboardEntry } from "@/types/leaderboard";

type PetRecordRow = {
  pet_name: string;
  stage: string;
  character_type: string;
  age_minutes: number;
  died_at: string;
  user_id: string;
};

type PetLiveRow = {
  name: string;
  stage: string;
  age_minutes: number;
  user_id: string;
};

function isPetRecordsMissing(err: { code?: string; message?: string }): boolean {
  const m = err.message?.toLowerCase() ?? "";
  return (
    err.code === "42P01" ||
    (m.includes("pet_records") && m.includes("does not exist"))
  );
}

/**
 * Placar: pets vivos (idade actual) + historial em pet_records (finais ao morrer),
 * ordenado por age_minutes descendente.
 */
export async function loadLeaderboardEntries(
  supabase: SupabaseClient,
  limit: number,
): Promise<{ records: LeaderboardEntry[]; error: string | null }> {
  const cap = Math.max(limit * 2, 50);

  const [{ data: records, error: recErr }, { data: liveRows, error: liveErr }] =
    await Promise.all([
      supabase
        .from("pet_records")
        .select("pet_name, stage, character_type, age_minutes, died_at, user_id")
        .order("age_minutes", { ascending: false })
        .limit(cap),
      supabase
        .from("pets")
        .select("name, stage, age_minutes, user_id")
        .eq("is_alive", true),
    ]);

  if (recErr && !isPetRecordsMissing(recErr)) {
    return { records: [], error: recErr.message };
  }

  const deadRows = (records ?? []) as PetRecordRow[];
  const livePets: PetLiveRow[] = liveErr ? [] : ((liveRows ?? []) as PetLiveRow[]);

  const deadCandidates: LeaderboardEntry[] = deadRows.map((r) => ({
    rank: 0,
    pet_name: r.pet_name,
    nickname: "",
    stage: r.stage,
    age_minutes: r.age_minutes,
    died_at: r.died_at,
    user_id: r.user_id,
    is_alive: false,
  }));

  const liveCandidates: LeaderboardEntry[] = livePets.map((p) => ({
    rank: 0,
    pet_name: p.name,
    nickname: "",
    stage: p.stage,
    age_minutes: p.age_minutes,
    died_at: null,
    user_id: p.user_id,
    is_alive: true,
  }));

  const combined = [...liveCandidates, ...deadCandidates].sort(
    (a, b) => b.age_minutes - a.age_minutes,
  );
  const top = combined.slice(0, limit);

  const userIds = [...new Set(top.map((r) => r.user_id))];
  let nickByUser: Record<string, string> = {};
  if (userIds.length > 0) {
    const { data: profiles, error: profErr } = await supabase
      .from("profiles")
      .select("user_id, nickname")
      .in("user_id", userIds);

    if (!profErr && profiles) {
      nickByUser = Object.fromEntries(
        profiles.map((p) => [
          p.user_id as string,
          (p.nickname as string)?.trim() || "—",
        ]),
      );
    }
  }

  const list: LeaderboardEntry[] = top.map((r, i) => ({
    ...r,
    rank: i + 1,
    nickname: nickByUser[r.user_id] || "—",
  }));

  return { records: list, error: null };
}
