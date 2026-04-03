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

export async function loadLeaderboardEntries(
  supabase: SupabaseClient,
  limit: number,
): Promise<{ records: LeaderboardEntry[]; error: string | null }> {
  const { data: records, error: recErr } = await supabase
    .from("pet_records")
    .select("pet_name, stage, character_type, age_minutes, died_at, user_id")
    .order("age_minutes", { ascending: false })
    .limit(limit);

  if (recErr) {
    if (
      recErr.code === "42P01" ||
      (recErr.message?.toLowerCase().includes("pet_records") &&
        recErr.message?.toLowerCase().includes("does not exist"))
    ) {
      return { records: [], error: null };
    }
    return { records: [], error: recErr.message };
  }

  const rows = (records ?? []) as PetRecordRow[];
  const userIds = [...new Set(rows.map((r) => r.user_id))];

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

  const list: LeaderboardEntry[] = rows.map((r, i) => ({
    rank: i + 1,
    pet_name: r.pet_name,
    nickname: nickByUser[r.user_id] || "—",
    stage: r.stage,
    age_minutes: r.age_minutes,
    died_at: r.died_at,
    user_id: r.user_id,
  }));

  return { records: list, error: null };
}
