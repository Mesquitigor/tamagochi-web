import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { updatePetOrOmitLastEventAt } from "@/lib/supabase/petsPersist";
import { reduceAction } from "@/lib/game/engine";
import { evaluateNotificationTriggers } from "@/lib/game/notifications";
import type { PetAction } from "@/types/pet";
import { petRowFromDb } from "@/lib/pets/fromDbRow";
import webpush from "web-push";

async function maybePush(
  userId: string,
  title: string,
  body: string,
  supabase: Awaited<ReturnType<typeof createClient>>,
) {
  const pub = process.env.NEXT_PUBLIC_WEB_PUSH_PUBLIC_KEY;
  const priv = process.env.WEB_PUSH_PRIVATE_KEY;
  if (!pub || !priv) return;

  webpush.setVapidDetails("mailto:support@tamagotchi-web.local", pub, priv);

  const { data: subs } = await supabase
    .from("push_subscriptions")
    .select("endpoint, keys")
    .eq("user_id", userId);

  if (!subs?.length) return;

  const payload = JSON.stringify({ title, body });

  await Promise.allSettled(
    subs.map((s: { endpoint: string; keys: { p256dh: string; auth: string } }) =>
      webpush
        .sendNotification(
          { endpoint: s.endpoint, keys: s.keys },
          payload,
        )
        .catch(() => {}),
    ),
  );
}

export async function POST(req: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const json = (await req.json()) as {
    action: PetAction;
    playGuess?: boolean;
  };
  const action = json.action;
  const allowed: PetAction[] = [
    "feed_meal",
    "feed_snack",
    "play",
    "clean",
    "medicine",
    "toggle_light",
    "discipline",
    "attention",
  ];
  if (!allowed.includes(action))
    return NextResponse.json({ error: "Bad action" }, { status: 400 });

  const { data: row, error } = await supabase
    .from("pets")
    .select("*")
    .eq("user_id", user.id)
    .single();
  if (error || !row)
    return NextResponse.json({ error: error?.message ?? "No pet" }, { status: 404 });

  const prev = petRowFromDb(row as Record<string, unknown>);
  if (!prev.is_alive)
    return NextResponse.json({ error: "Pet gone" }, { status: 400 });

  const { pet: nextPet, randomEventAlert } = reduceAction(
    prev,
    action,
    json.playGuess,
  );
  let next = nextPet;
  if (!next.is_alive && !next.died_at) {
    next = { ...next, died_at: new Date().toISOString() };
  }

  const { error: upErr } = await updatePetOrOmitLastEventAt(supabase, next.id, {
    hunger: next.hunger,
    happiness: next.happiness,
    discipline: next.discipline,
    weight: next.weight,
    age_minutes: next.age_minutes,
    stage: next.stage,
    character_type: next.character_type,
    is_alive: next.is_alive,
    is_sick: next.is_sick,
    is_sleeping: next.is_sleeping,
    is_lights_on: next.is_lights_on,
    poop_count: next.poop_count,
    care_misses: next.care_misses,
    last_interaction_at: next.last_interaction_at,
    last_decay_at: next.last_decay_at,
    last_event_at: next.last_event_at,
    died_at: next.is_alive ? null : next.died_at,
  });

  if (upErr)
    return NextResponse.json({ error: upErr.message }, { status: 500 });

  const note = evaluateNotificationTriggers(next, prev, {
    randomEventAlert,
  });
  if (note)
    await maybePush(user.id, note.title, note.body, supabase);

  return NextResponse.json({ pet: next });
}
