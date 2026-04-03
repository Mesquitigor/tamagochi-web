import { describe, it, expect } from "vitest";
import {
  getCharacterDef,
  pickCharacterForStage,
  CHARACTERS,
  normalizeCharacterType,
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

  it("adulto com cuidado médio-baixo escolhe adult_neglected (ordem no pool)", () => {
    expect(pickCharacterForStage("adult" as PetStage, 2)).toBe(
      "adult_neglected",
    );
  });

  it("adulto com bons cuidados escolhe adult_cared", () => {
    expect(pickCharacterForStage("adult" as PetStage, 4)).toBe("adult_cared");
  });
});

describe("getCharacterDef", () => {
  it("resolve id conhecido", () => {
    const m = getCharacterDef("baby_cared");
    expect(m.id).toBe("baby_cared");
  });

  it("aceita id legado gravado na BD", () => {
    expect(getCharacterDef("marutchi").id).toBe("baby_cared");
  });

  it("fallback para id inexistente", () => {
    const f = getCharacterDef("no_such_character_999");
    expect(f).toEqual(CHARACTERS[1]);
  });
});

describe("normalizeCharacterType", () => {
  it("mapeia nomes antigos", () => {
    expect(normalizeCharacterType("mimitchi")).toBe("adult_cared");
    expect(normalizeCharacterType("baby_cared")).toBe("baby_cared");
  });
});
