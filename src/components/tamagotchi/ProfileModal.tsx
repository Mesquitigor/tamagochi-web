"use client";

import { useEffect, useState } from "react";
import { Modal } from "@/components/ui/Modal";

export function ProfileModal({
  open,
  onClose,
  petName,
  nickname,
  busy,
  onSave,
}: {
  open: boolean;
  onClose: () => void;
  petName: string;
  nickname: string;
  busy?: boolean;
  onSave: (p: { name: string; nickname: string }) => void | Promise<void>;
}) {
  const [name, setName] = useState(petName);
  const [nick, setNick] = useState(nickname);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    queueMicrotask(() => {
      setName(petName);
      setNick(nickname);
      setErr(null);
    });
  }, [open, petName, nickname]);

  return (
    <Modal open={open} onClose={onClose} title="Perfil">
      <form
        className="flex flex-col gap-4 text-stone-800/90"
        onSubmit={(e) => {
          e.preventDefault();
          setErr(null);
          const n = name.trim();
          const nk = nick.trim();
          if (!n || n.length > 20) {
            setErr("Nome do tamagotchi: 1–20 caracteres.");
            return;
          }
          if (!nk || nk.length > 24) {
            setErr("Apelido: 1–24 caracteres.");
            return;
          }
          void Promise.resolve(onSave({ name: n, nickname: nk })).catch(
            (e: unknown) => {
              setErr(e instanceof Error ? e.message : "Não foi possível guardar.");
            },
          );
        }}
      >
        <label className="flex flex-col gap-1">
          <span className="text-xs font-semibold text-stone-700/80">
            Nome do tamagotchi
          </span>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            maxLength={20}
            autoComplete="off"
            className="rounded-2xl border-2 border-stone-200 px-3 py-2 text-stone-900 outline-none focus:border-amber-500"
          />
        </label>
        <label className="flex flex-col gap-1">
          <span className="text-xs font-semibold text-stone-700/80">
            Apelido no placar
          </span>
          <input
            value={nick}
            onChange={(e) => setNick(e.target.value)}
            maxLength={24}
            autoComplete="nickname"
            className="rounded-2xl border-2 border-stone-200 px-3 py-2 text-stone-900 outline-none focus:border-amber-500"
          />
        </label>
        {err ? (
          <p className="text-sm text-red-700" role="alert">
            {err}
          </p>
        ) : null}
        <button
          type="submit"
          disabled={busy}
          className="btn-press btn-press-raised rounded-2xl bg-amber-600 py-2.5 font-semibold text-white disabled:opacity-45"
        >
          Salvar
        </button>
      </form>
    </Modal>
  );
}
