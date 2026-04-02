import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { NextRequest } from "next/server";

const createServerClientMock = vi.fn();

vi.mock("@supabase/ssr", () => ({
  createServerClient: (...args: unknown[]) => createServerClientMock(...args),
}));

import { proxy } from "@/proxy";

const origEnv = { ...process.env };

function req(url: string): NextRequest {
  return new NextRequest(new URL(url, "http://localhost:3000"));
}

beforeEach(() => {
  process.env.NEXT_PUBLIC_SUPABASE_URL = "https://test.supabase.co";
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = "test-anon-key";
  createServerClientMock.mockReset();
});

afterEach(() => {
  process.env = { ...origEnv };
});

describe("proxy", () => {
  it("redirect /play para /login quando sem utilizador", async () => {
    createServerClientMock.mockReturnValue({
      auth: {
        getUser: vi.fn().mockResolvedValue({ data: { user: null } }),
      },
    });
    const res = await proxy(req("http://localhost:3000/play"));
    expect(res.status).toBe(307);
    const loc = res.headers.get("location");
    expect(loc).toContain("/login");
    expect(loc).toContain("next=%2Fplay");
  });

  it("redirect /login para /play quando autenticado", async () => {
    createServerClientMock.mockReturnValue({
      auth: {
        getUser: vi
          .fn()
          .mockResolvedValue({ data: { user: { id: "u1" } } }),
      },
    });
    const res = await proxy(req("http://localhost:3000/login"));
    expect(res.status).toBe(307);
    expect(res.headers.get("location")).toMatch(/\/play/);
  });

  it("redirect /register para /play quando autenticado", async () => {
    createServerClientMock.mockReturnValue({
      auth: {
        getUser: vi
          .fn()
          .mockResolvedValue({ data: { user: { id: "u1" } } }),
      },
    });
    const res = await proxy(req("http://localhost:3000/register"));
    expect(res.status).toBe(307);
    expect(res.headers.get("location")).toMatch(/\/play/);
  });

  it("503 em produção sem variáveis Supabase", async () => {
    delete process.env.NEXT_PUBLIC_SUPABASE_URL;
    delete process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    const prev = process.env.NODE_ENV;
    process.env.NODE_ENV = "production";
    const res = await proxy(req("http://localhost:3000/login"));
    process.env.NODE_ENV = prev;
    process.env.NEXT_PUBLIC_SUPABASE_URL = "https://test.supabase.co";
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = "test-anon-key";
    expect(res.status).toBe(503);
    const text = await res.text();
    expect(text).toContain("Supabase");
  });
});
