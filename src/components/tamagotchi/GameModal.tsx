"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Modal } from "@/components/ui/Modal";
import { Pet } from "@/components/tamagotchi/Pet";

const ROUNDS = 5;
const WINS_NEEDED = 3;

type Dir = "L" | "R";

function dirLabel(d: Dir): string {
  return d === "L" ? "esquerda" : "direita";
}

type GameScreen = "menu" | "gen1" | "gen2";

export function GameModal({
  open,
  onClose,
  onResult,
  characterId = "baby_cared",
}: {
  open: boolean;
  onClose: () => void;
  onResult: (won: boolean) => void;
  characterId?: string;
}) {
  return (
    <Modal open={open} onClose={onClose} title="Mini jogos">
      {open ? (
        <GameModalSession
          characterId={characterId}
          onClose={onClose}
          onResult={onResult}
        />
      ) : null}
    </Modal>
  );
}

function GameModalSession({
  characterId,
  onClose,
  onResult,
}: {
  characterId: string;
  onClose: () => void;
  onResult: (won: boolean) => void;
}) {
  const [screen, setScreen] = useState<GameScreen>("menu");

  return (
    <div className="space-y-3">
      {screen === "menu" ? (
        <GameMenu
          onPickGen1={() => setScreen("gen1")}
          onPickGen2={() => setScreen("gen2")}
        />
      ) : screen === "gen1" ? (
        <Gen1FacingGame
          characterId={characterId}
          onBack={() => setScreen("menu")}
          onClose={onClose}
          onResult={onResult}
        />
      ) : (
        <Gen2HigherLowerGame
          onBack={() => setScreen("menu")}
          onClose={onClose}
          onResult={onResult}
        />
      )}
    </div>
  );
}

function GameMenu({
  onPickGen1,
  onPickGen2,
}: {
  onPickGen1: () => void;
  onPickGen2: () => void;
}) {
  return (
    <>
      <p className="text-center text-sm text-stone-700/90">
        Dois jogos simples como nos Tamagotchi clássicos. Escolhe um.
      </p>
      <div className="flex flex-col gap-2">
        <button
          type="button"
          onClick={onPickGen1}
          className="btn-press flex items-center gap-3 rounded-2xl border-2 border-stone-200 bg-white px-4 py-3 text-left shadow-sm"
        >
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-stone-100 text-xl font-black text-stone-700">
            ⬅➡
          </span>
          <span>
            <span className="block text-sm font-bold text-stone-900">
              Gen 1 — O lado
            </span>
            <span className="text-xs text-stone-600">
              Adivinha se olha para a esquerda ou direita (A / B).
            </span>
          </span>
        </button>
        <button
          type="button"
          onClick={onPickGen2}
          className="btn-press flex items-center gap-3 rounded-2xl border-2 border-stone-200 bg-white px-4 py-3 text-left shadow-sm"
        >
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-stone-100 text-lg font-black tabular-nums text-stone-700">
            5×3
          </span>
          <span>
            <span className="block text-sm font-bold text-stone-900">
              Gen 2 — Maior ou menor
            </span>
            <span className="text-xs text-stone-600">
              Vês um número; adivinha se o próximo é maior ou menor.
            </span>
          </span>
        </button>
      </div>
    </>
  );
}

