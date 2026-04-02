/** Linha `pets` compatível com as rotas API (campos mínimos). */
export function dbPetRow(
  overrides: Record<string, unknown> = {},
): Record<string, unknown> {
  return {
    id: "p1",
    user_id: "u1",
    name: "Tamago",
    stage: "baby",
    character_type: "marutchi",
    hunger: 5,
    happiness: 5,
    discipline: 0,
    weight: 5,
    age_minutes: 10,
    is_alive: true,
    is_sick: false,
    is_sleeping: false,
    is_lights_on: true,
    poop_count: 0,
    care_misses: 0,
    last_interaction_at: "2024-01-01T12:00:00.000Z",
    last_decay_at: "2024-01-01T12:00:00.000Z",
    last_event_at: "2024-01-01T12:00:00.000Z",
    born_at: "2024-01-01T12:00:00.000Z",
    created_at: "2024-01-01T12:00:00.000Z",
    ...overrides,
  };
}
