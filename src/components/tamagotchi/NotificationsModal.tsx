"use client";

import { useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { Bell, BellOff, CheckCircle2 } from "lucide-react";

type Status = "idle" | "loading" | "granted" | "denied" | "unsupported" | "error";

export function NotificationsModal({
  open,
  onClose,
  supported,
  subscribed,
  onSubscribe,
}: {
  open: boolean;
  onClose: () => void;
  supported: boolean;
  subscribed: boolean;
  onSubscribe: () => Promise<boolean>;
}) {
  const [status, setStatus] = useState<Status>(
    subscribed ? "granted" : "idle",
  );

  async function handleActivate() {
    setStatus("loading");
    try {
      const ok = await onSubscribe();
      setStatus(ok ? "granted" : "denied");
    } catch {
      setStatus("error");
    }
  }

  const hasVapidKey = Boolean(process.env.NEXT_PUBLIC_WEB_PUSH_PUBLIC_KEY);

  return (
    <Modal open={open} onClose={onClose} title="Notificações">
      <div className="space-y-4 rounded-2xl bg-white/70 p-3">
        {!supported || !hasVapidKey ? (
          <div className="flex flex-col items-center gap-3 py-2 text-center">
            <BellOff className="h-10 w-10 text-amber-500" />
            <p className="text-sm text-stone-800/80">
              {!hasVapidKey
                ? "As notificações push ainda não foram configuradas no servidor. Peça ao administrador para gerar as chaves VAPID."
                : "O teu navegador não suporta notificações push. Experimenta o Chrome ou adiciona a app ao ecrã inicial no telemóvel."}
            </p>
          </div>
        ) : status === "granted" || subscribed ? (
          <div className="flex flex-col items-center gap-3 py-2 text-center">
            <CheckCircle2 className="h-10 w-10 text-green-500" />
            <p className="text-sm font-medium text-green-800">
              Notificações ativas!
            </p>
            <p className="text-xs text-stone-700/65">
              Vais receber avisos quando o teu tamagotchi precisar de comer,
              tomar remédio, tiver cocô ou estiver triste.
            </p>
          </div>
        ) : status === "denied" ? (
          <div className="flex flex-col items-center gap-3 py-2 text-center">
            <BellOff className="h-10 w-10 text-red-400" />
            <p className="text-sm text-stone-800/80">
              Permissão negada pelo navegador. Para ativar, vai às definições do
              site e permite notificações.
            </p>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-3 py-2 text-center">
            <Bell className="h-10 w-10 text-amber-600" />
            <p className="text-sm font-medium text-stone-900">
              Queres receber alertas do teu tamagotchi?
            </p>
            <ul className="w-full space-y-1 text-left text-xs text-stone-700/75">
              <li>🍔 Quando estiver com fome</li>
              <li>💊 Quando precisar de remédio</li>
              <li>💩 Quando tiver cocô para limpar</li>
              <li>😢 Quando estiver triste</li>
              <li>🎉 Quando evoluir de fase</li>
            </ul>
            <button
              type="button"
              disabled={status === "loading"}
              onClick={() => void handleActivate()}
              className="btn-press btn-press-raised mt-1 w-full rounded-2xl bg-amber-600 py-2.5 text-sm font-semibold text-white disabled:opacity-60 disabled:active:transform-none"
            >
              {status === "loading" ? "A ativar…" : "Ativar notificações"}
            </button>
            {status === "error" && (
              <p className="text-xs text-red-600">
                Erro ao ativar. Verifica a ligação e tenta de novo.
              </p>
            )}
          </div>
        )}
      </div>
    </Modal>
  );
}
