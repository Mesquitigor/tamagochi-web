"use client";

import { useCallback, useEffect, useState } from "react";
import type { PetAction } from "@/types/pet";
import type { PetRow } from "@/types/pet";

export function usePet() {
  const [pet, setPet] = useState<PetRow | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setError(null);
    const r = await fetch("/api/pets");
    if (!r.ok) {
      setError((await r.json().catch(() => ({})))?.error ?? "Erro ao carregar");
      setLoading(false);
      return;
    }
    const j = (await r.json()) as { pet: PetRow };
    setPet(j.pet);
    setLoading(false);
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- initial pet fetch
    void refresh();
  }, [refresh]);

  const doAction = useCallback(async (action: PetAction, playGuess?: boolean) => {
    const r = await fetch("/api/pets/action", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action, playGuess }),
    });
    const j = (await r.json().catch(() => ({}))) as {
      pet?: PetRow;
      error?: string;
    };
    if (!r.ok) throw new Error(j.error ?? "Ação falhou");
    setPet(j.pet!);
    return j.pet!;
  }, []);

  const rename = useCallback(async (name: string) => {
    const r = await fetch("/api/pets", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name }),
    });
    const j = (await r.json()) as { pet?: PetRow; error?: string };
    if (!r.ok) throw new Error(j.error ?? "Nome inválido");
    setPet(j.pet!);
  }, []);

  const resetPet = useCallback(async () => {
    const r = await fetch("/api/pets/reset", { method: "POST" });
    const j = (await r.json()) as { pet?: PetRow; error?: string };
    if (!r.ok) throw new Error(j.error ?? "Reset falhou");
    setPet(j.pet as PetRow);
  }, []);

  return { pet, loading, error, refresh, doAction, rename, resetPet };
}
