"use client";

import { useEffect, useState } from "react";
import {
  formatLeaderboardDiedAt,
  formatLeaderboardDuration,
} from "@/lib/leaderboard/format";
import type { LeaderboardEntry } from "@/types/leaderboard";

const REFRESH_MS = 60 * 60 * 1000; // 1 h

async function fetchLeaderboard(limit: number): Promise<{
  entries: LeaderboardEntry[];
  error: string | null;
}> {
  const r = await fetch(`/api/leaderboard?limit=${limit}`, {
    credentials: "same-origin",
  });
  const j = (await r.json()) as {
    records?: LeaderboardEntry[];
    error?: string;
  };
  if (!r.ok) {
    return { entries: [], error: j.error ?? "Erro ao carregar o placar" };
  }
  return { entries: j.records ?? [], error: null };
}

export function HomeLeaderboardSection({ limit = 8 }: { limit?: number }) {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function tick(first: boolean) {
      const { entries: next, error: err } = await fetchLeaderboard(limit);
      if (cancelled) return;
      setEntries(next);
      setError(err);
      if (first) setLoading(false);
    }

    void tick(true);
    const id = window.setInterval(() => void tick(false), REFRESH_MS);
    const onVis = () => {
      if (document.visibilityState === "visible") void tick(false);
    };
    document.addEventListener("visibilitychange", onVis);
    return () => {
      cancelled = true;
      window.clearInterval(id);
      document.removeEventListener("visibilitychange", onVis);
    };
  }, [limit]);

  return (
    <section
      className="mt-10 w-full max-w-md rounded-2xl border border-stone-200/70 bg-white/70 px-4 py-5 text-left shadow-md shadow-stone-400/20 backdrop-blur-sm"
      aria-labelledby="home-leaderboard-heading"
    >
      <h2
        id="home-leaderboard-heading"
        className="mb-1 text-center text-sm font-extrabold tracking-tight text-stone-900"
      >
        Placar global
      </h2>
      <p className="mb-4 text-center text-xs leading-relaxed text-stone-700/70">
        Idade actual dos pets a jogar e recordes de quem já terminou (top{" "}
        {limit}). Actualiza ao abrir a página e cerca de hora a hora.
      </p>
      {loading ? (
        <p className="text-center text-xs text-stone-600/80">A carregar…</p>
      ) : error ? (
        <p className="text-center text-xs text-red-700" role="alert">
          {error}
        </p>
      ) : entries.length === 0 ? (
        <p className="text-center text-xs text-stone-700/65">
          Ainda não há entradas. Entra para jogares e apareceres aqui.
        </p>
      ) : (
        <ol className="max-h-[22rem] space-y-2 overflow-y-auto pr-1">
          {entries.map((row) => (
            <li
              key={`${row.rank}-${row.user_id}-${
                row.is_alive ? "live" : row.died_at
              }-${row.pet_name}`}
              className={`rounded-xl border px-3 py-2 text-xs text-stone-800/90 ${
                row.is_alive
                  ? "border-emerald-200/70 bg-emerald-50/40"
                  : "border-stone-200/60 bg-white/80"
              }`}
            >
              <div className="flex flex-wrap items-baseline justify-between gap-1">
                <span className="font-bold text-stone-900">
                  #{row.rank}{" "}
                  <span className="font-semibold">{row.pet_name}</span>
                  {row.is_alive ? (
                    <span className="ml-1 rounded bg-emerald-600/15 px-1.5 py-px text-[10px] font-semibold uppercase text-emerald-900">
                      vivo
                    </span>
                  ) : null}
                </span>
                <span className="font-mono font-medium text-stone-800/85">
                  {formatLeaderboardDuration(row.age_minutes)}
                </span>
              </div>
              <p className="mt-1 text-[11px] text-stone-700/78">
                <span className="font-medium">{row.nickname}</span>
                <span className="text-stone-600/55"> · </span>
                fase {row.stage}
                <span className="text-stone-600/55"> · </span>
                {formatLeaderboardDiedAt(row.died_at)}
              </p>
            </li>
          ))}
        </ol>
      )}
    </section>
  );
}