/** Três colunas: esq. | pet | dir. O lado certo acende no resultado. */
function Gen1PetStage({
  characterId,
  phase,
  outcome,
  hit,
}: {
  characterId: string;
  phase: "guessing" | "result";
  outcome?: Dir;
  hit?: boolean;
}) {
  const animation =
    phase === "result" ? (hit ? "happy" : "sad") : "idle";
  const leftLit = phase === "result" && outcome === "L";
  const rightLit = phase === "result" && outcome === "R";

  return (
    <div className="mx-auto mb-3 flex max-w-[320px] overflow-hidden rounded-2xl border-2 border-stone-300 bg-stone-100/80 shadow-inner">
      <div
        className={`flex min-h-[112px] flex-1 flex-col items-center justify-center gap-0.5 px-2 py-2 transition-all duration-300 ${
          leftLit
            ? "bg-amber-100 ring-2 ring-inset ring-amber-500"
            : "bg-stone-50/90"
        }`}
      >
        <span className="text-3xl leading-none" aria-hidden>
          ⬅
        </span>
        <span className="text-center text-[10px] font-extrabold uppercase leading-tight text-stone-700">
          Esquerda
        </span>
      </div>
      <div className="flex w-[104px] shrink-0 flex-col items-center justify-center border-x border-stone-200 bg-white py-2">
        <p className="mb-1 text-center text-[10px] font-semibold uppercase tracking-wide text-stone-500">
          {phase === "guessing" ? "Onde olha?" : "Ficou…"}
        </p>
        <motion.div
          className="relative flex h-[88px] w-[88px] items-center justify-center"
          style={{ transformOrigin: "50% 50%" }}
          animate={
            phase === "guessing"
              ? { scale: [1, 1.04, 1], y: [0, -2, 0] }
              : { scaleX: outcome === "L" ? 1 : -1, scaleY: 1, y: 0 }
          }
          transition={
            phase === "guessing"
              ? { duration: 1.3, repeat: Infinity, ease: "easeInOut" }
              : { type: "spring", stiffness: 440, damping: 29 }
          }
        >
          <div className="origin-center scale-[0.58]">
            <Pet characterId={characterId} animation={animation} />
          </div>
        </motion.div>
        {phase === "result" && outcome != null ? (
          <p className="mt-1 px-1 text-center text-[11px] font-bold text-stone-800">
            {outcome === "L" ? "← Esquerda" : "Direita →"}
          </p>
        ) : null}
      </div>
      <div
        className={`flex min-h-[112px] flex-1 flex-col items-center justify-center gap-0.5 px-2 py-2 transition-all duration-300 ${
          rightLit
            ? "bg-amber-100 ring-2 ring-inset ring-amber-500"
            : "bg-stone-50/90"
        }`}
      >
        <span className="text-3xl leading-none" aria-hidden>
          ➡
        </span>
        <span className="text-center text-[10px] font-extrabold uppercase leading-tight text-stone-700">
          Direita
        </span>
      </div>
    </div>
  );
}

