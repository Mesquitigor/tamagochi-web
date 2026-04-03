"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { motion } from "framer-motion";
import {
  friendlyAuthMessage,
  normalizeEmail,
  validateEmailForAuth,
  validatePasswordPresent,
} from "@/lib/auth/credentials";
import { AuthBackdrop } from "@/components/auth/AuthBackdrop";
import { createClient } from "@/lib/supabase/client";
import { hasSupabaseEnv, SUPABASE_ENV_HINT } from "@/lib/supabase/env";

export function LoginForm() {
  const router = useRouter();
  const search = useSearchParams();
  const next = search.get("next") ?? "/play";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [emailError, setEmailError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [msg, setMsg] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMsg(null);
    setEmailError(null);
    setPasswordError(null);

    const emailErr = validateEmailForAuth(email);
    const passErr = validatePasswordPresent(password);
    if (emailErr) setEmailError(emailErr);
    if (passErr) setPasswordError(passErr);
    if (emailErr || passErr) return;

    const emailNorm = normalizeEmail(email);
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.signInWithPassword({
        email: emailNorm,
        password,
      });
      if (error) {
        setMsg(friendlyAuthMessage(error.message));
        return;
      }
      router.push(next);
      router.refresh();
    } catch (err) {
      setMsg(
        friendlyAuthMessage(
          err instanceof Error ? err.message : "Erro ao iniciar sessão.",
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
          Entrar
        </h1>
        <p className="mb-6 text-center text-sm text-stone-700/70">
          Cuida do teu tamagotchi
        </p>
        {!hasSupabaseEnv() && (
          <p
            className="mb-4 rounded-2xl border border-amber-300 bg-amber-50 px-3 py-3 text-left text-xs leading-relaxed text-amber-950"
            role="status"
          >
            {SUPABASE_ENV_HINT}
          </p>
        )}
        {search.get("error") === "confirmacao" && (
          <p
            className="mb-4 rounded-2xl border border-red-200 bg-red-50 px-3 py-3 text-left text-sm text-red-800"
            role="alert"
          >
            Não foi possível confirmar o email (link inválido ou expirado).
            Tenta registar de novo com o mesmo email para receberes um novo
            link.
          </p>
        )}
        <form
          onSubmit={onSubmit}
          className="flex flex-col gap-3"
          noValidate
        >
          <div className="flex flex-col gap-1">
            <label htmlFor="login-email" className="sr-only">
              Email
            </label>
            <input
              id="login-email"
              type="email"
              name="email"
              autoComplete="email"
              inputMode="email"
              autoCapitalize="none"
              autoCorrect="off"
              spellCheck={false}
              aria-invalid={emailError ? true : undefined}
              aria-describedby={emailError ? "login-email-err" : undefined}
              aria-required
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setEmailError(null);
                setMsg(null);
              }}
              className={`rounded-2xl border-2 px-3 py-2.5 text-stone-900 outline-none focus:border-amber-400 ${
                emailError ? "border-red-300" : "border-stone-200"
              }`}
              placeholder="Email"
            />
            {emailError ? (
              <p id="login-email-err" className="text-sm text-red-600">
                {emailError}
              </p>
            ) : null}
          </div>
          <div className="flex flex-col gap-1">
            <label htmlFor="login-password" className="sr-only">
              Palavra-passe
            </label>
            <input
              id="login-password"
              type="password"
              name="password"
              autoComplete="current-password"
              aria-invalid={passwordError ? true : undefined}
              aria-describedby={passwordError ? "login-password-err" : undefined}
              aria-required
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setPasswordError(null);
                setMsg(null);
              }}
              className={`rounded-2xl border-2 px-3 py-2.5 text-stone-900 outline-none focus:border-amber-400 ${
                passwordError ? "border-red-300" : "border-stone-200"
              }`}
              placeholder="Palavra-passe"
            />
            {passwordError ? (
              <p id="login-password-err" className="text-sm text-red-600">
                {passwordError}
              </p>
            ) : null}
          </div>
          {msg && (
            <p className="text-center text-sm text-red-600" role="alert">
              {msg}
            </p>
          )}
          <button
            type="submit"
            className="btn-press btn-press-raised mt-1 rounded-2xl bg-amber-600 py-3 font-semibold text-white shadow-md shadow-amber-900/25"
          >
            Entrar
          </button>
        </form>
        <p className="mt-4 text-center text-sm text-stone-700/75">
          Sem conta?{" "}
          <Link href="/register" className="font-semibold text-amber-800 underline">
            Criar conta
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
