import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { updatePetsByUserIdOrOmitLastEventAt } from "@/lib/supabase/petsPersist";

export async function POST() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const now = new Date().toISOString();
  const { data: pet, error } = await updatePetsByUserIdOrOmitLastEventAt(
    supabase,
    user.id,
    {
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
      last_interaction_at: now,
      last_decay_at: now,
      last_event_at: now,
      born_at: now,
    },
  );

  if (error)
    return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ pet });
}
