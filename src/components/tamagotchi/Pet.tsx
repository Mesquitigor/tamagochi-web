"use client";

import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import type { PetAnimationState } from "@/types/pet";
import { framesFor } from "@/lib/pixelFrames";
import { getCharacterDef } from "@/lib/game/characters";

const CELL = 5;

const eggFrames = [framesFor.hatching[0], framesFor.hatching[1]] as const;

function colorFor(
  c: string,
  body: string,
  accent: string,
  eye: string,
): string {
  switch (c) {
    case "B":
      return body;
    case "A":
      return accent;
    case "E":
      return eye;
    case "M":
      return "#5c3d4a";
    case "W":
      return "#fff";
    case "Z":
      return "#6b9080";
    case "X":
      return "#8b5cf6";
    default:
      return "transparent";
  }
}

export function Pet({
  characterId,
  animation,
  className = "",
}: {
  characterId: string;
  animation: PetAnimationState;
  className?: string;
}) {
  const def = useMemo(() => getCharacterDef(characterId), [characterId]);
  const frames = useMemo(() => {
    if (characterId === "egg" && animation !== "hatching" && animation !== "death")
      return eggFrames as unknown as readonly (readonly string[])[];
    const f = framesFor[animation] ?? framesFor.idle;
    return f;
  }, [animation, characterId]);
  const [i, setI] = useState(0);

  useEffect(() => {
    const ms = animation === "idle" || animation === "sleeping" ? 520 : 280;
    const t = setInterval(() => setI((v) => (v + 1) % frames.length), ms);
    return () => clearInterval(t);
  }, [animation, frames.length]);

  const grid = frames[i] ?? frames[0];
  const isEgg = characterId === "egg";

  return (
    <div className={`relative flex items-center justify-center ${className}`}>
      <div
        className="grid gap-0 rounded-sm p-1"
        style={{
          gridTemplateColumns: `repeat(16, ${CELL}px)`,
        }}
      >
        {grid.flatMap((row, y) =>
          row.split("").map((ch, x) => {
            const bg =
              ch === " "
                ? "transparent"
                : colorFor(
                    ch,
                    def.colors.body,
                    def.colors.accent,
                    def.colors.eye,
                  );
            return (
              <div
                key={`${y}-${x}`}
                className="rounded-[0.5px]"
                style={{
                  width: CELL,
                  height: CELL,
                  backgroundColor: bg,
                  boxShadow:
                    ch !== " " && isEgg
                      ? `inset 0 0 0 1px rgba(0,0,0,.06)`
                      : undefined,
                }}
              />
            );
          }),
        )}
      </div>
      <AnimatePresence>
        {animation === "happy" && (
          <motion.span
            key="spark"
            initial={{ opacity: 0, y: 6, scale: 0.5 }}
            animate={{ opacity: 1, y: -8, scale: 1 }}
            exit={{ opacity: 0 }}
            className="pointer-events-none absolute -right-1 -top-1 text-lg"
          >
            ✨
          </motion.span>
        )}
      </AnimatePresence>
    </div>
  );
}

