"use client";

import type { LucideIcon } from "lucide-react";
import {
  Activity,
  Angry,
  Bath,
  Gamepad2,
  HeartPulse,
  Lightbulb,
  LightbulbOff,
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
  { id: "light", Icon: Lightbulb, label: "Luz" },
  { id: "play", Icon: Gamepad2, label: "Jogo" },
  { id: "medicine", Icon: HeartPulse, label: "Remédio" },
];

/** Fila inferior dentro do LCD. */
export const lcdBottomIcons: { id: IconId; Icon: LucideIcon; label: string }[] =
  [
  { id: "bath", Icon: Bath, label: "Banho" },
  { id: "status", Icon: Activity, label: "Estado" },
  { id: "discipline", Icon: Angry, label: "Bronca" },
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
  lightsOn,
}: {
  icons: readonly { id: IconId; Icon: LucideIcon; label: string }[];
  active: IconId | null;
  onSelect: (id: IconId) => void;
  disabled?: boolean;
  /** Quando definido, o botão «Luz» mostra lâmpada acesa/apagada e cor de estado. */
  lightsOn?: boolean;
}) {
  return (
    <div className="flex w-full max-w-full items-center justify-between gap-0.5 px-0.5">
      {icons.map(({ id, Icon, label }) => {
        const isOn = active === id;
        const isLight = id === "light";
        const ResolvedIcon =
          isLight && lightsOn !== undefined
            ? lightsOn
              ? Lightbulb
              : LightbulbOff
            : Icon;
        const lightStateHint =
          isLight && lightsOn !== undefined
            ? lightsOn
              ? " — acesa"
              : " — apagada"
            : "";
        const title = `${label}${lightStateHint}`;
        const ariaLabel = `${label}${lightStateHint ? (lightsOn ? ", luz acesa" : ", luz apagada") : ""}`;

        const lightSlot =
          isLight && lightsOn !== undefined
            ? lightsOn
              ? "bg-amber-400/30 shadow-[inset_0_0_12px_rgba(234,179,8,0.5)] ring-1 ring-amber-400/50 ring-inset"
              : "bg-green-950/25 shadow-[inset_0_2px_8px_rgba(0,0,0,0.18)] ring-1 ring-green-950/35 ring-inset"
            : "";

        const iconClass = [
          "pointer-events-none h-[17px] w-[17px]",
          isLight && lightsOn !== undefined
            ? lightsOn
              ? "text-amber-700 drop-shadow-[0_0_2px_rgba(251,191,36,0.85)]"
              : "text-[#142210]/55"
            : "text-[#142210]",
        ].join(" ");

        return (
          <button
            key={id}
            type="button"
            title={title}
            aria-label={ariaLabel}
            disabled={disabled}
            onClick={() => onSelect(id)}
            className={[
              "flex h-8 min-w-[2rem] flex-1 items-center justify-center rounded-sm transition-[transform,background-color,box-shadow] duration-100",
              disabled
                ? "cursor-not-allowed opacity-35"
                : "active:scale-[0.92] active:bg-green-950/25",
              lightSlot,
              isOn
                ? "ring-2 ring-green-950/55 ring-inset"
                : !lightSlot
                  ? "hover:bg-green-950/10"
                  : "hover:bg-green-950/5",
            ].join(" ")}
          >
            <ResolvedIcon
              className={iconClass}
              strokeWidth={2.5}
            />
          </button>
        );
      })}
    </div>
  );
}
