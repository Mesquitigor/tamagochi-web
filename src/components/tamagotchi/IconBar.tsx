"use client";

import type { LucideIcon } from "lucide-react";
import {
  Activity,
  Ban,
  Bath,
  Gamepad2,
  HeartPulse,
  Moon,
  Smile,
  Utensils,
} from "lucide-react";

export type IconId =
  | "status"
  | "feed"
  | "light"
  | "play"
  | "medicine"
  | "bath"
  | "discipline"
  | "attention";

/** Ordem tipo Tamagotchi clássico: fila superior dentro do LCD. */
export const lcdTopIcons: { id: IconId; Icon: LucideIcon; label: string }[] = [
  { id: "feed", Icon: Utensils, label: "Comida" },
  { id: "light", Icon: Moon, label: "Luz" },
  { id: "play", Icon: Gamepad2, label: "Jogo" },
  { id: "medicine", Icon: HeartPulse, label: "Remédio" },
];

/** Fila inferior dentro do LCD. */
export const lcdBottomIcons: { id: IconId; Icon: LucideIcon; label: string }[] =
  [
  { id: "bath", Icon: Bath, label: "Banho" },
  { id: "status", Icon: Activity, label: "Estado" },
  { id: "discipline", Icon: Ban, label: "Bronca" },
  { id: "attention", Icon: Smile, label: "Carinho" },
  ];

/** Ordem do botão A (Menu): fila de cima esq→dir, depois fila de baixo. */
export const lcdMenuOrder: IconId[] = [
  ...lcdTopIcons.map((i) => i.id),
  ...lcdBottomIcons.map((i) => i.id),
];

export function LcdIconRow({
  icons,
  active,
  onSelect,
  disabled,
}: {
  icons: readonly { id: IconId; Icon: LucideIcon; label: string }[];
  active: IconId | null;
  onSelect: (id: IconId) => void;
  disabled?: boolean;
}) {
  return (
    <div className="flex w-full max-w-full items-center justify-between gap-0.5 px-0.5">
      {icons.map(({ id, Icon, label }) => {
        const isOn = active === id;
        return (
          <button
            key={id}
            type="button"
            title={label}
            aria-label={label}
            disabled={disabled}
            onClick={() => onSelect(id)}
            className={[
              "flex h-8 min-w-[2rem] flex-1 items-center justify-center rounded-sm transition-[transform,background-color] duration-100",
              disabled
                ? "cursor-not-allowed opacity-35"
                : "active:scale-[0.92] active:bg-green-950/25",
              isOn
                ? "bg-green-950/20 ring-1 ring-green-950/50 ring-inset"
                : "hover:bg-green-950/10",
            ].join(" ")}
          >
            <Icon
              className="pointer-events-none h-[17px] w-[17px] text-[#142210]"
              strokeWidth={2.5}
            />
          </button>
        );
      })}
    </div>
  );
}
