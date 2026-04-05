"use client";

import { useCallback, useEffect, useState } from "react";
import { Modal } from "@/components/ui/Modal";
import {
  formatLeaderboardDiedAt,
  formatLeaderboardDuration,
} from "@/lib/leaderboard/format";
import type { LeaderboardEntry } from "@/types/leaderboard";

const REFRESH_MS = 60 * 60 * 1000;
const MODAL_LIMIT = 50;

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

  const fetchList = useCallback(async () => {
    setErr(null);
    const r = await fetch(`/api/leaderboard?limit=${MODAL_LIMIT}`, {
      credentials: "same-origin",
    });
    const j = (await r.json()) as {
      records?: LeaderboardEntry[];
      me?: string;
      error?: string;
    };
    if (!r.ok) throw new Error(j.error ?? "Erro ao carregar");
    setRecords(j.records ?? []);
    setMe(j.me ?? null);
  }, []);

  useEffect(() => {
    if (!open) return;
    let cancelled = false;

    const run = () => {
      queueMicrotask(async () => {
        if (cancelled) return;
        setLoading(true);
        try {
          await fetchList();
        } catch (e: unknown) {
          if (!cancelled)
            setErr(e instanceof Error ? e.message : "Erro ao carregar");
        } finally {
          if (!cancelled) setLoading(false);
        }
      });
    };

    run();
    const hourly = window.setInterval(run, REFRESH_MS);
    const onVis = () => {
      if (document.visibilityState === "visible") run();
    };
    document.addEventListener("visibilitychange", onVis);

    return () => {
      cancelled = true;
      window.clearInterval(hourly);
      document.removeEventListener("visibilitychange", onVis);
    };
  }, [open, fetchList]);

  return (
    <Modal open={open} onClose={onClose} title="Placar — maior duração">
      <div className="max-h-[min(70vh,28rem)] space-y-3 overflow-y-auto text-stone-800/90">
        <p className="text-xs leading-relaxed text-stone-700/75">
          Pets <strong>vivos</strong> com a idade actual; <strong>registos</strong>{" "}
          de corridas já terminadas. Ordenado por minutos de vida. Actualiza ao
          abrir e a cada hora.
        </p>
        {loading && records.length === 0 ? (
          <p className="text-sm text-stone-700/70">A carregar…</p>
        ) : err ? (
          <p className="text-sm text-red-700" role="alert">
            {err}
          </p>
        ) : records.length === 0 ? (
          <p className="text-sm text-stone-700/70">
            Ainda não há entradas no placar.
          </p>
        ) : (
          <ol className="space-y-2">
            {records.map((row) => {
              const mine = me && row.user_id === me;
              return (
                <li
                  key={`${row.rank}-${row.user_id}-${
                    row.is_alive ? "live" : row.died_at
                  }-${row.pet_name}`}
                  className={`rounded-xl border px-3 py-2 text-sm ${
                    mine
                      ? "border-amber-500 bg-amber-50/90"
                      : row.is_alive
                        ? "border-emerald-200/80 bg-emerald-50/35"
                        : "border-stone-200/60 bg-white/60"
                  }`}
                >
                  <div className="flex flex-wrap items-baseline justify-between gap-1">
                    <span className="font-bold text-stone-900">
                      #{row.rank}{" "}
                      <span className="font-semibold">{row.pet_name}</span>
                      {row.is_alive ? (
                        <span className="ml-1 text-[10px] font-semibold uppercase text-emerald-800">
                          vivo
                        </span>
                      ) : null}
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
