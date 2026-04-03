import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import type { LeaderboardEntry } from "@/types/leaderboard";

export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data: records, error: recErr } = await supabase
    .from("pet_records")
    .select("pet_name, stage, character_type, age_minutes, died_at, user_id")
    .order("age_minutes", { ascending: false })
    .limit(50);

  if (recErr) {
    if (
      recErr.code === "42P01" ||
      (recErr.message?.toLowerCase().includes("pet_records") &&
        recErr.message?.toLowerCase().includes("does not exist"))
    ) {
      return NextResponse.json({
        records: [] as LeaderboardEntry[],
        me: user.id,
      });
    }
    return NextResponse.json({ error: recErr.message }, { status: 500 });
  }

  const rows = records ?? [];
  const userIds = [...new Set(rows.map((r) => r.user_id as string))];

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
    pet_name: r.pet_name as string,
    nickname: nickByUser[r.user_id as string] || "—",
    stage: r.stage as string,
    age_minutes: r.age_minutes as number,
    died_at: r.died_at as string,
    user_id: r.user_id as string,
  }));

  return NextResponse.json({ records: list, me: user.id });
}
