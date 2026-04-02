import { createBrowserClient } from "@supabase/ssr";
import { getSupabaseEnvOrThrow } from "./env";

export function createClient() {
  const { url, anonKey } = getSupabaseEnvOrThrow();
  return createBrowserClient(url, anonKey);
}
