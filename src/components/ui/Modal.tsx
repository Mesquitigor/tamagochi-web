"use client";

import { motion } from "framer-motion";
import type { ReactNode } from "react";

export function Modal({
  open,
  onClose,
  title,
  children,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
}) {
  if (!open) return null;
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/35 p-4 pb-8 sm:items-center"
      role="dialog"
      aria-modal
      aria-labelledby="modal-title"
    >
      <motion.div
        initial={{ y: 24, opacity: 0.94 }}
        animate={{ y: 0, opacity: 1 }}
        className="w-full max-w-sm rounded-3xl border-2 border-[#ffb8d0] bg-[#fff6fa] p-4 shadow-xl shadow-pink-200/60"
      >
        <div className="mb-3 flex items-center justify-between gap-2">
          <h2 id="modal-title" className="text-lg font-bold text-pink-900">
            {title}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="btn-press rounded-full px-3 py-1 text-sm text-pink-600 hover:bg-pink-100 active:bg-pink-200/80"
          >
            Fechar
          </button>
        </div>
        {children}
      </motion.div>
    </motion.div>
  );
}
