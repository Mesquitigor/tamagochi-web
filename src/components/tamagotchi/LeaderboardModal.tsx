"use client";

import { useEffect, useState } from "react";
import { Modal } from "@/components/ui/Modal";
import {
  formatLeaderboardDiedAt,
  formatLeaderboardDuration,
} from "@/lib/leaderboard/format";
import type { LeaderboardEntry } from "@/types/leaderboard";

export function LeaderboardModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const [records, setRecords] = useState<LeaderboardEntry[]>([]);
  const [me, setMe] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    queueMicrotask(() => {
      if (cancelled) return;
      setLoading(true);
      setErr(null);
      void fetch("/api/leaderboard")
        .then(async (r) => {
          const j = (await r.json()) as {
            records?: LeaderboardEntry[];
            me?: string;
            error?: string;
          };
          if (!r.ok) throw new Error(j.error ?? "Erro ao carregar");
          if (!cancelled) {
            setRecords(j.records ?? []);
            setMe(j.me ?? null);
          }
        })
        .catch((e: unknown) => {
          if (!cancelled)
            setErr(e instanceof Error ? e.message : "Erro ao carregar");
        })
        .finally(() => {
          if (!cancelled) setLoading(false);
        });
    });
    return () => {
      cancelled = true;
    };
  }, [open]);

  return (
    <Modal open={open} onClose={onClose} title="Placar — maior duração">
      <div className="max-h-[min(70vh,28rem)] space-y-3 overflow-y-auto text-stone-800/90">
        <p className="text-xs leading-relaxed text-stone-700/75">
          Ordenado pelo tempo de vida (idade em minutos) quando o pet foi
          registado ao renascer. Só entram pets que chegaram ao fim e tens
          «Novo ovo».
        </p>
        {loading ? (
          <p className="text-sm text-stone-700/70">A carregar…</p>
        ) : err ? (
          <p className="text-sm text-red-700" role="alert">
            {err}
          </p>
        ) : records.length === 0 ? (
          <p className="text-sm text-stone-700/70">
            Ainda não há recordes. Quando um tamagotchi partir e iniciares um novo
            ovo, o último percurso aparece aqui.
          </p>
        ) : (
          <ol className="space-y-2">
            {records.map((row) => {
              const mine = me && row.user_id === me;
              return (
                <li
                  key={`${row.rank}-${row.user_id}-${row.died_at}-${row.pet_name}`}
                  className={`rounded-xl border px-3 py-2 text-sm ${
                    mine
                      ? "border-amber-500 bg-amber-50/90"
                      : "border-stone-200/60 bg-white/60"
                  }`}
                >
                  <div className="flex flex-wrap items-baseline justify-between gap-1">
                    <span className="font-bold text-stone-900">
                      #{row.rank}{" "}
                      <span className="font-semibold">{row.pet_name}</span>
                    </span>
                    <span className="font-mono text-xs font-medium text-stone-800/85">
                      {formatLeaderboardDuration(row.age_minutes)}
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-stone-700/80">
                    <span className="font-medium">{row.nickname}</span>
                    <span className="text-stone-600/60"> · </span>
                    fase {row.stage}
                    <span className="text-stone-600/60"> · </span>
                    {formatLeaderboardDiedAt(row.died_at)}
                  </p>
                </li>
              );
            })}
          </ol>
        )}
      </div>
    </Modal>
  );
}
