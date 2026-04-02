import type { PetRow } from "@/types/pet";
import type { PetStage } from "@/types/pet";
import {
  CARE_SPEED_BONUS,
  CARE_SPEED_PENALTY,
  EGG_HATCH_MS,
  HAPPINESS_DECAY_MS_PER_HEART,
  HUNGER_DECAY_MS_PER_HEART,
  MAX_CARE_MISSES,
  MAX_POOP,
  POOP_HOURS_PER_STACK,
  RANDOM_EVENT_INTERVAL_MS,
  SLEEP_DECAY_MULTIPLIER,
  SNACK_WEIGHT,
  MEAL_WEIGHT,
  PLAY_WEIGHT_LOSS,
  STAGE_MS,
  STARVATION_DEATH_MS,
} from "./constants";
import { pickCharacterForStage } from "./characters";

function clamp(n: number, lo: number, hi: number) {
  return Math.max(lo, Math.min(hi, n));
}

function msSince(iso: string, now: number) {
  return Math.max(0, now - new Date(iso).getTime());
}

export function computeCareScore(pet: PetRow): number {
  return Math.round((pet.hunger + pet.happiness) / 2);
}

function careStageFactor(care: number): number {
  if (care >= 4) return CARE_SPEED_BONUS;
  if (care <= 1) return CARE_SPEED_PENALTY;
  return 1;
}

export type ApplyDecayResult = {
  pet: PetRow;
  /** Para notificação: evento horário com efeito negativo visível (cocô, pior stats, etc.). */
  randomEventAlert: boolean;
};

function applyRandomEvent(pet: PetRow, nowMs: number): {
  pet: PetRow;
  hadNegativeEffect: boolean;
} {
  const r = Math.random();
  let hunger = pet.hunger;
  let happiness = pet.happiness;
  let poop_count = pet.poop_count;
  let is_sick = pet.is_sick;
  let negative = false;

  if (r < 0.35) {
    hunger = clamp(hunger - 1, 0, 5);
    if (hunger <= 1) negative = true;
  } else if (r < 0.55) {
    happiness = clamp(happiness - 1, 0, 5);
    if (happiness <= 1) negative = true;
  } else if (r < 0.75) {
    if (poop_count < MAX_POOP) {
      poop_count += 1;
      negative = true;
    }
  } else if (r < 0.85) {
    if (poop_count >= 1) {
      is_sick = true;
      negative = true;
    }
  }

  if (poop_count >= 2) is_sick = true;

  return {
    pet: {
      ...pet,
      hunger,
      happiness,
      poop_count,
      is_sick,
      last_event_at: new Date(nowMs).toISOString(),
    },
    hadNegativeEffect: negative,
  };
}

function applyRandomEventIfDue(
  pet: PetRow,
  nowMs: number,
): { pet: PetRow; randomEventAlert: boolean } {
  if (msSince(pet.last_event_at, nowMs) < RANDOM_EVENT_INTERVAL_MS) {
    return { pet, randomEventAlert: false };
  }
  const { pet: after, hadNegativeEffect } = applyRandomEvent(pet, nowMs);
  return { pet: after, randomEventAlert: hadNegativeEffect };
}

export function applyDecay(pet: PetRow, nowMs: number): ApplyDecayResult {
  if (!pet.is_alive) return { pet, randomEventAlert: false };

  let working = applyAge(pet, nowMs);
  const rand = applyRandomEventIfDue(working, nowMs);
  working = rand.pet;
  const randomEventAlert = rand.randomEventAlert;

  const decayMult =
    working.is_sleeping && !working.is_lights_on
      ? SLEEP_DECAY_MULTIPLIER
      : 1;

  const elapsed = msSince(working.last_decay_at, nowMs);
  if (elapsed < 60_000) return { pet: working, randomEventAlert };

  const hungerDrop = Math.floor(
    elapsed / (HUNGER_DECAY_MS_PER_HEART / decayMult),
  );
  const happyDrop = Math.floor(
    elapsed / (HAPPINESS_DECAY_MS_PER_HEART / decayMult),
  );

  let hunger = working.hunger - hungerDrop;
  let happiness = working.happiness - happyDrop;
  const poopAdd = Math.floor(
    elapsed / ((POOP_HOURS_PER_STACK * 60 * 60_000) / decayMult),
  );
  const poop_count = clamp(working.poop_count + poopAdd, 0, MAX_POOP);

  let is_sick = working.is_sick;
  if (poop_count >= 2) is_sick = true;

  let care_misses = working.care_misses;
  if (poop_count >= MAX_POOP && is_sick) {
    care_misses = clamp(care_misses + 1, 0, 999);
  }

  if (hunger <= 0 && happiness <= 0) {
    const bad = msSince(working.last_interaction_at, nowMs);
    if (bad > STARVATION_DEATH_MS) {
      return {
        pet: {
          ...working,
          is_alive: false,
          hunger: 0,
          happiness: 0,
          care_misses,
          poop_count,
          is_sick,
          last_decay_at: new Date(nowMs).toISOString(),
        },
        randomEventAlert,
      };
    }
  }
  if (
    care_misses >= MAX_CARE_MISSES &&
    hunger <= 1 &&
    happiness <= 1
  ) {
    return {
      pet: {
        ...working,
        is_alive: false,
        hunger: 0,
        happiness: 0,
        care_misses,
        poop_count,
        is_sick,
        last_decay_at: new Date(nowMs).toISOString(),
      },
      randomEventAlert,
    };
  }

  hunger = clamp(hunger, 0, 5);
  happiness = clamp(happiness, 0, 5);

  return {
    pet: {
      ...working,
      hunger,
      happiness,
      poop_count,
      is_sick,
      care_misses,
      last_decay_at: new Date(nowMs).toISOString(),
    },
    randomEventAlert,
  };
}

