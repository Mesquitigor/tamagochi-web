import { describe, it, expect, beforeEach, afterEach } from "vitest";
import {
  getSupabaseEnvOrThrow,
  hasSupabaseEnv,
  SUPABASE_ENV_HINT,
} from "@/lib/supabase/env";

const orig = { ...process.env };

describe("supabase env", () => {
  beforeEach(() => {
    process.env = { ...orig };
    delete process.env.NEXT_PUBLIC_SUPABASE_URL;
    delete process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  });

  afterEach(() => {
    process.env = { ...orig };
  });

  it("hasSupabaseEnv é false sem variáveis", () => {
    expect(hasSupabaseEnv()).toBe(false);
  });

  it("hasSupabaseEnv é true com URL e chave", () => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = "https://x.supabase.co";
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = "eyJhbGciOiJ.unit-test";
    expect(hasSupabaseEnv()).toBe(true);
  });

  it("ignora espaços em branco", () => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = "  ";
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = "key";
    expect(hasSupabaseEnv()).toBe(false);
  });

  it("getSupabaseEnvOrThrow lança com texto de ajuda", () => {
    expect(() => getSupabaseEnvOrThrow()).toThrow(SUPABASE_ENV_HINT);
  });

  it("getSupabaseEnvOrThrow devolve valores trimados", () => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = " https://a.supabase.co ";
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = " secret ";
    const c = getSupabaseEnvOrThrow();
    expect(c.url).toBe("https://a.supabase.co");
    expect(c.anonKey).toBe("secret");
  });
});
