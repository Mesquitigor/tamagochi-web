import { describe, it, expect } from "vitest";
import {
  getCharacterDef,
  pickCharacterForStage,
  CHARACTERS,
} from "@/lib/game/characters";
import type { PetStage } from "@/types/pet";

describe("pickCharacterForStage", () => {
  it("ovo devolve egg", () => {
    expect(pickCharacterForStage("egg", 0)).toBe("egg");
  });

  it("bebé com bom cuidado escolhe personagem high-care", () => {
    const id = pickCharacterForStage("baby", 5);
    const def = CHARACTERS.find((c) => c.id === id && c.stage === "baby");
    expect(def).toBeDefined();
    expect(def!.minCare).toBeGreaterThanOrEqual(3);
  });

  it("bebé com baixo cuidado escolhe personagem low-care", () => {
    const id = pickCharacterForStage("baby", 0);
    const def = CHARACTERS.find((c) => c.id === id && c.stage === "baby");
    expect(def).toBeDefined();
    expect(def!.maxCare).toBeLessThanOrEqual(2);
  });

  it("adulto com cuidado médio pode ser billotchi", () => {
    const id = pickCharacterForStage("adult" as PetStage, 2);
    expect(id).toBeTruthy();
  });
});

describe("getCharacterDef", () => {
  it("resolve id conhecido", () => {
    const m = getCharacterDef("marutchi");
    expect(m.id).toBe("marutchi");
  });

  it("fallback para id inexistente", () => {
    const f = getCharacterDef("no_such_character_999");
    expect(f).toEqual(CHARACTERS[1]);
  });
});
