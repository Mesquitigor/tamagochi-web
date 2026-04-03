import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

const MAX_NICK = 24;

function normalizeNickname(raw: string): string | null {
  const s = raw.trim();
  if (!s || s.length > MAX_NICK) return null;
  return s;
}

export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data: row, error } = await supabase
    .from("profiles")
    .select("nickname, nickname_setup_done")
    .eq("user_id", user.id)
    .maybeSingle();

  if (error)
    return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({
    nickname: row?.nickname ?? "",
    nickname_setup_done:
      (row as { nickname_setup_done?: boolean } | null)
        ?.nickname_setup_done === true,
    user_id: user.id,
  });
}

export async function PATCH(req: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = (await req.json()) as { nickname?: string };
  const nick = normalizeNickname(body.nickname ?? "");
  if (!nick)
    return NextResponse.json(
      { error: `Apelido inválido (1–${MAX_NICK} caracteres).` },
      { status: 400 },
    );

  const { error } = await supabase.from("profiles").upsert(
    {
      user_id: user.id,
      nickname: nick,
      nickname_setup_done: true,
    },
    { onConflict: "user_id" },
  );

  if (error) {
    if (
      error.code === "42P01" ||
      error.message?.toLowerCase().includes("profiles")
    ) {
      return NextResponse.json(
        {
          error:
            "A tabela profiles ainda não existe. Executa a migração em supabase/migrations.",
          code: "missing_profiles",
        },
        { status: 503 },
      );
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ nickname: nick, user_id: user.id });
}
