import { describe, expect, it } from "vitest";
import {
  lcdBottomIcons,
  lcdMenuOrder,
  lcdTopIcons,
} from "@/components/tamagotchi/IconBar";

describe("lcdMenuOrder (botão A no hardware)", () => {
  it("tem 8 ícones únicos alinhados com topo + base", () => {
    const topIds = lcdTopIcons.map((i) => i.id);
    const bottomIds = lcdBottomIcons.map((i) => i.id);
    expect(lcdMenuOrder).toEqual([...topIds, ...bottomIds]);
    expect(new Set(lcdMenuOrder).size).toBe(8);
  });

  it("fila superior segue ordem clássica comida → luz → jogo → remédio", () => {
    expect(lcdTopIcons.map((i) => i.id)).toEqual([
      "feed",
      "light",
      "play",
      "medicine",
    ]);
  });

  it("fila inferior: banho → estado → bronca → carinho", () => {
    expect(lcdBottomIcons.map((i) => i.id)).toEqual([
      "bath",
      "status",
      "discipline",
      "attention",
    ]);
  });
});
