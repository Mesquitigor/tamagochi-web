import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import {
  applyDecay,
  computeCareScore,
  reduceAction,
} from "@/lib/game/engine";
import {
  EGG_HATCH_MS,
  HUNGER_DECAY_MS_PER_HEART,
  MAX_CARE_MISSES,
  MAX_POOP,
  RANDOM_EVENT_INTERVAL_MS,
  STAGE_MS,
  STARVATION_DEATH_MS,
} from "@/lib/game/constants";
import { makePet, ms } from "../factories/pet";

const REDUCE_ACTION_NOW = "2024-06-10T15:00:00.000Z";

describe("computeCareScore", () => {
  it("arredonda média de fome e felicidade", () => {
    expect(computeCareScore(makePet({ hunger: 4, happiness: 5 }))).toBe(5);
    expect(computeCareScore(makePet({ hunger: 4, happiness: 4 }))).toBe(4);
    expect(computeCareScore(makePet({ hunger: 0, happiness: 1 }))).toBe(1);
  });
});

describe("applyDecay", () => {
  it("não altera pet morto", () => {
    const dead = makePet({ is_alive: false, hunger: 0, happiness: 0 });
    const out = applyDecay(dead, Date.now()).pet;
    expect(out).toEqual(dead);
  });

  it("actualiza idade sem decair se passou menos de 60s desde last_decay_at", () => {
    const t0 = ms("2024-01-01T12:00:00.000Z");
    const pet = makePet({
      born_at: new Date(t0).toISOString(),
      last_decay_at: new Date(t0 + 30_000).toISOString(),
      stage: "egg",
      character_type: "egg",
    });
    const now = t0 + 45_000;
    const out = applyDecay(pet, now).pet;
    expect(out.age_minutes).toBeGreaterThanOrEqual(0);
    expect(out.hunger).toBe(pet.hunger);
    expect(out.last_decay_at).toBe(pet.last_decay_at);
  });

  it("choca ovo após EGG_HATCH_MS", () => {
    const born = ms("2024-01-01T12:00:00.000Z");
    const pet = makePet({
      born_at: new Date(born).toISOString(),
      last_decay_at: new Date(born).toISOString(),
      stage: "egg",
      character_type: "egg",
      hunger: 5,
      happiness: 5,
    });
    const now = born + EGG_HATCH_MS + 1_000;
    const out = applyDecay(pet, now).pet;
    expect(out.stage).toBe("baby");
    expect(out.character_type).not.toBe("egg");
  });

  it("reduz fome após intervalo de decaimento", () => {
    const t = ms("2024-01-01T12:00:00.000Z");
    const elapsed = 2 * HUNGER_DECAY_MS_PER_HEART + 60_000;
    const now = t + elapsed;
    const pet = makePet({
      hunger: 5,
      happiness: 5,
      last_decay_at: new Date(t).toISOString(),
      last_event_at: new Date(now).toISOString(),
      is_sleeping: false,
      is_lights_on: true,
    });
    const out = applyDecay(pet, now).pet;
    expect(out.hunger).toBe(3);
  });

  it("com sono e luz apagada aplica multiplicador de decaimento", () => {
    const t = ms("2024-01-01T12:00:00.000Z");
    const pet = makePet({
      hunger: 5,
      last_decay_at: new Date(t).toISOString(),
      is_sleeping: true,
      is_lights_on: false,
    });
    const elapsed = HUNGER_DECAY_MS_PER_HEART;
    const awakeDrop = applyDecay(
      makePet({
        ...pet,
        is_sleeping: false,
        is_lights_on: true,
      }),
      t + elapsed,
    ).pet.hunger;
    const sleeping = applyDecay(pet, t + elapsed).pet.hunger;
    expect(sleeping).toBeGreaterThanOrEqual(awakeDrop);
  });

  it("acumula cocô e encosta em MAX_POOP", () => {
    const t = ms("2024-01-01T12:00:00.000Z");
    const end = t + 100 * 60 * 60_000;
    const pet = makePet({
      poop_count: 0,
      hunger: 5,
      happiness: 5,
      care_misses: 0,
      last_decay_at: new Date(t).toISOString(),
      last_interaction_at: new Date(end).toISOString(),
    });
    const out = applyDecay(pet, end).pet;
    expect(out.poop_count).toBe(MAX_POOP);
    expect(out.is_alive).toBe(true);
  });

  it("marca doente quando poop_count >= 2 após decaimento", () => {
    const t = ms("2024-01-01T12:00:00.000Z");
    const end = t + 10 * 60 * 60_000;
    const pet = makePet({
      poop_count: 1,
      last_decay_at: new Date(t).toISOString(),
      last_interaction_at: new Date(end).toISOString(),
      is_sick: false,
    });
    const out = applyDecay(pet, end).pet;
    expect(out.poop_count).toBeGreaterThanOrEqual(2);
    expect(out.is_sick).toBe(true);
  });

  it("incrementa care_misses quando cocô no máximo e doente", () => {
    const t = ms("2024-01-01T12:00:00.000Z");
    const pet = makePet({
      poop_count: MAX_POOP,
      is_sick: true,
      care_misses: 2,
      hunger: 5,
      happiness: 5,
      last_decay_at: new Date(t - 2 * HUNGER_DECAY_MS_PER_HEART).toISOString(),
      last_interaction_at: new Date(t).toISOString(),
    });
    const out = applyDecay(pet, t).pet;
    expect(out.care_misses).toBe(3);
  });

  it("mata por fome prolongada quando ambos stats chegam a zero", () => {
    const now = ms("2024-01-05T18:00:00.000Z");
    const interact = now - STARVATION_DEATH_MS - 120_000;
    const lastDecay = now - 50 * HUNGER_DECAY_MS_PER_HEART;
    const pet = makePet({
      hunger: 5,
      happiness: 5,
      last_interaction_at: new Date(interact).toISOString(),
      last_decay_at: new Date(lastDecay).toISOString(),
      care_misses: 0,
    });
    const out = applyDecay(pet, now).pet;
    expect(out.is_alive).toBe(false);
  });

  it("mata por care_misses excessivos com stats baixos", () => {
    const t = ms("2024-01-01T12:00:00.000Z");
    const pet = makePet({
      care_misses: MAX_CARE_MISSES,
      hunger: 1,
      happiness: 1,
      last_decay_at: new Date(t - 2 * HUNGER_DECAY_MS_PER_HEART).toISOString(),
    });
    const out = applyDecay(pet, t).pet;
    expect(out.is_alive).toBe(false);
  });

  it("com cuidado alto evolui baby→child mais cedo", () => {
    const born = ms("2024-01-01T12:00:00.000Z");
    const highCare = makePet({
      born_at: new Date(born).toISOString(),
      stage: "baby",
      character_type: "marutchi",
      hunger: 5,
      happiness: 5,
      last_decay_at: new Date(born).toISOString(),
      last_event_at: new Date(born).toISOString(),
    });
    const threshold =
      born + EGG_HATCH_MS + STAGE_MS.baby * 0.8 + 500;
    expect(applyDecay(highCare, threshold - 2000).pet.stage).toBe("baby");
    expect(applyDecay(highCare, threshold).pet.stage).toBe("child");
  });

  it("com cuidado baixo permanece baby mais tempo que com cuidado alto", () => {
    const born = ms("2024-01-01T12:00:00.000Z");
    const whenHighWouldChild = born + EGG_HATCH_MS + STAGE_MS.baby * 0.8 + 500;
    const lowCare = makePet({
      born_at: new Date(born).toISOString(),
      stage: "baby",
      character_type: "marutchi",
      hunger: 0,
      happiness: 0,
      last_decay_at: new Date(whenHighWouldChild - 30_000).toISOString(),
      last_interaction_at: new Date(whenHighWouldChild).toISOString(),
      last_event_at: new Date(born).toISOString(),
    });
    expect(applyDecay(lowCare, whenHighWouldChild).pet.stage).toBe("baby");
  });

  it("dispara evento aleatório após intervalo e reduz fome com sorte baixa", () => {
    const t = ms("2024-01-01T12:00:00.000Z");
    const pet = makePet({
      hunger: 5,
      happiness: 5,
      last_decay_at: new Date(t).toISOString(),
      last_event_at: new Date(t - RANDOM_EVENT_INTERVAL_MS - 1_000).toISOString(),
    });
    vi.spyOn(Math, "random").mockReturnValue(0.1);
    const { pet: out, randomEventAlert } = applyDecay(pet, t + 60_000);
    vi.restoreAllMocks();
    expect(out.hunger).toBe(4);
    expect(randomEventAlert).toBe(false);
  });

  it("evento aleatório de fome marca alerta se fome fica ≤ 1", () => {
    const t = ms("2024-01-01T12:00:00.000Z");
    const pet = makePet({
      hunger: 2,
      happiness: 5,
      last_decay_at: new Date(t).toISOString(),
      last_event_at: new Date(t - RANDOM_EVENT_INTERVAL_MS - 1_000).toISOString(),
    });
    vi.spyOn(Math, "random").mockReturnValue(0.1);
    const { pet: out, randomEventAlert } = applyDecay(pet, t + 60_000);
    vi.restoreAllMocks();
    expect(out.hunger).toBe(1);
    expect(randomEventAlert).toBe(true);
  });

  it("evento aleatório sem efeito negativo não marca randomEventAlert", () => {
    const t = ms("2024-01-01T12:00:00.000Z");
    const pet = makePet({
      hunger: 5,
      happiness: 5,
      last_decay_at: new Date(t).toISOString(),
      last_event_at: new Date(t - RANDOM_EVENT_INTERVAL_MS - 1_000).toISOString(),
    });
    vi.spyOn(Math, "random").mockReturnValue(0.9);
    const { pet: out, randomEventAlert } = applyDecay(pet, t + 60_000);
    vi.restoreAllMocks();
    expect(out.hunger).toBe(5);
    expect(out.happiness).toBe(5);
    expect(randomEventAlert).toBe(false);
  });
});

