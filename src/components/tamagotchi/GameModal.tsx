"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Modal } from "@/components/ui/Modal";

export function GameModal({
  open,
  onClose,
  onResult,
}: {
  open: boolean;
  onClose: () => void;
  onResult: (won: boolean) => void;
}) {
  return (
    <Modal open={open} onClose={onClose} title="Esquerda ou direita?">
      {open ? (
        <GameRound
          onClose={onClose}
          onResult={onResult}
        />
      ) : null}
    </Modal>
  );
}

function GameRound({
  onClose,
  onResult,
}: {
  onClose: () => void;
  onResult: (won: boolean) => void;
}) {
  const [dir] = useState<"L" | "R">(() =>
    Math.random() > 0.5 ? "L" : "R",
  );
  const [picked, setPicked] = useState<boolean | null>(null);

  function choose(left: boolean) {
    setPicked(left);
    const won = (left && dir === "L") || (!left && dir === "R");
    setTimeout(() => {
      onResult(won);
      onClose();
    }, 650);
  }

  return (
    <>
      <p className="mb-3 text-center text-sm text-pink-900/85">
        Onde está o tamagotchi? Adivinha!
      </p>
      <div className="flex justify-center gap-4">
        <motion.button
          type="button"
          transition={{ type: "spring", stiffness: 500, damping: 26 }}
          whileTap={{ scale: 0.9, y: 4, boxShadow: "0 1px 0 rgb(236 72 153 / 0.35)" }}
          style={{ boxShadow: "0 4px 0 rgb(236 72 153 / 0.25)" }}
          onClick={() => picked === null && choose(true)}
          className={`h-20 w-20 rounded-2xl border-2 text-lg font-bold ${
            picked === true
              ? "border-pink-500 bg-pink-200"
              : "border-pink-300 bg-white"
          }`}
        >
          ◀ Esq
        </motion.button>
        <motion.button
          type="button"
          transition={{ type: "spring", stiffness: 500, damping: 26 }}
          whileTap={{ scale: 0.9, y: 4, boxShadow: "0 1px 0 rgb(236 72 153 / 0.35)" }}
          style={{ boxShadow: "0 4px 0 rgb(236 72 153 / 0.25)" }}
          onClick={() => picked === null && choose(false)}
          className={`h-20 w-20 rounded-2xl border-2 text-lg font-bold ${
            picked === false
              ? "border-pink-500 bg-pink-200"
              : "border-pink-300 bg-white"
          }`}
        >
          Dir ▶
        </motion.button>
      </div>
      <p className="mt-2 text-center text-xs text-pink-800/60">
        Resposta escondida até ao fim da ronda.
      </p>
    </>
  );
}
