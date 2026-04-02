import type { PetRow } from "@/types/pet";

const ISO = "2024-01-01T12:00:00.000Z";

export function makePet(overrides: Partial<PetRow> = {}): PetRow {
  return {
    id: "pet-test-1",
    user_id: "user-test-1",
    name: "Tamago",
    stage: "baby",
    character_type: "marutchi",
    hunger: 5,
    happiness: 5,
    discipline: 2,
    weight: 10,
    age_minutes: 60,
    is_alive: true,
    is_sick: false,
    is_sleeping: false,
    is_lights_on: true,
    poop_count: 0,
    care_misses: 0,
    last_interaction_at: ISO,
    last_decay_at: ISO,
    last_event_at: ISO,
    born_at: ISO,
    created_at: ISO,
    ...overrides,
  };
}

/** Milissegundos desde ISO para controlar relógio em `applyDecay`. */
export function ms(iso: string): number {
  return new Date(iso).getTime();
}
