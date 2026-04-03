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
import { SetupScreen } from "@/components/tamagotchi/SetupScreen";
import { NicknameSetupScreen } from "@/components/tamagotchi/NicknameSetupScreen";
import { ColorModal } from "@/components/tamagotchi/ColorModal";
import { LeaderboardModal } from "@/components/tamagotchi/LeaderboardModal";
import { ProfileModal } from "@/components/tamagotchi/ProfileModal";
import { FeedModal } from "@/components/tamagotchi/FeedModal";
import { GameModal } from "@/components/tamagotchi/GameModal";
import { NotificationsModal } from "@/components/tamagotchi/NotificationsModal";
import { Modal } from "@/components/ui/Modal";
import { playBeep } from "@/lib/sound";
import { usePetStore } from "@/stores/petStore";

export default function PlayPage() {
  const {
    pet,
    loading,
    error,
    refresh,
    doAction,
    updatePet,
    rename,
    resetPet,
    saveNickname,
  } = usePet();
  const setLast = usePetStore((s) => s.setLast);
  const { supported, subscribed, subscribe, unsubscribe } = useNotifications();

  const [activeIcon, setActiveIcon] = useState<IconId | null>("feed");
  const [notifOpen, setNotifOpen] = useState(false);
  const [notifDisableOpen, setNotifDisableOpen] = useState(false);
  const [statsOpen, setStatsOpen] = useState(false);
  const [feedOpen, setFeedOpen] = useState(false);
  const [gameOpen, setGameOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [profileBusy, setProfileBusy] = useState(false);
  const [colorOpen, setColorOpen] = useState(false);
  const [leaderboardOpen, setLeaderboardOpen] = useState(false);
  const [setupBusy, setSetupBusy] = useState(false);
  const [colorBusy, setColorBusy] = useState(false);
  const [overlayAnim, setOverlayAnim] = useState<PetAnimationState | null>(
    null,
  );
  type ProfileGateState =
    | { status: "loading" }
    | {
        status: "ready";
        nicknameSetupDone: boolean;
        nickname: string;
      };
  const [profileGate, setProfileGate] = useState<ProfileGateState>({
    status: "loading",
  });

  useEffect(() => {
    if (pet) setLast(pet);
  }, [pet, setLast]);

  useEffect(() => {
    if (!pet) return;
    let cancelled = false;
    setProfileGate({ status: "loading" });
    void fetch("/api/profile")
      .then(async (r) => {
        const j = (await r.json()) as {
          nickname?: string;
          nickname_setup_done?: boolean;
        };
        if (cancelled) return;
        if (!r.ok) {
          setProfileGate({
            status: "ready",
            nicknameSetupDone: false,
            nickname: "",
          });
          return;
        }
        setProfileGate({
          status: "ready",
          nicknameSetupDone: j.nickname_setup_done === true,
          nickname: j.nickname ?? "",
        });
      })
      .catch(() => {
        if (!cancelled) {
          setProfileGate({
            status: "ready",
            nicknameSetupDone: false,
            nickname: "",
          });
        }
      });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- só refetch quando muda pet.id (evitar cada tick do jogo)
  }, [pet?.id]);

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
          setOverlayAnim("scolded");
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
      <div className="flex min-h-[70vh] flex-col items-center justify-center gap-4 bg-[#faf7f2]">
        <div className="h-14 w-14 animate-bounce rounded-full bg-amber-500" />
        <p className="text-stone-700/70">A carregar o teu tamagotchi…</p>
      </div>
    );
  }

  if (error || !pet) {
    return (
      <div className="flex min-h-[70vh] flex-col items-center justify-center gap-4 bg-[#faf7f2] px-4 text-center">
        <p className="text-stone-800">
          {error ?? "Configure o Supabase (.env) e rode o SQL em supabase/schema.sql."}
        </p>
        <Link href="/login" className="text-amber-800 underline">
          Voltar ao login
        </Link>
      </div>
    );
  }

  if (profileGate.status === "loading") {
    return (
      <div className="flex min-h-dvh flex-col items-center justify-center gap-3 bg-gradient-to-b from-[#fdfcfa] via-[#f5f0e8] to-[#e8dfd4] px-4">
        <div className="h-12 w-12 animate-pulse rounded-full bg-amber-500/80" />
        <p className="text-sm text-stone-700/70">A preparar a tua conta…</p>
      </div>
    );
  }

  const needsNicknameOnboarding = !profileGate.nicknameSetupDone;

  if (needsNicknameOnboarding) {
    return (
      <div className="min-h-dvh bg-gradient-to-b from-[#fdfcfa] via-[#f5f0e8] to-[#e8dfd4] px-3 py-6">
        <motion.header
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="mx-auto mb-4 flex max-w-md items-center justify-between gap-2"
        >
          <div>
            <h1 className="text-lg font-bold text-stone-900">Tamagotchi Web</h1>
            <p className="text-xs text-stone-700/65">Primeiro passo · apelido</p>
          </div>
          <button
            type="button"
            onClick={() => void signOut()}
            className="btn-press rounded-full bg-stone-800/10 px-3 py-1.5 text-xs text-stone-800 active:bg-stone-800/20"
          >
            Sair
          </button>
        </motion.header>
        <Device shellThemeId={pet.color_theme}>
          <Screen>
            <NicknameSetupScreen
              busy={setupBusy}
              onSubmit={async (nickname) => {
                setSetupBusy(true);
                try {
                  await saveNickname(nickname);
                  setProfileGate({
                    status: "ready",
                    nicknameSetupDone: true,
                    nickname,
                  });
                  playBeep("ok");
                } finally {
                  setSetupBusy(false);
                }
              }}
            />
          </Screen>
        </Device>
      </div>
    );
  }

  const needsSetup = pet.sex === null;

  if (needsSetup) {
    return (
      <div className="min-h-dvh bg-gradient-to-b from-[#fdfcfa] via-[#f5f0e8] to-[#e8dfd4] px-3 py-6">
        <motion.header
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="mx-auto mb-4 flex max-w-md items-center justify-between gap-2"
        >
          <div>
            <h1 className="text-lg font-bold text-stone-900">Tamagotchi Web</h1>
            <p className="text-xs text-stone-700/65">Novo tamagotchi</p>
          </div>
          <button
            type="button"
            onClick={() => void signOut()}
            className="btn-press rounded-full bg-stone-800/10 px-3 py-1.5 text-xs text-stone-800 active:bg-stone-800/20"
          >
            Sair
          </button>
        </motion.header>
        <Device shellThemeId={pet.color_theme}>
          <Screen>
            <SetupScreen
              defaultName={pet.name}
              busy={setupBusy}
              onSubmit={async (name, sex) => {
                setSetupBusy(true);
                try {
                  await updatePet({ name, sex });
                  playBeep("ok");
                } finally {
                  setSetupBusy(false);
                }
              }}
            />
          </Screen>
        </Device>
      </div>
    );
  }

  return (
    <div className="min-h-dvh bg-gradient-to-b from-[#fdfcfa] via-[#f5f0e8] to-[#e8dfd4] px-3 py-6">
      <motion.header
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        className="mx-auto mb-4 flex max-w-md items-center justify-between gap-2"
      >
        <div>
          <h1 className="text-lg font-bold text-stone-900">Tamagotchi Web</h1>
          <p className="text-xs text-stone-700/65">
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
                : "bg-white/80 text-stone-700 ring-stone-200"
            }`}
          >
            {subscribed ? "🔔 Ativas" : "Notificações"}
          </button>
          <button
            type="button"
            onClick={() => setLeaderboardOpen(true)}
            className="btn-press rounded-full bg-white/80 px-3 py-1.5 text-xs font-medium text-stone-700 shadow-sm ring-1 ring-stone-200"
          >
            Placar
          </button>
          {pet.is_alive ? (
            <button
              type="button"
              onClick={() => setColorOpen(true)}
              className="btn-press rounded-full bg-white/80 px-3 py-1.5 text-xs font-medium text-stone-700 shadow-sm ring-1 ring-stone-200"
            >
              Cor
            </button>
          ) : null}
          <button
            type="button"
            onClick={() => setProfileOpen(true)}
            className="btn-press rounded-full bg-white/80 px-3 py-1.5 text-xs font-medium text-stone-700 shadow-sm ring-1 ring-stone-200"
          >
            Perfil
          </button>
          <button
            type="button"
            onClick={() => void signOut()}
            className="btn-press rounded-full bg-stone-800/10 px-3 py-1.5 text-xs text-stone-800 active:bg-stone-800/20"
          >
            Sair
          </button>
        </div>
      </motion.header>

      <Device shellThemeId={pet.color_theme}>
        <Screen
          topBar={
            pet.is_alive ? (
              <LcdIconRow
                icons={lcdTopIcons}
                active={activeIcon}
                onSelect={(id) => void onIcon(id)}
                lightsOn={pet.is_lights_on}
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
                className="btn-press btn-press-raised rounded-full bg-amber-600 px-5 py-2 text-sm font-bold text-white"
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
        <div className="space-y-4 text-stone-800/90">
          <p className="text-sm leading-relaxed">
            As notificações já estão ativas. Queres desativar? Deixarás de
            receber avisos no telemóvel quando o teu tamagotchi precisar de
            ti (podes voltar a ativar quando quiseres).
          </p>
          <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={() => setNotifDisableOpen(false)}
              className="btn-press order-2 rounded-2xl border-2 border-stone-200 bg-white px-4 py-2.5 text-sm font-semibold text-stone-700 sm:order-1"
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
              className="btn-press btn-press-raised order-1 rounded-2xl bg-amber-600 px-4 py-2.5 text-sm font-semibold text-white sm:order-2"
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
        characterId={pet.character_type}
        onResult={async (won) => {
          await doAction("play", won);
          setOverlayAnim(won ? "happy" : "sad");
          playBeep(won ? "high" : "low");
        }}
      />

      <ColorModal
        open={colorOpen}
        onClose={() => setColorOpen(false)}
        currentTheme={pet.color_theme}
        busy={colorBusy}
        onPick={async (id) => {
          setColorBusy(true);
          try {
            await updatePet({ color_theme: id });
            setColorOpen(false);
            playBeep("ok");
          } catch {
            playBeep("low");
          } finally {
            setColorBusy(false);
          }
        }}
      />
      <LeaderboardModal
        open={leaderboardOpen}
        onClose={() => setLeaderboardOpen(false)}
      />
      <ProfileModal
        open={profileOpen}
        onClose={() => setProfileOpen(false)}
        petName={pet.name}
        nickname={
          profileGate.status === "ready" ? profileGate.nickname : ""
        }
        busy={profileBusy}
        onSave={async ({ name, nickname }) => {
          setProfileBusy(true);
          try {
            await rename(name);
            await saveNickname(nickname);
            setProfileGate((prev) =>
              prev.status === "ready"
                ? { ...prev, nickname }
                : prev,
            );
            setProfileOpen(false);
            playBeep("ok");
          } catch {
            playBeep("low");
            throw new Error("Não foi possível guardar.");
          } finally {
            setProfileBusy(false);
          }
        }}
      />

      <p className="mx-auto mt-6 max-w-sm text-center text-[11px] text-stone-600/45">
        Dica: instale o Tamagotchi Web no ecrã inicial para o teu tamagotchi te avisar
        (Safari iOS 16.4+).
      </p>
    </div>
  );
}
