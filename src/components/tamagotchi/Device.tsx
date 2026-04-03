"use client";

import { motion } from "framer-motion";
import type { ReactNode } from "react";
import { shellThemeOrNull } from "@/lib/game/colorThemes";

const baseClassName =
  "relative mx-auto w-full max-w-[540px] overflow-hidden rounded-[48%_48%_42%_42%/55%_55%_40%_40%] border-[12px] px-12 pb-12 pt-14";

const defaultShellClassName =
  "border-pink-200 bg-gradient-to-b from-[#fff0f6] via-[#ffe0ee] to-[#ffc9da] shadow-[0_20px_40px_-12px_rgba(236,72,153,.35)]";

export function Device({
  children,
  shellThemeId,
}: {
  children: ReactNode;
  /** Chave em `THEMES` (coluna `color_theme`); null = rosa clássico. */
  shellThemeId?: string | null;
}) {
  const shell = shellThemeOrNull(shellThemeId);
  const customShellStyle = shell
    ? {
        borderColor: shell.border,
        background: `linear-gradient(to bottom, ${shell.from}, ${shell.via}, ${shell.to})`,
        boxShadow: `0 20px 40px -12px rgba(${shell.shadow}, 0.35)`,
      }
    : undefined;

  return (
    <motion.div
      initial={{ scale: 0.96, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: "spring", stiffness: 260, damping: 22 }}
      className={[baseClassName, shell ? "" : defaultShellClassName]
        .filter(Boolean)
        .join(" ")}
      style={customShellStyle}
    >
      <div className="pointer-events-none absolute inset-[10px] rounded-[42%_42%_38%_38%/52%_52%_38%_38%] border-2 border-white/55" />
      <div className="relative z-[1] flex w-full min-w-0 flex-col items-center">
        {children}
      </div>
    </motion.div>
  );
}
