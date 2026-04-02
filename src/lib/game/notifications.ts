import type { PetRow } from "@/types/pet";

export type NotificationKind =
  | "hungry"
  | "sad"
  | "poop"
  | "sick"
  | "sleeping"
  | "evolve"
  | "random_event";

export type NotificationOptions = {
  /** Efeito negativo do evento horário do motor (push só se não houver alerta mais urgente). */
  randomEventAlert?: boolean;
};

export function evaluateNotificationTriggers(
  pet: PetRow,
  prev?: PetRow | null,
  opts?: NotificationOptions,
): { kind: NotificationKind; title: string; body: string } | null {
  if (!pet.is_alive) return null;

  if (pet.is_sick) {
    return {
      kind: "sick",
      title: "Seu tamagotchi está precisando de você!",
      body: `${pet.name} não está bem. Hora do remédio!`,
    };
  }
  if (pet.poop_count >= 2) {
    return {
      kind: "poop",
      title: "Hora de limpar!",
      body: `Seu tamagotchi (${pet.name}) precisa que você limpe a área.`,
    };
  }
  if (pet.hunger <= 1) {
    return {
      kind: "hungry",
      title: "Fome!",
      body: `Seu tamagotchi está com fome. Alimente ${pet.name}!`,
    };
  }
  if (pet.happiness <= 1) {
    return {
      kind: "sad",
      title: "Quer carinho!",
      body: `Seu tamagotchi está triste — brinque um pouco com ${pet.name}.`,
    };
  }
  if (opts?.randomEventAlert) {
    return {
      kind: "random_event",
      title: "Algo aconteceu!",
      body: `Dê uma olhada em ${pet.name} — o dia surpreendeu um pouco.`,
    };
  }
  if (pet.is_sleeping && pet.is_lights_on) {
    return {
      kind: "sleeping",
      title: "Hora de dormir!",
      body: `${pet.name} adormeceu — apague a luz para descansar melhor.`,
    };
  }

  if (
    prev &&
    prev.stage !== pet.stage &&
    pet.stage !== "egg" &&
    pet.stage !== prev.stage
  ) {
    return {
      kind: "evolve",
      title: "Evoluiu!",
      body: `Seu tamagotchi ${pet.name} cresceu: ${pet.stage}!`,
    };
  }

  return null;
}
