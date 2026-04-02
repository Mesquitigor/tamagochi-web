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
      <Pad letter="B" label="OK" onClick={onB} color="#ffb3c9" />
      <Pad letter="C" label="Voltar" onClick={onC} />
    </div>
  );
}

function Pad({
  letter,
  label,
  onClick,
  color = "#ffc9da",
}: {
  letter: string;
  label: string;
  onClick: () => void;
  color?: string;
}) {
  return (
    <motion.button
      type="button"
      transition={{ type: "spring", stiffness: 520, damping: 28 }}
      whileTap={{ scale: 0.9, y: 5, boxShadow: "0 1px 0 #c77a94" }}
      onClick={onClick}
      className="flex h-14 w-14 flex-col items-center justify-center rounded-full border-2 border-pink-300/80"
      style={{ backgroundColor: color, boxShadow: "0 5px 0 #d895aa" }}
    >
      <span className="text-xs font-bold text-pink-900 drop-shadow-sm">
        {letter}
      </span>
      <span className="text-[10px] text-pink-800/70">{label}</span>
    </motion.button>
  );
}
