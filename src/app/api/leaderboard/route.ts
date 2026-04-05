import { NextResponse } from "next/server";
import { loadLeaderboardEntries } from "@/lib/leaderboard/loadEntries";
import { getSupabaseForPublicLeaderboard } from "@/lib/supabase/forPublicLeaderboard";
import { createClient } from "@/lib/supabase/server";

const DEFAULT_LIMIT = 50;
const MAX_LIMIT = 100;

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const raw = searchParams.get("limit");
  const parsed = raw ? Number.parseInt(raw, 10) : DEFAULT_LIMIT;
  const limit = Number.isFinite(parsed)
    ? Math.min(MAX_LIMIT, Math.max(1, parsed))
    : DEFAULT_LIMIT;

  const authClient = await createClient();
  const {
    data: { user },
  } = await authClient.auth.getUser();

  const dataClient = await getSupabaseForPublicLeaderboard();
  const { records, error } = await loadLeaderboardEntries(dataClient, limit);

  if (error) {
    return NextResponse.json({ error }, { status: 500 });
  }

  return NextResponse.json({
    records,
    me: user?.id ?? null,
  });
}
