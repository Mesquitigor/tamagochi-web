export type PetStage = "egg" | "baby" | "child" | "teen" | "adult";

export type PetAnimationState =
  | "idle"
  | "eating"
  | "walking"
  | "sleeping"
  | "happy"
  | "sad"
  | "sick"
  | "pooping"
  | "death"
  | "hatching";

export type PetAction =
  | "feed_meal"
  | "feed_snack"
  | "play"
  | "clean"
  | "medicine"
  | "toggle_light"
  | "discipline"
  | "attention";

export interface PetRow {
  id: string;
  user_id: string;
  name: string;
  stage: string;
  character_type: string;
  hunger: number;
  happiness: number;
  discipline: number;
  weight: number;
  age_minutes: number;
  is_alive: boolean;
  is_sick: boolean;
  is_sleeping: boolean;
  is_lights_on: boolean;
  poop_count: number;
  care_misses: number;
  last_interaction_at: string;
  last_decay_at: string;
  /** Último instante em que correu (ou foi saltado) o evento aleatório horário no motor. */
  last_event_at: string;
  born_at: string;
  created_at: string;
}
