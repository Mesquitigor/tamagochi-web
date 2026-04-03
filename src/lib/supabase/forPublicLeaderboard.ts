import {
  createClient,
  type SupabaseClient,
} from "@supabase/supabase-js";
import { createClient as createServerClient } from "@/lib/supabase/server";

/**
 * Leitura do placar na página inicial / API: se existir
 * `SUPABASE_SERVICE_ROLE_KEY` (só servidor), usa cliente que ignora RLS —
 * necessário quando ainda não há políticas `anon` em `pet_records` / `profiles`.
 * Caso contrário, usa o cliente SSR (anon ou sessão), sujeito a RLS.
 */
export async function getSupabaseForPublicLeaderboard(): Promise<SupabaseClient> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();
  if (url && serviceKey) {
    return createClient(url, serviceKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });
  }
  return createServerClient();
}
