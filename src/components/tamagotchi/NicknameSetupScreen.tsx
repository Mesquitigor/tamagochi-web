"use client";

import { useState } from "react";
import { playBeep } from "@/lib/sound";

export function NicknameSetupScreen({
  onSubmit,
  busy,
}: {
  onSubmit: (nickname: string) => void | Promise<void>;
  busy?: boolean;
}) {
  const [nickname, setNickname] = useState("");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrorMsg(null);
    const n = nickname.trim();
    if (!n || n.length > 24) return;
    try {
      await onSubmit(n);
    } catch (err) {
      playBeep("low");
      setErrorMsg(
        err instanceof Error ? err.message : "Não foi possível guardar.",
      );
    }
  }

  return (
    <form
      className="flex w-full flex-col items-center gap-4 px-1"
      onSubmit={(e) => void handleSubmit(e)}
    >
      <p className="max-w-[260px] text-center text-sm font-medium text-green-900/90">
        Bem-vindo! Escolhe o teu <strong>apelido</strong> para aparecer no
        placar global quando o teu tamagotchi tiver recordes.
      </p>
      <label className="flex w-full max-w-[260px] flex-col gap-1 text-left">
        <span className="text-[11px] font-semibold uppercase tracking-wide text-green-900/70">
          Apelido no placar
        </span>
        <input
          value={nickname}
          onChange={(e) => {
            setNickname(e.target.value);
            setErrorMsg(null);
          }}
          maxLength={24}
          autoComplete="nickname"
          autoFocus
          className="rounded-lg border-2 border-[#142210]/20 bg-[#b8d88a]/40 px-2 py-2 text-sm font-medium text-green-950 outline-none focus:border-[#142210]/45"
          placeholder="1–24 caracteres"
        />
      </label>
      {errorMsg ? (
        <p
          className="max-w-[260px] text-center text-xs leading-relaxed text-red-700"
          role="alert"
        >
          {errorMsg}
        </p>
      ) : null}
      <button
        type="submit"
        disabled={busy || !nickname.trim() || nickname.trim().length > 24}
        className="btn-press btn-press-raised w-full max-w-[220px] rounded-2xl bg-amber-600 py-2.5 text-sm font-bold text-white shadow-md disabled:cursor-not-allowed disabled:opacity-45"
      >
        Continuar
      </button>
    </form>
  );
}
