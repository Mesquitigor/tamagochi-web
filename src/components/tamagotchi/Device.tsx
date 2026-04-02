"use client";

import { motion } from "framer-motion";
import type { ReactNode } from "react";

export function Device({ children }: { children: ReactNode }) {
  return (
    <motion.div
      initial={{ scale: 0.96, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: "spring", stiffness: 260, damping: 22 }}
      className="relative mx-auto w-full max-w-[520px] overflow-hidden rounded-[48%_48%_42%_42%/55%_55%_40%_40%] border-[10px] border-pink-200 bg-gradient-to-b from-[#fff0f6] via-[#ffe0ee] to-[#ffc9da] px-10 pb-10 pt-12 shadow-[0_20px_40px_-12px_rgba(236,72,153,.35)]"
    >
      <div className="pointer-events-none absolute inset-2 rounded-[42%_42%_38%_38%/52%_52%_38%_38%] border border-white/50" />
      <div className="relative z-[1] flex w-full min-w-0 flex-col items-center">
        {children}
      </div>
    </motion.div>
  );
}
