import Link from "next/link";
import { AuthBackdrop } from "@/components/auth/AuthBackdrop";

export default function EmailConfirmedPage() {
  return (
    <AuthBackdrop>
      <div className="w-full max-w-sm rounded-[2rem] border-4 border-stone-300/90 bg-white/88 p-8 text-center shadow-2xl shadow-stone-900/15 backdrop-blur-md">
        <p className="mb-2 text-4xl" aria-hidden>
          ✉️
        </p>
        <h1 className="mb-2 text-2xl font-bold text-stone-900">
          Email confirmado!
        </h1>
        <p className="mb-6 text-sm leading-relaxed text-stone-800/80">
          A tua conta está activa. Entra com o email e a palavra-passe que
          definiste para cuidares do teu tamagotchi.
        </p>
        <Link
          href="/login"
          className="btn-press btn-press-raised inline-block w-full rounded-2xl bg-amber-600 py-3 text-sm font-semibold text-white"
        >
          Ir para entrar
        </Link>
      </div>
    </AuthBackdrop>
  );
}
