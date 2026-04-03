"use client";

import { Modal } from "@/components/ui/Modal";
import { THEMES, type ColorThemeId } from "@/lib/game/colorThemes";

export function ColorModal({
  open,
  onClose,
  currentTheme,
  onPick,
  busy,
}: {
  open: boolean;
  onClose: () => void;
  currentTheme: string | null;
  onPick: (themeId: ColorThemeId | null) => void | Promise<void>;
  busy?: boolean;
}) {
  const entries = Object.entries(THEMES) as [
    ColorThemeId,
    (typeof THEMES)[ColorThemeId],
  ][];

  return (
    <Modal open={open} onClose={onClose} title="Cor do aparelho">
      <p className="mb-3 text-sm text-neutral-600">
        Escolhe a cor do invólucro oval à volta do ecrã. &quot;Padrão&quot;
        é o creme tipo plástico vintage dos brinquedos originais.
      </p>
      <div className="flex flex-wrap gap-3">
        <button
          type="button"
          disabled={busy}
          onClick={() => void onPick(null)}
          className={`btn-press flex h-14 min-w-[4.5rem] flex-1 flex-col items-center justify-center rounded-2xl border-2 text-xs font-semibold ${
            currentTheme == null || currentTheme === ""
              ? "border-neutral-500 bg-neutral-100 text-neutral-900"
              : "border-neutral-200 bg-white text-neutral-700"
          }`}
        >
          Padrão
        </button>
        {entries.map(([id, t]) => {
          const s = t.shell;
          return (
            <button
              key={id}
              type="button"
              disabled={busy}
              onClick={() => void onPick(id)}
              title={t.label}
              aria-label={t.label}
              className={`btn-press flex h-14 w-14 items-center justify-center rounded-full border-2 shadow-sm ${
                currentTheme === id
                  ? "ring-2 ring-neutral-500 ring-offset-2 ring-offset-white"
                  : ""
              }`}
              style={{
                background: `linear-gradient(135deg, ${s.from} 30%, ${s.to} 100%)`,
                borderColor: s.border,
              }}
            />
          );
        })}
      </div>
    </Modal>
  );
}
