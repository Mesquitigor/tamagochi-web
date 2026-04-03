"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { motion } from "framer-motion";
import {
  friendlyAuthMessage,
  normalizeEmail,
  validateEmailForAuth,
  validatePasswordConfirmation,
} from "@/lib/auth/credentials";
import { AuthBackdrop } from "@/components/auth/AuthBackdrop";
import { createClient } from "@/lib/supabase/client";
import { hasSupabaseEnv, SUPABASE_ENV_HINT } from "@/lib/supabase/env";

export default function RegisterPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [emailError, setEmailError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [confirmError, setConfirmError] = useState<string | null>(null);
  const [msg, setMsg] = useState<string | null>(null);
  const [infoMsg, setInfoMsg] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMsg(null);
    setInfoMsg(null);
    setEmailError(null);
    setPasswordError(null);
    setConfirmError(null);

    const emailErr = validateEmailForAuth(email);
    const passErr = validatePasswordConfirmation(password, confirmPassword);
    if (emailErr) setEmailError(emailErr);
    if (passErr) {
      if (passErr.includes("coincidem") || passErr.includes("Repete")) {
        setConfirmError(passErr);
      } else {
        setPasswordError(passErr);
      }
    }
    if (emailErr || passErr) return;

    const emailNorm = normalizeEmail(email);
    try {
      const supabase = createClient();
      const origin =
        typeof window !== "undefined" ? window.location.origin : "";
      const { data, error } = await supabase.auth.signUp({
        email: emailNorm,
        password,
        options: {
          emailRedirectTo: origin ? `${origin}/auth/confirm` : undefined,
        },
      });
      if (error) {
        setMsg(friendlyAuthMessage(error.message));
        return;
      }
      if (!data.session) {
        setInfoMsg(
          "Enviámos um link de confirmação para o teu email. Abre-o para ativar a conta; depois usa Entrar com o mesmo email e palavra-passe.",
        );
        return;
      }
      router.push("/play");
      router.refresh();
    } catch (err) {
      setMsg(
        friendlyAuthMessage(
          err instanceof Error ? err.message : "Erro ao criar conta.",
        ),
      );
    }
  }

  return (
    <AuthBackdrop>
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-sm rounded-[2rem] border-4 border-stone-300/90 bg-white/88 p-6 shadow-2xl shadow-stone-900/15 backdrop-blur-md"
      >
        <h1 className="mb-1 text-center text-2xl font-bold text-stone-900">
          Criar conta
        </h1>
        <p className="mb-6 text-center text-sm text-stone-700/70">
          Um tamagotchi por utilizador
        </p>
        {!hasSupabaseEnv() && (
          <p
            className="mb-4 rounded-2xl border border-amber-300 bg-amber-50 px-3 py-3 text-left text-xs leading-relaxed text-amber-950"
            role="status"
          >
            {SUPABASE_ENV_HINT}
          </p>
        )}
        <form
          onSubmit={onSubmit}
          className="flex flex-col gap-3"
          noValidate
        >
          <div className="flex flex-col gap-1">
            <label htmlFor="register-email" className="sr-only">
              Email
            </label>
            <input
              id="register-email"
              type="email"
              name="email"
              autoComplete="email"
              inputMode="email"
              autoCapitalize="none"
              autoCorrect="off"
              spellCheck={false}
              aria-invalid={emailError ? true : undefined}
              aria-describedby={emailError ? "register-email-err" : undefined}
              aria-required
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setEmailError(null);
                setMsg(null);
                setInfoMsg(null);
              }}
              className={`rounded-2xl border-2 px-3 py-2.5 text-stone-900 outline-none focus:border-amber-400 ${
                emailError ? "border-red-300" : "border-stone-200"
              }`}
              placeholder="Email"
            />
            {emailError ? (
              <p id="register-email-err" className="text-sm text-red-600">
                {emailError}
              </p>
            ) : null}
          </div>
          <div className="flex flex-col gap-1">
            <label htmlFor="register-password" className="sr-only">
              Palavra-passe
            </label>
            <input
              id="register-password"
              type="password"
              name="password"
              autoComplete="new-password"
              aria-invalid={passwordError ? true : undefined}
              aria-describedby={
                passwordError ? "register-password-err" : undefined
              }
              aria-required
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setPasswordError(null);
                setConfirmError(null);
                setMsg(null);
                setInfoMsg(null);
              }}
              className={`rounded-2xl border-2 px-3 py-2.5 text-stone-900 outline-none focus:border-amber-400 ${
                passwordError ? "border-red-300" : "border-stone-200"
              }`}
              placeholder="Palavra-passe"
            />
            {passwordError ? (
              <p id="register-password-err" className="text-sm text-red-600">
                {passwordError}
              </p>
            ) : null}
          </div>
          <div className="flex flex-col gap-1">
            <label htmlFor="register-confirm" className="sr-only">
              Confirmar palavra-passe
            </label>
            <input
              id="register-confirm"
              type="password"
              name="confirm-password"
              autoComplete="new-password"
              aria-invalid={confirmError ? true : undefined}
              aria-describedby={
                confirmError ? "register-confirm-err" : undefined
              }
              aria-required
              value={confirmPassword}
              onChange={(e) => {
                setConfirmPassword(e.target.value);
                setConfirmError(null);
                setMsg(null);
                setInfoMsg(null);
              }}
              className={`rounded-2xl border-2 px-3 py-2.5 text-stone-900 outline-none focus:border-amber-400 ${
                confirmError ? "border-red-300" : "border-stone-200"
              }`}
              placeholder="Confirmar palavra-passe"
            />
            {confirmError ? (
              <p id="register-confirm-err" className="text-sm text-red-600">
                {confirmError}
              </p>
            ) : null}
          </div>
          {msg && (
            <p className="text-center text-sm text-red-600" role="alert">
              {msg}
            </p>
          )}
          {infoMsg && (
            <p
              className="rounded-2xl border border-emerald-200 bg-emerald-50 px-3 py-3 text-left text-sm leading-relaxed text-emerald-950"
              role="status"
            >
              {infoMsg}
            </p>
          )}
          <button
            type="submit"
            className="btn-press btn-press-raised mt-1 rounded-2xl bg-amber-600 py-3 font-semibold text-white shadow-md shadow-amber-900/25"
          >
            Registar
          </button>
        </form>
        <p className="mt-4 text-center text-sm text-stone-700/75">
          Já tens conta?{" "}
          <Link href="/login" className="font-semibold text-amber-800 underline">
            Entrar
          </Link>
        </p>
        <p className="mt-3 text-center">
          <Link href="/" className="text-xs text-stone-600/60 underline">
            Início
          </Link>
        </p>
      </motion.div>
    </AuthBackdrop>
  );
}