function Gen1FacingGame({
  characterId,
  onBack,
  onClose,
  onResult,
}: {
  characterId: string;
  onBack: () => void;
  onClose: () => void;
  onResult: (won: boolean) => void;
}) {
  const [roundIndex, setRoundIndex] = useState(0);
  const [playerWins, setPlayerWins] = useState(0);
  const [reveal, setReveal] = useState<{
    outcome: Dir;
    guess: Dir;
    hit: boolean;
    scoreAfter: number;
    isLast: boolean;
  } | null>(null);

  useEffect(() => {
    if (!reveal) return;
    const id = window.setTimeout(() => {
      if (reveal.isLast) {
        onResult(reveal.scoreAfter >= WINS_NEEDED);
        onClose();
        return;
      }
      setPlayerWins(reveal.scoreAfter);
      setRoundIndex((i) => i + 1);
      setReveal(null);
    }, 1200);
    return () => window.clearTimeout(id);
  }, [reveal, onClose, onResult]);

  function pick(guess: Dir) {
    if (reveal !== null) return;
    const outcome: Dir = Math.random() > 0.5 ? "L" : "R";
    const hit = guess === outcome;
    const scoreAfter = playerWins + (hit ? 1 : 0);
    const isLast = roundIndex >= ROUNDS - 1;
    setReveal({ outcome, guess, hit, scoreAfter, isLast });
  }

  return (
    <>
      <button
        type="button"
        onClick={onBack}
        className="btn-press w-full rounded-xl border border-stone-200 bg-stone-50 py-2 text-xs font-semibold text-stone-700"
      >
        ← Outros jogos
      </button>
      <p className="text-center text-xs text-stone-600">
        {ROUNDS} rondas · {WINS_NEEDED}+ acertos para ganhar · O painel{" "}
        <span className="font-semibold text-amber-800">âmbar</span> mostra o
        lado onde ficou a olhar.
      </p>

      <Gen1PetStage
        characterId={characterId}
        phase={reveal === null ? "guessing" : "result"}
        outcome={reveal?.outcome}
        hit={reveal?.hit}
      />

      {reveal === null ? (
        <>
          <p
            className="mb-2 text-center text-sm font-semibold text-stone-800"
            aria-live="polite"
          >
            Ronda {roundIndex + 1}/{ROUNDS} · Acertos: {playerWins}
          </p>
          <div className="flex justify-center gap-3">
            <motion.button
              type="button"
              transition={{ type: "spring", stiffness: 500, damping: 26 }}
              whileTap={{
                scale: 0.92,
                y: 3,
                boxShadow: "0 1px 0 rgb(180 83 9 / 0.35)",
              }}
              style={{ boxShadow: "0 4px 0 rgb(180 83 9 / 0.25)" }}
              onClick={() => pick("L")}
              className="h-[4.25rem] min-w-[6rem] rounded-2xl border-2 border-stone-300 bg-white text-base font-bold text-stone-800"
            >
              A · esquerda
            </motion.button>
            <motion.button
              type="button"
              transition={{ type: "spring", stiffness: 500, damping: 26 }}
              whileTap={{
                scale: 0.92,
                y: 3,
                boxShadow: "0 1px 0 rgb(180 83 9 / 0.35)",
              }}
              style={{ boxShadow: "0 4px 0 rgb(180 83 9 / 0.25)" }}
              onClick={() => pick("R")}
              className="h-[4.25rem] min-w-[6rem] rounded-2xl border-2 border-stone-300 bg-white text-base font-bold text-stone-800"
            >
              B · direita
            </motion.button>
          </div>
        </>
      ) : (
        <div
          className="space-y-2 rounded-2xl border border-stone-200 bg-stone-50/90 px-3 py-3 text-center"
          role="status"
          aria-live="polite"
        >
          <p className="text-sm font-semibold text-stone-800">
            Olhou para a <strong>{dirLabel(reveal.outcome)}</strong> — tu
            apostaste na <strong>{dirLabel(reveal.guess)}</strong>.
          </p>
          <p
            className={`text-base font-bold ${
              reveal.hit ? "text-amber-800" : "text-stone-500"
            }`}
          >
            {reveal.hit ? "Acertaste!" : "Erraste."}
          </p>
          <ScoreSummary
            score={reveal.scoreAfter}
            isLast={reveal.isLast}
            wonGame={reveal.scoreAfter >= WINS_NEEDED}
          />
        </div>
      )}
    </>
  );
}

/** Base 3–7 para sempre existir pelo menos um número maior e um menor em 1–9. */
function randomMiddleCurrent(): number {
  return 3 + Math.floor(Math.random() * 5);
}

function randomOtherThan(current: number): number {
  const pool = [1, 2, 3, 4, 5, 6, 7, 8, 9].filter((n) => n !== current);
  return pool[Math.floor(Math.random() * pool.length)]!;
}

