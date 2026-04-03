"use client";

import { useState } from "react";
import { Pet } from "@/components/tamagotchi/Pet";
import { playBeep } from "@/lib/sound";

type Sex = "male" | "female";

export function SetupScreen({
  defaultName,
  onSubmit,
  busy,
}: {
  defaultName: string;
  onSubmit: (name: string, sex: Sex) => void | Promise<void>;
  busy?: boolean;
}) {
  const [name, setName] = useState(defaultName === "Tamago" ? "" : defaultName);
  const [sex, setSex] = useState<Sex | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrorMsg(null);
    const n = name.trim();
    if (!n || n.length > 20 || !sex) return;
    try {
      await onSubmit(n, sex);
    } catch (err) {
      playBeep("low");
      setErrorMsg(
        err instanceof Error ? err.message : "Não foi possível guardar.",
      );
      return;
    }
  }

  return (
    <form
      className="flex w-full flex-col items-center gap-3 px-1"
      onSubmit={(e) => void handleSubmit(e)}
    >
      <div className="flex flex-col items-center gap-0.5 py-1">
        <Pet characterId="egg" animation="idle" />
        <p className="font-[family-name:var(--font-geist-mono)] text-[10px] font-semibold uppercase tracking-[0.12em] text-green-950/80">
          Ovo
        </p>
      </div>
      <p className="text-center text-xs font-medium text-green-900/85">
        Dá um nome e escolhe o sexo do teu tamagotchi
      </p>
      <label className="flex w-full max-w-[220px] flex-col gap-1 text-left">
        <span className="text-[11px] font-semibold uppercase tracking-wide text-green-900/70">
          Nome
        </span>
        <input
          value={name}
          onChange={(e) => {
            setName(e.target.value);
            setErrorMsg(null);
          }}
          maxLength={20}
          autoComplete="off"
          className="rounded-lg border-2 border-[#142210]/20 bg-[#b8d88a]/40 px-2 py-1.5 text-sm font-medium text-green-950 outline-none focus:border-[#142210]/45"
          placeholder="Até 20 letras"
        />
      </label>
      <div className="flex w-full max-w-[220px] flex-col gap-1.5">
        <span className="text-[11px] font-semibold uppercase tracking-wide text-green-900/70">
          Sexo
        </span>
        <div className="flex gap-2">
          <button
            type="button"
            disabled={busy}
            onClick={() => {
              setSex("male");
              setErrorMsg(null);
            }}
            className={`btn-press flex flex-1 items-center justify-center gap-1 rounded-xl border-2 py-2 text-sm font-semibold ${
              sex === "male"
                ? "border-[#142210] bg-[#142210]/10 text-green-950"
                : "border-[#142210]/20 bg-[#b8d88a]/25 text-green-900/80"
            }`}
          >
            <span aria-hidden>♂</span> Macho
          </button>
          <button
            type="button"
            disabled={busy}
            onClick={() => {
              setSex("female");
              setErrorMsg(null);
            }}
            className={`btn-press flex flex-1 items-center justify-center gap-1 rounded-xl border-2 py-2 text-sm font-semibold ${
              sex === "female"
                ? "border-[#142210] bg-[#142210]/10 text-green-950"
                : "border-[#142210]/20 bg-[#b8d88a]/25 text-green-900/80"
            }`}
          >
            <span aria-hidden>♀</span> Fêmea
          </button>
        </div>
      </div>
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
        disabled={
          busy || !name.trim() || name.trim().length > 20 || sex === null
        }
        className="btn-press btn-press-raised mt-1 w-full max-w-[220px] rounded-2xl bg-amber-600 py-2.5 text-sm font-bold text-white shadow-md disabled:cursor-not-allowed disabled:opacity-45"
      >
        Começar!
      </button>
    </form>
  );
}
