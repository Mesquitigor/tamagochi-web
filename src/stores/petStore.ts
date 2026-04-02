import { create } from "zustand";
import type { PetRow } from "@/types/pet";

/** Optional global snapshot for devtools / future realtime sync */
export const usePetStore = create<{
  last: PetRow | null;
  setLast: (p: PetRow | null) => void;
}>((set) => ({
  last: null,
  setLast: (last) => set({ last }),
}));
