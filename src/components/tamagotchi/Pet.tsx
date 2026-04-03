"use client";

import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import type { PetAnimationState } from "@/types/pet";
import { framesFor } from "@/lib/pixelFrames";
import { getCharacterDef } from "@/lib/game/characters";

const CELL = 5;

/** Um só sprite no idle — a “respiração” é no motion.div (evita piscar de pixels). */
const eggIdleFrames = [framesFor.hatching[0]] as const;

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
  const palette = def.colors;
  const frames = useMemo(() => {
    if (characterId === "egg" && animation !== "hatching" && animation !== "death")
      return eggIdleFrames as unknown as readonly (readonly string[])[];
    const f = framesFor[animation] ?? framesFor.idle;
    return f;
  }, [animation, characterId]);
  const [i, setI] = useState(0);

  useEffect(() => {
    const ms =
      animation === "idle" || animation === "sleeping"
        ? 520
        : animation === "scolded"
          ? 220
          : 280;
    const t = setInterval(() => setI((v) => (v + 1) % frames.length), ms);
    return () => clearInterval(t);
  }, [animation, frames.length]);

  const grid = frames[i] ?? frames[0];
  const isEgg = characterId === "egg";
  const eggSoftIdle =
    isEgg && (animation === "idle" || animation === "sleeping");

  return (
    <div className={`relative flex items-center justify-center ${className}`}>
      <motion.div
        animate={
          animation === "scolded"
            ? {
                x: [0, -3, 3, -2.5, 2.5, -2, 2, 0],
                y: 0,
                scaleX: 1,
                scaleY: 1,
              }
            : eggSoftIdle
              ? {
                  x: 0,
                  y: [0, -1, 0],
                  scaleY: [1, 1.04, 1],
                  scaleX: [1, 0.988, 1],
                }
              : { x: 0, y: 0, scaleX: 1, scaleY: 1 }
        }
        transition={
          animation === "scolded"
            ? {
                duration: 0.42,
                repeat: Infinity,
                ease: "easeInOut",
              }
            : eggSoftIdle
              ? {
                  duration: 2.6,
                  repeat: Infinity,
                  ease: "easeInOut",
                }
              : { duration: 0.2 }
        }
      >
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
                  : colorFor(ch, palette.body, palette.accent, palette.eye);
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
                      ? "inset 0 0 0 1px rgba(0,0,0,.08)"
                      : undefined,
                  }}
                />
              );
            }),
          )}
        </div>
      </motion.div>
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
        {animation === "scolded" && (
          <motion.span
            key="scold-mark"
            initial={{ opacity: 0, y: 8, scale: 0.4, rotate: -12 }}
            animate={{ opacity: 1, y: -10, scale: 1, rotate: 0 }}
            exit={{ opacity: 0, scale: 0.6 }}
            transition={{ type: "spring", stiffness: 420, damping: 24 }}
            className="pointer-events-none absolute -right-0.5 -top-1 text-lg font-black leading-none text-amber-800 drop-shadow-[0_1px_0_rgba(0,0,0,0.15)]"
          >
            !
          </motion.span>
        )}
      </AnimatePresence>
    </div>
  );
}

