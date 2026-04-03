import Link from "next/link";
import { AuthBackdrop } from "@/components/auth/AuthBackdrop";

export default function EmailConfirmedPage() {
  return (
    <AuthBackdrop>
      <div className="w-full max-w-sm rounded-[2rem] border-4 border-pink-200/90 bg-white/88 p-8 text-center shadow-2xl shadow-pink-900/20 backdrop-blur-md">
        <p className="mb-2 text-4xl" aria-hidden>
          ✉️
        </p>
        <h1 className="mb-2 text-2xl font-bold text-pink-950">
          Email confirmado!
        </h1>
        <p className="mb-6 text-sm leading-relaxed text-pink-900/80">
          A tua conta está activa. Entra com o email e a palavra-passe que
          definiste para cuidares do teu tamagotchi.
        </p>
        <Link
          href="/login"
          className="btn-press btn-press-raised inline-block w-full rounded-2xl bg-pink-500 py-3 text-sm font-semibold text-white"
        >
          Ir para entrar
        </Link>
      </div>
    </AuthBackdrop>
  );
}
