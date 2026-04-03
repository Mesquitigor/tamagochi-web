import {
  formatLeaderboardDiedAt,
  formatLeaderboardDuration,
} from "@/lib/leaderboard/format";
import type { LeaderboardEntry } from "@/types/leaderboard";

export function HomeLeaderboardSection({
  entries,
  error,
}: {
  entries: LeaderboardEntry[];
  error: string | null;
}) {
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
        Maior tempo de vida quando o pet chegou ao fim (top 8). Entra para
        jogares e apareceres aqui.
      </p>
      {error ? (
        <p className="text-center text-xs text-red-700" role="alert">
          {error}
        </p>
      ) : entries.length === 0 ? (
        <p className="text-center text-xs text-stone-700/65">
          Ainda não há recordes. Quando uma corrida terminar, os melhores tempos
          aparecem aqui.
        </p>
      ) : (
        <ol className="max-h-[22rem] space-y-2 overflow-y-auto pr-1">
          {entries.map((row) => (
            <li
              key={`${row.rank}-${row.user_id}-${row.died_at}-${row.pet_name}`}
              className="rounded-xl border border-stone-200/60 bg-white/80 px-3 py-2 text-xs text-stone-800/90"
            >
              <div className="flex flex-wrap items-baseline justify-between gap-1">
                <span className="font-bold text-stone-900">
                  #{row.rank}{" "}
                  <span className="font-semibold">{row.pet_name}</span>
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
