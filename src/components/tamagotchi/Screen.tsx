"use client";

import type { ReactNode } from "react";

type ScreenProps = {
  /** Fila superior de ícones (dentro do LCD). */
  topBar?: ReactNode;
  /** Fila inferior de ícones (dentro do LCD). */
  bottomBar?: ReactNode;
  children: ReactNode;
};

export function Screen({ topBar, bottomBar, children }: ScreenProps) {
  const hasChrome = Boolean(topBar || bottomBar);

  return (
    <div
      className="relative mx-auto w-full max-w-[min(100%,264px)] shrink-0 overflow-hidden rounded-xl border-4 border-[#9abf7f] bg-[#c8e6a0] px-1.5 shadow-inner sm:max-w-[272px]"
      style={{
        boxShadow:
          "inset 0 0 24px rgba(60,90,40,.15), 0 4px 0 #7a9e5c",
      }}
    >
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.12]"
        style={{
          backgroundImage:
            "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,.12) 2px, rgba(0,0,0,.12) 3px)",
        }}
      />
      <div
        className={`relative z-[1] flex flex-col ${
          hasChrome ? "min-h-[188px] py-1.5" : "min-h-[140px] py-4"
        }`}
      >
        {topBar ? (
          <div className="flex shrink-0 justify-center border-b border-[#142210]/12 pb-1.5 pt-0.5">
            {topBar}
          </div>
        ) : null}
        <div className="relative flex min-h-[120px] flex-1 flex-col items-center justify-center px-1 py-2">
          {children}
        </div>
        {bottomBar ? (
          <div className="flex shrink-0 justify-center border-t border-[#142210]/12 pb-0.5 pt-1.5">
            {bottomBar}
          </div>
        ) : null}
      </div>
    </div>
  );
}
