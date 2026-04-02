import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { updatePetOrOmitLastEventAt } from "@/lib/supabase/petsPersist";
import { reduceAction } from "@/lib/game/engine";
import { evaluateNotificationTriggers } from "@/lib/game/notifications";
import type { PetAction } from "@/types/pet";
import webpush from "web-push";

function rowFromDb(r: Record<string, unknown>) {
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

  const prev = rowFromDb(row as Record<string, unknown>);
  if (!prev.is_alive)
    return NextResponse.json({ error: "Pet gone" }, { status: 400 });

  const { pet: next, randomEventAlert } = reduceAction(
    prev,
    action,
    json.playGuess,
  );

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
