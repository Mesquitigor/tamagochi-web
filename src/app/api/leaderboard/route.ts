import { NextResponse } from "next/server";
import { loadLeaderboardEntries } from "@/lib/leaderboard/loadEntries";
import { getSupabaseForPublicLeaderboard } from "@/lib/supabase/forPublicLeaderboard";
import { createClient } from "@/lib/supabase/server";

const LEADERBOARD_LIMIT = 50;

export async function GET() {
  const authClient = await createClient();
  const {
    data: { user },
  } = await authClient.auth.getUser();

  const dataClient = await getSupabaseForPublicLeaderboard();
  const { records, error } = await loadLeaderboardEntries(
    dataClient,
    LEADERBOARD_LIMIT,
  );

  if (error) {
    return NextResponse.json({ error }, { status: 500 });
  }

  return NextResponse.json({
    records,
    me: user?.id ?? null,
  });
}
