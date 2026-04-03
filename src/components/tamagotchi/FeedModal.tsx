"use client";

import { Modal } from "@/components/ui/Modal";

export function FeedModal({
  open,
  onClose,
  onMeal,
  onSnack,
}: {
  open: boolean;
  onClose: () => void;
  onMeal: () => void;
  onSnack: () => void;
}) {
  return (
    <Modal open={open} onClose={onClose} title="Alimentar">
      <div className="flex flex-col gap-3">
        <button
          type="button"
          onClick={() => {
            onMeal();
            onClose();
          }}
          className="btn-press btn-press-raised rounded-2xl border-2 border-stone-300 bg-stone-100 py-3 text-center font-semibold text-stone-800"
        >
          Refeição (+fome, +peso)
        </button>
        <button
          type="button"
          onClick={() => {
            onSnack();
            onClose();
          }}
          className="btn-press btn-press-raised rounded-2xl border-2 border-amber-300 bg-amber-100 py-3 text-center font-semibold text-amber-950"
        >
          Lanche (+fome &amp; alegria)
        </button>
      </div>
    </Modal>
  );
}
