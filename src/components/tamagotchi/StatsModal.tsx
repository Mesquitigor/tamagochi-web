"use client";

import type { PetRow } from "@/types/pet";
import { Modal } from "@/components/ui/Modal";
import { Hearts } from "@/components/ui/Hearts";
import { getCharacterDef } from "@/lib/game/characters";

export function StatsModal({
  open,
  onClose,
  pet,
}: {
  open: boolean;
  onClose: () => void;
  pet: PetRow;
}) {
  const ch = getCharacterDef(pet.character_type);
  const sexLabel =
    pet.sex === "male"
      ? "Macho"
      : pet.sex === "female"
        ? "Fêmea"
        : "—";
  return (
    <Modal open={open} onClose={onClose} title={`${pet.name} · ${ch.label}`}>
      <div className="space-y-2 rounded-2xl bg-white/70 p-3">
        <p className="text-sm text-pink-900/85">
          Sexo: <span className="font-medium">{sexLabel}</span>
        </p>
        <Hearts value={pet.hunger} label="Fome" />
        <Hearts value={pet.happiness} label="Felicidade" />
        <Hearts value={pet.discipline} label="Disciplina" />
        <p className="pt-2 text-sm text-pink-900/80">
          Peso: {pet.weight}g · Estágio: {pet.stage} · Cocô: {pet.poop_count}
        </p>
        {pet.is_sick && (
          <p className="text-sm font-medium text-violet-700">
            O teu tamagotchi está doente — dá remédio!
          </p>
        )}
      </div>
    </Modal>
  );
}
