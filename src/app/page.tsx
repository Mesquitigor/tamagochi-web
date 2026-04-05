import Link from "next/link";
import { HomeLeaderboardSection } from "@/components/tamagotchi/HomeLeaderboardSection";

const HOME_LEADERBOARD_LIMIT = 8;

export default function Home() {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center bg-gradient-to-b from-[#fdfcfa] via-[#f5f0e8] to-[#e8dfd4] px-6 py-12 text-center">
      <div className="mb-8 inline-flex h-24 w-20 items-center justify-center rounded-[50%] border-[6px] border-stone-300 bg-gradient-to-b from-[#fff8eb] to-[#e7dfd3] shadow-lg shadow-stone-500/20">
        <span className="text-4xl" aria-hidden>
          🥚
        </span>
      </div>
      <h1 className="mb-2 text-3xl font-extrabold tracking-tight text-stone-900">
        Tamagotchi Web
      </h1>
      <p className="mb-8 max-w-md text-pretty text-sm leading-relaxed text-stone-700/75">
        O teu tamagotchi no telemóvel: fome, felicidade, evolução e notificações
        quando precisa de ti — inspiração clássica, visual fofo e moderno.
      </p>
      <HomeLeaderboardSection limit={HOME_LEADERBOARD_LIMIT} />
      <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
        <Link
          href="/login"
          className="btn-press btn-press-raised inline-block rounded-full bg-amber-600 px-8 py-3 text-sm font-bold text-white shadow-lg shadow-amber-700/30"
        >
          Entrar
        </Link>
        <Link
          href="/register"
          className="btn-press inline-block rounded-full border-2 border-stone-300 bg-white/80 px-8 py-3 text-sm font-semibold text-stone-800 shadow-[0_4px_0_rgb(120_53_15/0.22)] active:shadow-[0_1px_0_rgb(120_53_15/0.18)]"
        >
          Criar conta
        </Link>
      </div>
    </div>
  );
}
