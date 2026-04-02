"use client";

import Image from "next/image";
import type { ReactNode } from "react";

const AUTH_BG = "/Gemini_Generated_Image_7tqoj77tqoj77tqo.png";

/** Fundo ilustrado + véu para legibilidade nas páginas de autenticação. */
export function AuthBackdrop({ children }: { children: ReactNode }) {
  return (
    <div className="relative flex min-h-dvh flex-col items-center justify-center px-4 py-10">
      <div className="absolute inset-0 overflow-hidden" aria-hidden>
        <Image
          src={AUTH_BG}
          alt=""
          fill
          priority
          className="object-cover object-top md:object-center"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-white/40 via-white/50 to-white/65 backdrop-blur-[3px]" />
      </div>
      <div className="relative z-10 flex w-full justify-center">{children}</div>
    </div>
  );
}
