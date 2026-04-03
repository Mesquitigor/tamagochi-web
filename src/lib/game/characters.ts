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

/** IDs antigos (réplica Tamagotchi) → IDs neutros. Usado ao ler linhas já gravadas. */
const LEGACY_CHARACTER_IDS: Record<string, string> = {
  marutchi: "baby_cared",
  kinakomotchi: "baby_neglected",
  tamatchi: "child_cared",
  hashitamatchi: "child_neglected",
  mametchi: "teen_cared",
  kuchipatchi: "teen_neglected",
  mimitchi: "adult_cared",
  tarakotchi: "adult_neglected",
  billotchi: "adult_balanced",
};

export function normalizeCharacterType(id: string): string {
  return LEGACY_CHARACTER_IDS[id] ?? id;
}

/** Care score approximated as avg(hunger, happiness) over stage — engine maps to character. */
export const CHARACTERS: CharacterDef[] = [
  {
    id: "egg",
    label: "Ovo",
    stage: "egg",
    minCare: 0,
    maxCare: 5,
    colors: {
      body: "#fff8ef",
      accent: "#8f6a3d",
      eye: "#333",
    },
  },
  {
    id: "baby_cared",
    label: "Bebé bem cuidado",
    stage: "baby",
    minCare: 3,
    maxCare: 5,
    colors: { body: "#f5ebe0", accent: "#b45309", eye: "#2d1b2e" },
  },
  {
    id: "baby_neglected",
    label: "Bebé mal cuidado",
    stage: "baby",
    minCare: 0,
    maxCare: 2,
    colors: { body: "#e8d4ff", accent: "#b388ff", eye: "#2d1b2e" },
  },
  {
    id: "child_cared",
    label: "Criança bem cuidada",
    stage: "child",
    minCare: 3,
    maxCare: 5,
    colors: { body: "#fff3c4", accent: "#ffc857", eye: "#1a1a1a" },
  },
  {
    id: "child_neglected",
    label: "Criança mal cuidada",
    stage: "child",
    minCare: 0,
    maxCare: 2,
    colors: { body: "#c4ffd4", accent: "#4caf50", eye: "#1a1a1a" },
  },
  {
    id: "teen_cared",
    label: "Jovem bem cuidado",
    stage: "teen",
    minCare: 3,
    maxCare: 5,
    colors: { body: "#f0e8de", accent: "#92400e", eye: "#1a1a1a" },
  },
  {
    id: "teen_neglected",
    label: "Jovem mal cuidado",
    stage: "teen",
    minCare: 0,
    maxCare: 2,
    colors: { body: "#d6d3d1", accent: "#57534e", eye: "#1a1a1a" },
  },
  {
    id: "adult_cared",
    label: "Adulto bem cuidado",
    stage: "adult",
    minCare: 3,
    maxCare: 5,
    colors: { body: "#faf3ea", accent: "#a16207", eye: "#1a1a1a" },
  },
  {
    id: "adult_neglected",
    label: "Adulto mal cuidado",
    stage: "adult",
    minCare: 0,
    maxCare: 2,
    colors: { body: "#d6d3d1", accent: "#44403c", eye: "#1a1a1a" },
  },
  {
    id: "adult_balanced",
    label: "Adulto equilibrado",
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
  if (!pool.length) return "baby_cared";
  const match = pool.find(
    (c) => careScore >= c.minCare && careScore <= c.maxCare,
  );
  return match?.id ?? pool[0].id;
}

export function getCharacterDef(id: string): CharacterDef {
  const normalized = normalizeCharacterType(id);
  return CHARACTERS.find((c) => c.id === normalized) ?? CHARACTERS[1];
}
