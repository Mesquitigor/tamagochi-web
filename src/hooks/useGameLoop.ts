"use client";

import { useEffect } from "react";

export function useGameLoop(onTick: () => void, ms = 45_000) {
  useEffect(() => {
    const id = setInterval(() => onTick(), ms);
    return () => clearInterval(id);
  }, [onTick, ms]);
}
