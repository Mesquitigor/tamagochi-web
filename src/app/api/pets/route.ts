import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import {
  insertPetOrOmitLastEventAt,
  isMissingPetProfileColumnsDbError,
  updatePetOrOmitLastEventAt,
} from "@/lib/supabase/petsPersist";
import { applyDecay } from "@/lib/game/engine";
import { isValidColorThemeId } from "@/lib/game/colorThemes";
import { petRowFromDb } from "@/lib/pets/fromDbRow";
import type { PetRow } from "@/types/pet";

const defaultPet = (userId: string): Omit<PetRow, "id" | "created_at"> => ({
  user_id: userId,
  name: "Tamago",
  sex: null,
  color_theme: null,
  stage: "egg",
  character_type: "egg",
  hunger: 5,
  happiness: 5,
  discipline: 0,
  weight: 5,
  age_minutes: 0,
  is_alive: true,
  is_sick: false,
  is_sleeping: false,
  is_lights_on: true,
  poop_count: 0,
  care_misses: 0,
  last_interaction_at: new Date().toISOString(),
  last_decay_at: new Date().toISOString(),
  last_event_at: new Date().toISOString(),
  born_at: new Date().toISOString(),
  died_at: null,
});

export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const row = await supabase
    .from("pets")
    .select("*")
    .eq("user_id", user.id)
    .maybeSingle();

  if (row.error)
    return NextResponse.json({ error: row.error.message }, { status: 500 });

  let pet = row.data;
  if (!pet) {
    const insert = defaultPet(user.id);
    const { data: created, error: insErr } = await insertPetOrOmitLastEventAt(
      supabase,
      { ...insert } as Record<string, unknown>,
    );
    if (insErr)
      return NextResponse.json({ error: insErr.message }, { status: 500 });
    pet = created;
  }

  let p = petRowFromDb(pet as Record<string, unknown>);
  const beforeStage = p.stage;
  const decayed = applyDecay(p, Date.now());
  p = decayed.pet;
  if (!p.is_alive && !p.died_at) {
    p = { ...p, died_at: new Date().toISOString() };
  }

  const { error: upErr } = await updatePetOrOmitLastEventAt(supabase, p.id, {
    hunger: p.hunger,
    happiness: p.happiness,
    discipline: p.discipline,
    weight: p.weight,
    age_minutes: p.age_minutes,
    stage: p.stage,
    character_type: p.character_type,
    is_alive: p.is_alive,
    is_sick: p.is_sick,
    poop_count: p.poop_count,
    care_misses: p.care_misses,
    last_decay_at: p.last_decay_at,
    last_event_at: p.last_event_at,
    died_at: p.is_alive ? null : p.died_at,
  });
  if (upErr)
    return NextResponse.json({ error: upErr.message }, { status: 500 });

  return NextResponse.json({ pet: p, prevStage: beforeStage });
}

export async function PATCH(req: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = (await req.json()) as {
    name?: string;
    sex?: string;
    color_theme?: string | null;
  };

  const patch: Record<string, unknown> = {};

  if ("name" in body) {
    const name = body.name?.trim() ?? "";
    if (!name || name.length > 20)
      return NextResponse.json({ error: "Invalid name" }, { status: 400 });
    patch.name = name;
  }

  if ("sex" in body) {
    if (body.sex !== "male" && body.sex !== "female")
      return NextResponse.json({ error: "Invalid sex" }, { status: 400 });
    patch.sex = body.sex;
  }

  if ("color_theme" in body) {
    if (body.color_theme === null || body.color_theme === "")
      patch.color_theme = null;
    else if (
      typeof body.color_theme === "string" &&
      isValidColorThemeId(body.color_theme)
    )
      patch.color_theme = body.color_theme;
    else
      return NextResponse.json(
        { error: "Invalid color theme" },
        { status: 400 },
      );
  }

  if (Object.keys(patch).length === 0)
    return NextResponse.json({ error: "Empty patch" }, { status: 400 });

  const { data: pet, error } = await supabase
    .from("pets")
    .update(patch)
    .eq("user_id", user.id)
    .select("*")
    .single();
  if (error) {
    if (isMissingPetProfileColumnsDbError(error.message)) {
      return NextResponse.json(
        {
          error:
            "A tabela pets no Supabase ainda não tem as colunas sex e color_theme. Abre o SQL Editor e executa: alter table public.pets add column if not exists sex text; alter table public.pets add column if not exists color_theme text;",
          code: "missing_pet_profile_columns",
        },
        { status: 503 },
      );
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ pet: petRowFromDb(pet as Record<string, unknown>) });
}
