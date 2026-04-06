import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { updatePetsByUserIdOrOmitLastEventAt } from "@/lib/supabase/petsPersist";
import { petRowFromDb } from "@/lib/pets/fromDbRow";
import { upsertPetRecordForDeadPet } from "@/lib/pets/petRecordInsert";

export async function POST() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data: existing, error: selErr } = await supabase
    .from("pets")
    .select("*")
    .eq("user_id", user.id)
    .maybeSingle();

  if (selErr)
    return NextResponse.json({ error: selErr.message }, { status: 500 });

  if (existing) {
    const prev = petRowFromDb(existing as Record<string, unknown>);
    const { error: insErr } = await upsertPetRecordForDeadPet(
      supabase,
      prev,
      user.id,
    );
    if (insErr)
      return NextResponse.json({ error: insErr }, { status: 500 });
  }

  const now = new Date().toISOString();
  const { data: pet, error } = await updatePetsByUserIdOrOmitLastEventAt(
    supabase,
    user.id,
    {
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
      last_interaction_at: now,
      last_decay_at: now,
      last_event_at: now,
      born_at: now,
      died_at: null,
    },
  );

  if (error)
    return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({
    pet: petRowFromDb(pet as Record<string, unknown>),
  });
}
