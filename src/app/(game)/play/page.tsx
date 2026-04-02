"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { createClient } from "@/lib/supabase/client";
import { usePet } from "@/hooks/usePet";
import { useGameLoop } from "@/hooks/useGameLoop";
import { useNotifications } from "@/hooks/useNotifications";
import type { PetAnimationState } from "@/types/pet";
import type { IconId } from "@/components/tamagotchi/IconBar";
import {
  LcdIconRow,
  lcdBottomIcons,
  lcdMenuOrder,
  lcdTopIcons,
} from "@/components/tamagotchi/IconBar";
import { Device } from "@/components/tamagotchi/Device";
import { Screen } from "@/components/tamagotchi/Screen";
import { Pet } from "@/components/tamagotchi/Pet";
import { DeviceButtons } from "@/components/tamagotchi/Buttons";
import { StatsModal } from "@/components/tamagotchi/StatsModal";
import { FeedModal } from "@/components/tamagotchi/FeedModal";
import { GameModal } from "@/components/tamagotchi/GameModal";
import { NotificationsModal } from "@/components/tamagotchi/NotificationsModal";
import { Modal } from "@/components/ui/Modal";
import { playBeep } from "@/lib/sound";
import { usePetStore } from "@/stores/petStore";

export default function PlayPage() {
  const { pet, loading, error, refresh, doAction, rename, resetPet } = usePet();
  const setLast = usePetStore((s) => s.setLast);
  const { supported, subscribed, subscribe, unsubscribe } = useNotifications();

  const [activeIcon, setActiveIcon] = useState<IconId | null>("feed");
  const [notifOpen, setNotifOpen] = useState(false);
  const [notifDisableOpen, setNotifDisableOpen] = useState(false);
  const [statsOpen, setStatsOpen] = useState(false);
  const [feedOpen, setFeedOpen] = useState(false);
  const [gameOpen, setGameOpen] = useState(false);
  const [nameOpen, setNameOpen] = useState(false);
  const [nameDraft, setNameDraft] = useState("");
  const [overlayAnim, setOverlayAnim] = useState<PetAnimationState | null>(null);

  useEffect(() => {
    if (pet) setLast(pet);
  }, [pet, setLast]);

  useGameLoop(refresh, 50_000);

  useEffect(() => {
    if (!overlayAnim) return;
    const t = setTimeout(() => setOverlayAnim(null), 1800);
    return () => clearTimeout(t);
  }, [overlayAnim]);

  const petAnim = useMemo((): PetAnimationState => {
    if (overlayAnim) return overlayAnim;
    if (!pet) return "idle";
    if (!pet.is_alive) return "death";
    if (pet.stage === "egg") return "idle";
    if (pet.is_sick) return "sick";
    if (pet.is_sleeping && !pet.is_lights_on) return "sleeping";
    if (pet.happiness <= 1) return "sad";
    if (pet.hunger <= 1) return "sad";
    return "idle";
  }, [pet, overlayAnim]);

  const characterId = pet?.character_type ?? "egg";

  const haptics = () => {
    try {
      navigator.vibrate?.(12);
    } catch {
      /* no-op */
    }
  };

  const onIcon = useCallback(
    async (id: IconId) => {
      playBeep("ok");
      haptics();
      setActiveIcon(id);
      if (!pet?.is_alive) return;

      switch (id) {
        case "status":
          setStatsOpen(true);
          break;
        case "feed":
          setFeedOpen(true);
          break;
        case "light": {
          const p = await doAction("toggle_light");
          playBeep("low");
          setOverlayAnim(p.is_sleeping ? "sleeping" : "idle");
          break;
        }
        case "play":
          setGameOpen(true);
          break;
        case "medicine":
          await doAction("medicine");
          setOverlayAnim("happy");
          break;
        case "bath":
          await doAction("clean");
          setOverlayAnim("happy");
          break;
        case "discipline":
          await doAction("discipline");
          playBeep("low");
          break;
        case "attention":
          await doAction("attention");
          setOverlayAnim("happy");
          break;
        default:
          break;
      }
    },
    [pet, doAction],
  );

  const cycleMenu = useCallback(() => {
    const order = lcdMenuOrder;
    const i = activeIcon ? order.indexOf(activeIcon) : 0;
    setActiveIcon(order[(i + 1) % order.length]);
    playBeep("high");
  }, [activeIcon]);

  const confirmMenu = useCallback(() => {
    if (activeIcon) void onIcon(activeIcon);
  }, [activeIcon, onIcon]);

  async function signOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    window.location.href = "/login";
  }

  if (loading && !pet) {
    return (
      <div className="flex min-h-[70vh] flex-col items-center justify-center gap-4 bg-[#fff5f9]">
        <div className="h-14 w-14 animate-bounce rounded-full bg-pink-300" />
        <p className="text-pink-800/70">A carregar o teu tamagotchi…</p>
      </div>
    );
  }

  if (error || !pet) {
    return (
      <div className="flex min-h-[70vh] flex-col items-center justify-center gap-4 bg-[#fff5f9] px-4 text-center">
        <p className="text-pink-900">
          {error ?? "Configure o Supabase (.env) e rode o SQL em supabase/schema.sql."}
        </p>
        <Link href="/login" className="text-pink-600 underline">
          Voltar ao login
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-dvh bg-gradient-to-b from-[#fff5fc] via-[#ffe8f2] to-[#ffd6e8] px-3 py-6">
      <motion.header
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        className="mx-auto mb-4 flex max-w-md items-center justify-between gap-2"
      >
        <div>
          <h1 className="text-lg font-bold text-pink-950">Tamagotchi Web</h1>
          <p className="text-xs text-pink-800/65">
            {pet.name} {!pet.is_alive ? "… descansou" : `· ${pet.stage}`}
          </p>
        </div>
        <div className="flex flex-wrap justify-end gap-1">
          <button
            type="button"
            onClick={() =>
              subscribed ? setNotifDisableOpen(true) : setNotifOpen(true)
            }
            className={`btn-press rounded-full px-3 py-1.5 text-xs font-medium shadow-sm ring-1 ${
              subscribed
                ? "bg-green-50 text-green-700 ring-green-300"
                : "bg-white/80 text-pink-800 ring-pink-200"
            }`}
          >
            {subscribed ? "🔔 Ativas" : "Notificações"}
          </button>
          <button
            type="button"
            onClick={() => {
              setNameDraft(pet.name);
              setNameOpen(true);
            }}
            className="btn-press rounded-full bg-white/80 px-3 py-1.5 text-xs font-medium text-pink-800 shadow-sm ring-1 ring-pink-200"
          >
            Nome
          </button>
          <button
            type="button"
            onClick={() => void signOut()}
            className="btn-press rounded-full bg-pink-900/10 px-3 py-1.5 text-xs text-pink-900 active:bg-pink-900/20"
          >
            Sair
          </button>
        </div>
      </motion.header>

      <Device>
        <Screen
          topBar={
            pet.is_alive ? (
              <LcdIconRow
                icons={lcdTopIcons}
                active={activeIcon}
                onSelect={(id) => void onIcon(id)}
              />
            ) : undefined
          }
          bottomBar={
            pet.is_alive ? (
              <LcdIconRow
                icons={lcdBottomIcons}
                active={activeIcon}
                onSelect={(id) => void onIcon(id)}
              />
            ) : undefined
          }
        >
          {!pet.is_alive ? (
            <div className="flex flex-col items-center gap-3 px-2 text-center">
              <Pet characterId={characterId} animation="death" />
              <p className="text-sm font-medium text-green-900/90">
                O tamagotchi {pet.name} foi para o céu dos pixeis…
              </p>
              <button
                type="button"
                onClick={() => void resetPet().then(() => playBeep("ok"))}
                className="btn-press btn-press-raised rounded-full bg-pink-500 px-5 py-2 text-sm font-bold text-white"
              >
                Novo ovo
              </button>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-1">
              <Pet characterId={characterId} animation={petAnim} />
              <p className="font-[family-name:var(--font-geist-mono)] text-xs text-green-900/75">
                {pet.is_sleeping && !pet.is_lights_on
                  ? "zzz…"
                  : pet.is_sick
                    ? "snif…"
                    : ""}
              </p>
            </div>
          )}
        </Screen>
        <DeviceButtons
          onA={cycleMenu}
          onB={confirmMenu}
          onC={() => {
            setStatsOpen(false);
            setFeedOpen(false);
            setGameOpen(false);
            playBeep("low");
          }}
        />
      </Device>

      <NotificationsModal
        open={notifOpen}
        onClose={() => setNotifOpen(false)}
        supported={supported}
        subscribed={subscribed}
        onSubscribe={subscribe}
      />
      <Modal
        open={notifDisableOpen}
        onClose={() => setNotifDisableOpen(false)}
        title="Notificações"
      >
        <div className="space-y-4 text-pink-900/90">
          <p className="text-sm leading-relaxed">
            As notificações já estão ativas. Queres desativar? Deixarás de
            receber avisos no telemóvel quando o teu tamagotchi precisar de
            ti (podes voltar a ativar quando quiseres).
          </p>
          <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={() => setNotifDisableOpen(false)}
              className="btn-press order-2 rounded-2xl border-2 border-pink-200 bg-white px-4 py-2.5 text-sm font-semibold text-pink-800 sm:order-1"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={() =>
                void unsubscribe().then((ok) => {
                  setNotifDisableOpen(false);
                  if (ok) playBeep("ok");
                  else playBeep("low");
                })
              }
              className="btn-press btn-press-raised order-1 rounded-2xl bg-pink-500 px-4 py-2.5 text-sm font-semibold text-white sm:order-2"
            >
              Desativar
            </button>
          </div>
        </div>
      </Modal>
      <StatsModal open={statsOpen} onClose={() => setStatsOpen(false)} pet={pet} />
      <FeedModal
        open={feedOpen}
        onClose={() => setFeedOpen(false)}
        onMeal={async () => {
          await doAction("feed_meal");
          setOverlayAnim("eating");
          playBeep("ok");
        }}
        onSnack={async () => {
          await doAction("feed_snack");
          setOverlayAnim("eating");
          playBeep("high");
        }}
      />
      <GameModal
        open={gameOpen}
        onClose={() => setGameOpen(false)}
        onResult={async (won) => {
          await doAction("play", won);
          setOverlayAnim(won ? "happy" : "sad");
          playBeep(won ? "high" : "low");
        }}
      />

      <Modal open={nameOpen} onClose={() => setNameOpen(false)} title="Nome do tamagotchi">
        <form
          className="flex flex-col gap-3"
          onSubmit={(e) => {
            e.preventDefault();
            void rename(nameDraft.trim())
              .then(() => {
                setNameOpen(false);
                playBeep("ok");
              })
              .catch(() => playBeep("low"));
          }}
        >
          <input
            value={nameDraft}
            onChange={(e) => setNameDraft(e.target.value)}
            maxLength={20}
            className="rounded-2xl border-2 border-pink-200 px-3 py-2 text-pink-950 outline-none focus:border-pink-400"
            placeholder="Até 20 letras"
          />
          <button
            type="submit"
            className="btn-press btn-press-raised rounded-2xl bg-pink-500 py-2.5 font-semibold text-white"
          >
            Salvar
          </button>
        </form>
      </Modal>

      <p className="mx-auto mt-6 max-w-sm text-center text-[11px] text-pink-900/45">
        Dica: instale o Tamagotchi Web no ecrã inicial para o teu tamagotchi te avisar
        (Safari iOS 16.4+).
      </p>
    </div>
  );
}
