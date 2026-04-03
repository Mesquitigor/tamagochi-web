import { describe, it, expect } from "vitest";
import { evaluateNotificationTriggers } from "@/lib/game/notifications";
import { makePet } from "../factories/pet";

describe("evaluateNotificationTriggers", () => {
  it("devolve null se pet morto", () => {
    expect(
      evaluateNotificationTriggers(makePet({ is_alive: false }), null),
    ).toBeNull();
  });

  it("prioriza doente sobre fome", () => {
    const pet = makePet({
      is_alive: true,
      is_sick: true,
      hunger: 0,
      poop_count: 0,
    });
    const n = evaluateNotificationTriggers(pet, null);
    expect(n?.kind).toBe("sick");
    expect(n?.title).toContain("tamagotchi");
  });

  it("cocô antes de fome quando não doente", () => {
    const pet = makePet({
      is_sick: false,
      poop_count: 3,
      hunger: 0,
    });
    const n = evaluateNotificationTriggers(pet, null);
    expect(n?.kind).toBe("poop");
  });

  it("fome quando poop ok", () => {
    const pet = makePet({
      is_sick: false,
      poop_count: 0,
      hunger: 1,
      happiness: 5,
    });
    const n = evaluateNotificationTriggers(pet, null);
    expect(n?.kind).toBe("hungry");
  });

  it("tristeza quando fome ok", () => {
    const pet = makePet({
      is_sick: false,
      poop_count: 0,
      hunger: 5,
      happiness: 1,
    });
    const n = evaluateNotificationTriggers(pet, null);
    expect(n?.kind).toBe("sad");
  });

  it("evolução quando estágio mudou", () => {
    const prev = makePet({ stage: "baby" });
    const pet = makePet({ stage: "child", character_type: "child_cared" });
    const n = evaluateNotificationTriggers(pet, prev);
    expect(n?.kind).toBe("evolve");
  });

  it("sem alerta quando tudo ok", () => {
    const pet = makePet({
      is_sick: false,
      poop_count: 0,
      hunger: 5,
      happiness: 5,
      stage: "baby",
    });
    expect(evaluateNotificationTriggers(pet, makePet({ stage: "baby" }))).toBeNull();
  });

  it("sono com luz acesa: apagar luz (depois de tristeza)", () => {
    const pet = makePet({
      is_sick: false,
      poop_count: 0,
      hunger: 5,
      happiness: 5,
      is_sleeping: true,
      is_lights_on: true,
    });
    const n = evaluateNotificationTriggers(pet, null);
    expect(n?.kind).toBe("sleeping");
    expect(n?.title).toContain("dormir");
  });

  it("não avisa sono se luz já está apagada", () => {
    const pet = makePet({
      is_sleeping: true,
      is_lights_on: false,
      hunger: 5,
      happiness: 5,
    });
    expect(evaluateNotificationTriggers(pet, makePet({ stage: "baby" }))).toBeNull();
  });

  it("tristeza prioriza sobre sono com luz acesa", () => {
    const pet = makePet({
      happiness: 1,
      hunger: 5,
      is_sleeping: true,
      is_lights_on: true,
    });
    expect(evaluateNotificationTriggers(pet, null)?.kind).toBe("sad");
  });

  it("random_event quando opts.randomEventAlert e estado sem alerta mais urgente", () => {
    const pet = makePet({
      is_sick: false,
      poop_count: 1,
      hunger: 5,
      happiness: 5,
      is_sleeping: false,
      is_lights_on: true,
    });
    const n = evaluateNotificationTriggers(pet, makePet({ stage: "baby" }), {
      randomEventAlert: true,
    });
    expect(n?.kind).toBe("random_event");
  });

  it("doença continua a priorizar sobre randomEventAlert", () => {
    const pet = makePet({
      is_sick: true,
      poop_count: 0,
      hunger: 5,
      happiness: 5,
    });
    expect(
      evaluateNotificationTriggers(pet, null, { randomEventAlert: true })?.kind,
    ).toBe("sick");
  });
});
