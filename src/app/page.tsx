import Link from "next/link";

export default function Home() {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center bg-gradient-to-b from-[#fff5fc] via-[#ffe8f2] to-[#ffd6e8] px-6 py-12 text-center">
      <div className="mb-8 inline-flex h-24 w-20 items-center justify-center rounded-[50%] border-[6px] border-pink-200 bg-gradient-to-b from-amber-100 to-pink-200 shadow-lg shadow-pink-300/40">
        <span className="text-4xl" aria-hidden>
          🥚
        </span>
      </div>
      <h1 className="mb-2 text-3xl font-extrabold tracking-tight text-pink-950">
        Tamagotchi Web
      </h1>
      <p className="mb-8 max-w-md text-pretty text-sm leading-relaxed text-pink-900/75">
        O teu tamagotchi no telemóvel: fome, felicidade, evolução e notificações
        quando precisa de ti — inspiração clássica, visual fofo e moderno.
      </p>
      <div className="flex flex-wrap items-center justify-center gap-3">
        <Link
          href="/login"
          className="btn-press btn-press-raised inline-block rounded-full bg-pink-500 px-8 py-3 text-sm font-bold text-white shadow-lg shadow-pink-400/40"
        >
          Entrar
        </Link>
        <Link
          href="/register"
          className="btn-press inline-block rounded-full border-2 border-pink-300 bg-white/80 px-8 py-3 text-sm font-semibold text-pink-900 shadow-[0_4px_0_rgb(244_114_182/0.35)] active:shadow-[0_1px_0_rgb(244_114_182/0.25)]"
        >
          Criar conta
        </Link>
      </div>
    </div>
  );
}
