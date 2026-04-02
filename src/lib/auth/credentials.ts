/**
 * Validações comuns a formulários de autenticação (sem políticas de complexidade de password).
 */

const EMAIL_RE =
  /^[a-z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-z0-9](?:[a-z0-9-]*[a-z0-9])?(?:\.[a-z0-9](?:[a-z0-9-]*[a-z0-9])?)*$/i;

export function normalizeEmail(raw: string): string {
  return raw.trim().toLowerCase();
}

export function validateEmailForAuth(raw: string): string | null {
  const email = normalizeEmail(raw);
  if (!email) return "Indica o teu email.";
  if (email.length > 254) return "Este email é demasiado longo.";
  if (!EMAIL_RE.test(email)) return "Indica um email com formato válido.";
  return null;
}

export function validatePasswordPresent(password: string): string | null {
  if (password.length === 0) return "Indica a palavra-passe.";
  return null;
}

/** Mensagens do Supabase / rede ligeiramente mais claras para o utilizador. */
export function friendlyAuthMessage(message: string): string {
  const m = message.trim();
  const lower = m.toLowerCase();
  if (
    lower.includes("invalid login credentials") ||
    lower.includes("invalid credentials")
  ) {
    return "Email ou palavra-passe incorretos. Tenta outra vez.";
  }
  if (lower.includes("email not confirmed")) {
    return "Confirma o teu email antes de entrar (verifica a caixa de entrada).";
  }
  if (lower.includes("user already registered")) {
    return "Já existe uma conta com este email. Tenta entrar.";
  }
  if (lower.includes("password")) {
    if (lower.includes("at least") && lower.includes("character")) {
      return "A palavra-passe não cumpre o mínimo pedido pelo serviço. Escolhe outra.";
    }
  }
  if (
    lower.includes("network") ||
    lower.includes("fetch") ||
    lower.includes("failed to fetch")
  ) {
    return "Não foi possível ligar ao servidor. Verifica a ligação e tenta de novo.";
  }
  return m;
}
