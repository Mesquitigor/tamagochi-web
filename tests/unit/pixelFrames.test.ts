import { describe, it, expect } from "vitest";
import { framesFor } from "@/lib/pixelFrames";
import type { PetAnimationState } from "@/types/pet";

const states: PetAnimationState[] = [
  "idle",
  "eating",
  "walking",
  "sleeping",
  "happy",
  "sad",
  "scolded",
  "sick",
  "pooping",
  "death",
  "hatching",
];

describe("pixelFrames", () => {
  it("cada estado tem grelha 16x16 por frame", () => {
    for (const s of states) {
      const frames = framesFor[s];
      expect(frames.length).toBeGreaterThan(0);
      for (const grid of frames) {
        expect(grid).toHaveLength(16);
        for (const row of grid) {
          expect(row.length).toBe(16);
        }
      }
    }
  });
});
