"use client";

import { useCallback, useEffect, useState } from "react";
import type { PetAction } from "@/types/pet";
import type { PetRow } from "@/types/pet";

export type PetUpdatePatch = {
  name?: string;
  sex?: "male" | "female";
  color_theme?: string | null;
};

export function usePet() {
  const [pet, setPet] = useState<PetRow | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setError(null);
    const r = await fetch("/api/pets");
    if (r.status === 401) {
      setLoading(false);
      setPet(null);
      if (typeof window !== "undefined") {
        const next = encodeURIComponent(
          `${window.location.pathname}${window.location.search}`,
        );
        window.location.assign(`/login?next=${next}`);
      }
      return;
    }
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

  const updatePet = useCallback(async (patch: PetUpdatePatch) => {
    const r = await fetch("/api/pets", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(patch),
    });
    const j = (await r.json()) as { pet?: PetRow; error?: string };
    if (!r.ok) throw new Error(j.error ?? "Atualização inválida");
    setPet(j.pet!);
  }, []);

  const rename = useCallback(
    async (name: string) => updatePet({ name }),
    [updatePet],
  );

  const resetPet = useCallback(async () => {
    const r = await fetch("/api/pets/reset", { method: "POST" });
    const j = (await r.json()) as { pet?: PetRow; error?: string };
    if (!r.ok) throw new Error(j.error ?? "Reset falhou");
    setPet(j.pet as PetRow);
  }, []);

  const saveNickname = useCallback(async (nickname: string) => {
    const r = await fetch("/api/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nickname }),
    });
    const j = (await r.json()) as { error?: string };
    if (!r.ok) throw new Error(j.error ?? "Erro ao guardar apelido");
  }, []);

  return {
    pet,
    loading,
    error,
    refresh,
    doAction,
    updatePet,
    rename,
    resetPet,
    saveNickname,
  };
}