function applyAge(pet: PetRow, nowMs: number): PetRow {
  const born = new Date(pet.born_at).getTime();
  const age_minutes = Math.floor((nowMs - born) / 60_000);
  let stage = pet.stage as PetStage;
  let character_type = pet.character_type;
  const care = computeCareScore(pet);
  const f = careStageFactor(care);

  const hatch = EGG_HATCH_MS;
  const tBabyEnd = hatch + STAGE_MS.baby * f;
  const tChildEnd = tBabyEnd + STAGE_MS.child * f;
  const tTeenEnd = tChildEnd + STAGE_MS.teen * f;
  const live = nowMs - born;

  if (stage === "egg") {
    if (live >= hatch) {
      stage = "baby";
      character_type = pickCharacterForStage("baby", care);
    }
  } else if (stage === "baby") {
    if (live >= tBabyEnd) {
      stage = "child";
      character_type = pickCharacterForStage("child", care);
    }
  } else if (stage === "child") {
    if (live >= tChildEnd) {
      stage = "teen";
      character_type = pickCharacterForStage("teen", care);
    }
  } else if (stage === "teen") {
    if (live >= tTeenEnd) {
      stage = "adult";
      character_type = pickCharacterForStage("adult", care);
    }
  }

  return {
    ...pet,
    age_minutes,
    stage,
    character_type,
  };
}

export function reduceAction(
  pet: PetRow,
  action: string,
  playGuessCorrect?: boolean,
): ApplyDecayResult {
  const now = new Date().toISOString();
  const next: PetRow = {
    ...pet,
    last_interaction_at: now,
    last_decay_at: now,
  };

  switch (action) {
    case "feed_meal":
      if (pet.hunger >= 5) {
        next.poop_count = clamp(next.poop_count + 1, 0, MAX_POOP);
        next.is_sick = true;
        next.happiness = clamp(next.happiness - 1, 0, 5);
        if (next.poop_count >= 2) next.is_sick = true;
      } else {
        next.hunger = clamp(next.hunger + 2, 0, 5);
        next.weight = clamp(next.weight + MEAL_WEIGHT, 1, 99);
        next.poop_count = clamp(next.poop_count + 1, 0, MAX_POOP);
        if (next.poop_count >= 2) next.is_sick = true;
      }
      break;
    case "feed_snack":
      if (pet.hunger >= 5) {
        next.happiness = clamp(next.happiness - 1, 0, 5);
      } else {
        next.hunger = clamp(next.hunger + 1, 0, 5);
        next.happiness = clamp(next.happiness + 1, 0, 5);
        next.weight = clamp(next.weight + SNACK_WEIGHT, 1, 99);
      }
      break;
    case "play": {
      const win =
        playGuessCorrect === undefined ? Math.random() > 0.35 : playGuessCorrect;
      if (win) {
        next.happiness = clamp(next.happiness + 1, 0, 5);
        next.weight = clamp(next.weight - PLAY_WEIGHT_LOSS, 1, 99);
      } else {
        next.happiness = clamp(next.happiness - 1, 0, 5);
      }
      if (pet.hunger <= 1) {
        next.hunger = clamp(next.hunger - 1, 0, 5);
      }
      break;
    }
    case "clean":
      next.poop_count = 0;
      if (next.is_sick && next.hunger >= 2 && next.happiness >= 2) {
        next.is_sick = false;
      }
      break;
    case "medicine":
      if (pet.is_sick) {
        next.is_sick = false;
        next.hunger = clamp(next.hunger + 1, 0, 5);
      } else {
        next.happiness = clamp(next.happiness - 1, 0, 5);
      }
      break;
    case "toggle_light":
      if (pet.is_lights_on && pet.happiness <= 1) {
        next.care_misses = clamp(next.care_misses + 1, 0, 999);
      } else {
        next.is_lights_on = !next.is_lights_on;
        next.is_sleeping = !next.is_lights_on;
      }
      break;
    case "discipline":
      next.discipline = clamp(next.discipline + 1, 0, 5);
      next.happiness = clamp(next.happiness - 1, 0, 5);
      break;
    case "attention":
      next.happiness = clamp(next.happiness + 1, 0, 5);
      next.care_misses = clamp(next.care_misses - 1, 0, 999);
      break;
    default:
      break;
  }

  return applyDecay(next, Date.now());
}
