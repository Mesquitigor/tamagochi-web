import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import {
  insertPetOrOmitLastEventAt,
  updatePetOrOmitLastEventAt,
} from "@/lib/supabase/petsPersist";
import { applyDecay } from "@/lib/game/engine";
import type { PetRow } from "@/types/pet";

const defaultPet = (userId: string): Omit<PetRow, "id" | "created_at"> => ({
  user_id: userId,
  name: "Tamago",
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
});

function rowFromDb(r: Record<string, unknown>): PetRow {
  return {
    id: r.id as string,
    user_id: r.user_id as string,
    name: r.name as string,
    stage: r.stage as string,
    character_type: r.character_type as string,
    hunger: r.hunger as number,
    happiness: r.happiness as number,
    discipline: r.discipline as number,
    weight: r.weight as number,
    age_minutes: r.age_minutes as number,
    is_alive: r.is_alive as boolean,
    is_sick: r.is_sick as boolean,
    is_sleeping: r.is_sleeping as boolean,
    is_lights_on: r.is_lights_on as boolean,
    poop_count: r.poop_count as number,
    care_misses: r.care_misses as number,
    last_interaction_at: r.last_interaction_at as string,
    last_decay_at: r.last_decay_at as string,
    last_event_at:
      (r.last_event_at as string | undefined) ??
      (r.last_decay_at as string),
    born_at: r.born_at as string,
    created_at: r.created_at as string,
  };
}

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

  let p = rowFromDb(pet as Record<string, unknown>);
  const beforeStage = p.stage;
  const decayed = applyDecay(p, Date.now());
  p = decayed.pet;

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
    last_decay_at: p.last_decay_at,
    last_event_at: p.last_event_at,
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

  const body = (await req.json()) as { name?: string };
  const name = body.name?.trim();
  if (!name || name.length > 20)
    return NextResponse.json({ error: "Invalid name" }, { status: 400 });

  const { data: pet, error } = await supabase
    .from("pets")
    .update({ name })
    .eq("user_id", user.id)
    .select("*")
    .single();
  if (error)
    return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ pet: rowFromDb(pet as Record<string, unknown>) });
}
