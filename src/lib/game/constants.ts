import type { PetStage } from "@/types/pet";

/** Stage lengths (ms). Short for a satisfying mobile web loop; raise for slower life cycles. */
export const EGG_HATCH_MS = 60_000;
export const STAGE_MS: Record<Exclude<PetStage, "egg" | "adult">, number> = {
  baby: 5 * 60_000,
  child: 10 * 60_000,
  teen: 10 * 60_000,
};

export const HUNGER_DECAY_MS_PER_HEART = 60 * 60_000;
export const HAPPINESS_DECAY_MS_PER_HEART = 90 * 60_000;
export const SLEEP_DECAY_MULTIPLIER = 0.45;

export const POOP_HOURS_PER_STACK = 2.5;
export const MAX_POOP = 4;

export const STARVATION_DEATH_MS = 45 * 60_000;
export const MAX_CARE_MISSES = 12;

export const SNACK_WEIGHT = 2;
export const MEAL_WEIGHT = 1;
export const PLAY_WEIGHT_LOSS = 1;

/** Intervalo mínimo entre eventos aleatórios no decaimento (ms). */
export const RANDOM_EVENT_INTERVAL_MS = 60 * 60_000;
/** Com cuidado alto (careScore ≥ 4), fases pós-ovo decorrem mais depressa. */
export const CARE_SPEED_BONUS = 0.8;
/** Com cuidado baixo (careScore ≤ 1), fases pós-ovo decorrem mais devagar. */
export const CARE_SPEED_PENALTY = 1.25;
/** Reservado para futuras regras de sobrealimentação por peso (não usado no motor atual). */
export const OVERFEED_SICK_WEIGHT_THRESHOLD = 3;
