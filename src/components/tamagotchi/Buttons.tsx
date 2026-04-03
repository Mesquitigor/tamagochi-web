"use client";

import { motion } from "framer-motion";

export function DeviceButtons({
  onA,
  onB,
  onC,
}: {
  onA: () => void;
  onB: () => void;
  onC: () => void;
}) {
  return (
    <div className="mt-4 flex items-center justify-center gap-8 pb-2">
      <Pad letter="A" label="Menu" onClick={onA} />
      <Pad letter="B" label="OK" onClick={onB} />
      <Pad letter="C" label="Voltar" onClick={onC} />
    </div>
  );
}

function Pad({
  letter,
  label,
  onClick,
}: {
  letter: string;
  label: string;
  onClick: () => void;
}) {
  return (
    <motion.button
      type="button"
      transition={{ type: "spring", stiffness: 520, damping: 28 }}
      whileTap={{
        scale: 0.9,
        y: 5,
        boxShadow: "0 1px 0 #71717a",
      }}
      onClick={onClick}
      className="flex h-14 w-14 flex-col items-center justify-center rounded-full border-2 border-neutral-400 bg-neutral-200 shadow-[0_5px_0_#a1a1aa]"
    >
      <span className="text-xs font-bold text-neutral-800 drop-shadow-sm">
        {letter}
      </span>
      <span className="text-[10px] text-neutral-600">{label}</span>
    </motion.button>
  );
}
