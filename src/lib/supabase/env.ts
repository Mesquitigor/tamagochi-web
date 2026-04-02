/** Mensagem única para UI e logs quando faltam variáveis. */
export const SUPABASE_ENV_HINT =
  "Crie o ficheiro .env.local na raiz do projeto com NEXT_PUBLIC_SUPABASE_URL e NEXT_PUBLIC_SUPABASE_ANON_KEY. No Supabase: Project Settings → API (Project URL e anon public key). Copie .env.example e preencha com os valores reais.";

export function hasSupabaseEnv(): boolean {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim() ?? "";
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim() ?? "";
  return Boolean(url && anonKey);
}

export function getSupabaseEnvOrThrow(): { url: string; anonKey: string } {
  if (!hasSupabaseEnv()) {
    throw new Error(SUPABASE_ENV_HINT);
  }
  return {
    url: process.env.NEXT_PUBLIC_SUPABASE_URL!.trim(),
    anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!.trim(),
  };
}
