import type { PetStage } from "@/types/pet";

export interface CharacterDef {
  id: string;
  label: string;
  stage: PetStage;
  /** 0 = neglected look, 4 = angel care */
  minCare: number;
  maxCare: number;
  /** Pixel pet palette (body, accent, eye) */
  colors: { body: string; accent: string; eye: string };
}

/** Care score approximated as avg(hunger, happiness) over stage — engine maps to character. */
export const CHARACTERS: CharacterDef[] = [
  {
    id: "egg",
    label: "Ovo",
    stage: "egg",
    minCare: 0,
    maxCare: 5,
    colors: { body: "#f5e6d3", accent: "#c4a574", eye: "#333" },
  },
  {
    id: "marutchi",
    label: "Marutchi",
    stage: "baby",
    minCare: 3,
    maxCare: 5,
    colors: { body: "#ffd4e0", accent: "#ff8fb8", eye: "#2d1b2e" },
  },
  {
    id: "kinakomotchi",
    label: "Kinakomotchi",
    stage: "baby",
    minCare: 0,
    maxCare: 2,
    colors: { body: "#e8d4ff", accent: "#b388ff", eye: "#2d1b2e" },
  },
  {
    id: "tamatchi",
    label: "Tamatchi",
    stage: "child",
    minCare: 3,
    maxCare: 5,
    colors: { body: "#fff3c4", accent: "#ffc857", eye: "#1a1a1a" },
  },
  {
    id: "hashitamatchi",
    label: "Hashitamatchi",
    stage: "child",
    minCare: 0,
    maxCare: 2,
    colors: { body: "#c4ffd4", accent: "#4caf50", eye: "#1a1a1a" },
  },
  {
    id: "mametchi",
    label: "Mametchi",
    stage: "teen",
    minCare: 3,
    maxCare: 5,
    colors: { body: "#ffe0ef", accent: "#ff6b9d", eye: "#1a1a1a" },
  },
  {
    id: "kuchipatchi",
    label: "Kuchipatchi",
    stage: "teen",
    minCare: 0,
    maxCare: 2,
    colors: { body: "#b8e0ff", accent: "#4a9eff", eye: "#1a1a1a" },
  },
  {
    id: "mimitchi",
    label: "Mimitchi",
    stage: "adult",
    minCare: 3,
    maxCare: 5,
    colors: { body: "#fff0f6", accent: "#ffbbd0", eye: "#1a1a1a" },
  },
  {
    id: "tarakotchi",
    label: "Tarakotchi",
    stage: "adult",
    minCare: 0,
    maxCare: 2,
    colors: { body: "#e0e7ff", accent: "#7c83ff", eye: "#1a1a1a" },
  },
  {
    id: "billotchi",
    label: "Bill",
    stage: "adult",
    minCare: 2,
    maxCare: 3,
    colors: { body: "#d4f4f0", accent: "#2dd4bf", eye: "#1a1a1a" },
  },
];

export function pickCharacterForStage(
  stage: PetStage,
  careScore: number,
): string {
  if (stage === "egg") return "egg";
  const pool = CHARACTERS.filter((c) => c.stage === stage);
  if (!pool.length) return "marutchi";
  const match = pool.find(
    (c) => careScore >= c.minCare && careScore <= c.maxCare,
  );
  return match?.id ?? pool[0].id;
}

export function getCharacterDef(id: string): CharacterDef {
  return CHARACTERS.find((c) => c.id === id) ?? CHARACTERS[1];
}