describe("reduceAction", () => {
  beforeEach(() => {
    vi.useFakeTimers({ now: new Date(REDUCE_ACTION_NOW) });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  function petFresh(overrides: Parameters<typeof makePet>[0] = {}) {
    return makePet({
      last_decay_at: REDUCE_ACTION_NOW,
      last_interaction_at: REDUCE_ACTION_NOW,
      last_event_at: REDUCE_ACTION_NOW,
      ...overrides,
    });
  }

  it("feed_meal aumenta fome e peso e cocô", () => {
    const pet = petFresh({ hunger: 2, weight: 10, poop_count: 0 });
    const out = reduceAction(pet, "feed_meal").pet;
    expect(out.hunger).toBe(4);
    expect(out.weight).toBe(11);
    expect(out.poop_count).toBe(1);
  });

  it("feed_snack aumenta fome, felicidade e peso", () => {
    const pet = petFresh({ hunger: 2, happiness: 2, weight: 10 });
    const out = reduceAction(pet, "feed_snack").pet;
    expect(out.hunger).toBe(3);
    expect(out.happiness).toBe(3);
    expect(out.weight).toBe(12);
  });

  it("play com vitória aumenta felicidade e reduz peso", () => {
    const pet = petFresh({ happiness: 3, weight: 15 });
    const out = reduceAction(pet, "play", true).pet;
    expect(out.happiness).toBe(4);
    expect(out.weight).toBe(14);
  });

  it("play com derrota reduz felicidade", () => {
    const pet = petFresh({ happiness: 3 });
    const out = reduceAction(pet, "play", false).pet;
    expect(out.happiness).toBe(2);
  });

  it("play com fome baixa gasta fome extra", () => {
    const pet = petFresh({
      hunger: 1,
      happiness: 4,
    });
    const out = reduceAction(pet, "play", true).pet;
    expect(out.hunger).toBe(0);
  });

  it("clean zera cocô e pode curar com stats altos", () => {
    const pet = petFresh({
      poop_count: 3,
      is_sick: true,
      hunger: 4,
      happiness: 4,
    });
    const out = reduceAction(pet, "clean").pet;
    expect(out.poop_count).toBe(0);
    expect(out.is_sick).toBe(false);
  });

  it("medicine remove doença e recupera fome", () => {
    const pet = petFresh({ is_sick: true, hunger: 2 });
    const out = reduceAction(pet, "medicine").pet;
    expect(out.is_sick).toBe(false);
    expect(out.hunger).toBe(3);
  });

  it("medicine sem doença reduz felicidade", () => {
    const pet = petFresh({ is_sick: false, happiness: 4 });
    const out = reduceAction(pet, "medicine").pet;
    expect(out.is_sick).toBe(false);
    expect(out.happiness).toBe(3);
  });

  it("toggle_light alterna luz e sono", () => {
    const pet = petFresh({ is_lights_on: true, is_sleeping: false });
    const out = reduceAction(pet, "toggle_light").pet;
    expect(out.is_lights_on).toBe(false);
    expect(out.is_sleeping).toBe(true);
  });

  it("toggle_light com felicidade mínima recusa dormir", () => {
    const pet = petFresh({
      is_lights_on: true,
      is_sleeping: false,
      happiness: 1,
      care_misses: 1,
    });
    const out = reduceAction(pet, "toggle_light").pet;
    expect(out.is_lights_on).toBe(true);
    expect(out.is_sleeping).toBe(false);
    expect(out.care_misses).toBe(2);
  });

  it("discipline aumenta disciplina e reduz felicidade", () => {
    const pet = petFresh({ discipline: 2, happiness: 4 });
    const out = reduceAction(pet, "discipline").pet;
    expect(out.discipline).toBe(3);
    expect(out.happiness).toBe(3);
  });

  it("attention aumenta felicidade e reduz care_misses", () => {
    const pet = petFresh({ happiness: 3, care_misses: 3 });
    const out = reduceAction(pet, "attention").pet;
    expect(out.happiness).toBe(4);
    expect(out.care_misses).toBe(2);
  });

  it("acção desconhecida não altera stats de jogo", () => {
    const pet = petFresh({
      hunger: 4,
      happiness: 4,
      weight: 10,
      poop_count: 1,
    });
    const out = reduceAction(pet, "unknown_action_xyz").pet;
    expect(out.hunger).toBe(pet.hunger);
    expect(out.happiness).toBe(pet.happiness);
    expect(out.weight).toBe(pet.weight);
    expect(out.poop_count).toBe(pet.poop_count);
  });

  it("feed_meal com fome máxima provoca vómito", () => {
    const pet = petFresh({
      hunger: 5,
      happiness: 4,
      poop_count: 0,
      is_sick: false,
    });
    const out = reduceAction(pet, "feed_meal").pet;
    expect(out.hunger).toBe(5);
    expect(out.poop_count).toBe(1);
    expect(out.is_sick).toBe(true);
    expect(out.happiness).toBe(3);
  });

  it("feed_snack com fome máxima só pune felicidade", () => {
    const pet = petFresh({ hunger: 5, happiness: 4 });
    const out = reduceAction(pet, "feed_snack").pet;
    expect(out.hunger).toBe(5);
    expect(out.happiness).toBe(3);
  });
});