function Gen2HigherLowerGame({
  onBack,
  onClose,
  onResult,
}: {
  onBack: () => void;
  onClose: () => void;
  onResult: (won: boolean) => void;
}) {
  const [roundIndex, setRoundIndex] = useState(0);
  const [playerWins, setPlayerWins] = useState(0);
  const [current, setCurrent] = useState(() => randomMiddleCurrent());
  const [reveal, setReveal] = useState<{
    next: number;
    guessHigher: boolean;
    hit: boolean;
    scoreAfter: number;
    isLast: boolean;
  } | null>(null);

  useEffect(() => {
    if (!reveal) return;
    const id = window.setTimeout(() => {
      if (reveal.isLast) {
        onResult(reveal.scoreAfter >= WINS_NEEDED);
        onClose();
        return;
      }
      setPlayerWins(reveal.scoreAfter);
      setRoundIndex((i) => i + 1);
      setCurrent(randomMiddleCurrent());
      setReveal(null);
    }, 1150);
    return () => window.clearTimeout(id);
  }, [reveal, onClose, onResult]);

  function pick(guessHigher: boolean) {
    if (reveal !== null) return;
    const second = randomOtherThan(current);
    const trulyHigher = second > current;
    const hit =
      (guessHigher && trulyHigher) || (!guessHigher && !trulyHigher);
    const scoreAfter = playerWins + (hit ? 1 : 0);
    const isLast = roundIndex >= ROUNDS - 1;
    setReveal({
      next: second,
      guessHigher,
      hit,
      scoreAfter,
      isLast,
    });
  }

  return (
    <>
      <button
        type="button"
        onClick={onBack}
        className="btn-press w-full rounded-xl border border-stone-200 bg-stone-50 py-2 text-xs font-semibold text-stone-700"
      >
        ← Outros jogos
      </button>
      <p className="text-center text-xs text-stone-600">
        Estilo Tamagotchi Gen 2: compara números. Sem empates no sorteio.
      </p>

      {reveal === null ? (
        <>
          <div className="mx-auto flex w-36 flex-col items-center rounded-2xl border-4 border-stone-600 bg-[#c8dcc8] py-4 shadow-[inset_0_2px_0_rgba(255,255,255,0.35)]">
            <span className="text-[10px] font-bold uppercase text-stone-600">
              Número
            </span>
            <span className="font-mono text-5xl font-black tabular-nums text-stone-900">
              {current}
            </span>
          </div>
          <p className="text-center text-sm font-semibold text-stone-800">
            Ronda {roundIndex + 1}/{ROUNDS} · Acertos: {playerWins}
          </p>
          <p className="text-center text-xs text-stone-600">
            O próximo (1–9) é <strong>maior</strong> ou <strong>menor</strong>{" "}
            que {current}?
          </p>
          <div className="flex justify-center gap-3">
            <motion.button
              type="button"
              whileTap={{ scale: 0.92 }}
              onClick={() => pick(true)}
              className="btn-press h-14 min-w-[6.5rem] rounded-2xl border-2 border-stone-300 bg-white text-sm font-bold text-stone-800 shadow-[0_4px_0_rgb(120_53_15/0.2)]"
            >
              A · maior
            </motion.button>
            <motion.button
              type="button"
              whileTap={{ scale: 0.92 }}
              onClick={() => pick(false)}
              className="btn-press h-14 min-w-[6.5rem] rounded-2xl border-2 border-stone-300 bg-white text-sm font-bold text-stone-800 shadow-[0_4px_0_rgb(120_53_15/0.2)]"
            >
              B · menor
            </motion.button>
          </div>
        </>
      ) : (
        <div
          className="space-y-3 rounded-2xl border border-stone-200 bg-stone-50/90 px-3 py-4 text-center"
          role="status"
        >
          <div className="mx-auto flex items-end justify-center gap-3">
            <div className="flex flex-col items-center">
              <span className="text-[10px] text-stone-500">Antes</span>
              <span className="font-mono text-3xl font-bold tabular-nums text-stone-700">
                {current}
              </span>
            </div>
            <span className="pb-2 text-xl text-stone-400">→</span>
            <div className="flex flex-col items-center">
              <span className="text-[10px] text-stone-500">Sorteio</span>
              <motion.span
                initial={{ scale: 0.6, opacity: 0.5 }}
                animate={{ scale: 1, opacity: 1 }}
                className="font-mono text-4xl font-black tabular-nums text-amber-900"
              >
                {reveal.next}
              </motion.span>
            </div>
          </div>
          <p className="text-sm text-stone-800">
            Apostaste <strong>{reveal.guessHigher ? "maior" : "menor"}</strong>.
          </p>
          <p
            className={`text-base font-bold ${
              reveal.hit ? "text-amber-800" : "text-stone-500"
            }`}
          >
            {reveal.hit ? "Acertaste!" : "Erraste."}
          </p>
          <ScoreSummary
            score={reveal.scoreAfter}
            isLast={reveal.isLast}
            wonGame={reveal.scoreAfter >= WINS_NEEDED}
          />
        </div>
      )}
    </>
  );
}

function ScoreSummary({
  score,
  isLast,
  wonGame,
}: {
  score: number;
  isLast: boolean;
  wonGame: boolean;
}) {
  return (
    <p className="text-xs text-stone-600">
      Marcador: {score}/{ROUNDS}
      {isLast ? (
        <>
          <br />
          <span className="mt-1 inline-block font-semibold text-stone-800">
            {wonGame ? "Ganhaste o jogo!" : "Não chegaste aos 3 acertos."}
          </span>
        </>
      ) : null}
    </p>
  );
}
