import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/lib/supabase/server", () => ({
  createClient: vi.fn(),
}));

vi.mock("web-push", () => ({
  default: {
    setVapidDetails: vi.fn(),
    sendNotification: vi.fn().mockResolvedValue(undefined),
  },
}));

import { createClient } from "@/lib/supabase/server";
import { GET, PATCH } from "@/app/api/pets/route";
import { POST as POST_ACTION } from "@/app/api/pets/action/route";
import { POST as POST_RESET } from "@/app/api/pets/reset/route";
import { POST as POST_PUSH } from "@/app/api/push/subscribe/route";
import { dbPetRow } from "../helpers/dbRow";

const mockCreate = vi.mocked(createClient);

function supabaseForPetsGet(opts: {
  user: { id: string } | null;
  existing: Record<string, unknown> | null;
  created?: Record<string, unknown>;
}) {
  let n = 0;
  const created =
    opts.created ?? dbPetRow({ id: "p-new", user_id: opts.user?.id ?? "u1" });

  return {
    auth: {
      getUser: vi.fn().mockResolvedValue({ data: { user: opts.user } }),
    },
    from: vi.fn((table: string) => {
      if (table !== "pets")
        return { upsert: vi.fn().mockResolvedValue({ error: null }) };
      n += 1;
      if (n === 1) {
        return {
          select: vi.fn(() => ({
            eq: vi.fn(() => ({
              maybeSingle: vi
                .fn()
                .mockResolvedValue({ data: opts.existing, error: null }),
            })),
          })),
        };
      }
      if (!opts.existing && n === 2) {
        return {
          insert: vi.fn(() => ({
            select: vi.fn(() => ({
              single: vi.fn().mockResolvedValue({ data: created, error: null }),
            })),
          })),
        };
      }
      return {
        update: vi.fn(() => ({
          eq: vi.fn().mockResolvedValue({ error: null }),
        })),
      };
    }),
  };
}

function supabaseForPatch(opts: {
  user: { id: string } | null;
  updated: Record<string, unknown>;
  error?: { message: string } | null;
}) {
  return {
    auth: {
      getUser: vi.fn().mockResolvedValue({ data: { user: opts.user } }),
    },
    from: vi.fn(() => ({
      update: vi.fn(() => ({
        eq: vi.fn(() => ({
          select: vi.fn(() => ({
            single: vi.fn().mockResolvedValue({
              data: opts.updated,
              error: opts.error ?? null,
            }),
          })),
        })),
      })),
    })),
  };
}

function supabaseForAction(opts: {
  user: { id: string } | null;
  pet: Record<string, unknown>;
  updateError?: { message: string } | null;
}) {
  let n = 0;
  return {
    auth: {
      getUser: vi.fn().mockResolvedValue({ data: { user: opts.user } }),
    },
    from: vi.fn((table: string) => {
      if (table === "push_subscriptions") {
        return {
          select: vi.fn(() => ({
            eq: vi.fn().mockResolvedValue({ data: [], error: null }),
          })),
        };
      }
      n += 1;
      if (n === 1) {
        return {
          select: vi.fn(() => ({
            eq: vi.fn(() => ({
              single: vi
                .fn()
                .mockResolvedValue({ data: opts.pet, error: null }),
            })),
          })),
        };
      }
      return {
        update: vi.fn(() => ({
          eq: vi.fn().mockResolvedValue({ error: opts.updateError ?? null }),
        })),
      };
    }),
  };
}

function supabaseForReset(opts: {
  user: { id: string } | null;
  existing: Record<string, unknown> | null;
  updated: Record<string, unknown>;
}) {
  let petsCalls = 0;
  return {
    auth: {
      getUser: vi.fn().mockResolvedValue({ data: { user: opts.user } }),
    },
    from: vi.fn((table: string) => {
      if (table === "pet_records") {
        return {
          insert: vi.fn().mockResolvedValue({ error: null }),
        };
      }
      if (table !== "pets") {
        return {};
      }
      petsCalls += 1;
      if (petsCalls === 1) {
        return {
          select: vi.fn(() => ({
            eq: vi.fn(() => ({
              maybeSingle: vi
                .fn()
                .mockResolvedValue({ data: opts.existing, error: null }),
            })),
          })),
        };
      }
      return {
        update: vi.fn(() => ({
          eq: vi.fn(() => ({
            select: vi.fn(() => ({
              single: vi
                .fn()
                .mockResolvedValue({ data: opts.updated, error: null }),
            })),
          })),
        })),
      };
    }),
  };
}

function supabaseForPush(user: { id: string } | null) {
  return {
    auth: {
      getUser: vi.fn().mockResolvedValue({ data: { user } }),
    },
    from: vi.fn(() => ({
      upsert: vi.fn().mockResolvedValue({ error: null }),
    })),
  };
}

beforeEach(() => {
  mockCreate.mockReset();
  delete process.env.NEXT_PUBLIC_WEB_PUSH_PUBLIC_KEY;
  delete process.env.WEB_PUSH_PRIVATE_KEY;
});

describe("GET /api/pets", () => {
  it("401 sem utilizador", async () => {
    mockCreate.mockResolvedValue(
      supabaseForPetsGet({ user: null, existing: null }) as never,
    );
    const res = await GET();
    expect(res.status).toBe(401);
  });

  it("200 e insert quando não existe pet", async () => {
    const created = dbPetRow({ id: "p-new", user_id: "u1" });
    mockCreate.mockResolvedValue(
      supabaseForPetsGet({
        user: { id: "u1" },
        existing: null,
        created,
      }) as never,
    );
    const res = await GET();
    expect(res.status).toBe(200);
    const json = (await res.json()) as { pet: { id: string } };
    expect(json.pet).toBeDefined();
  });

  it("200 com pet existente", async () => {
    const existing = dbPetRow({ id: "p1" });
    mockCreate.mockResolvedValue(
      supabaseForPetsGet({ user: { id: "u1" }, existing }) as never,
    );
    const res = await GET();
    expect(res.status).toBe(200);
    const json = (await res.json()) as { pet: { id: string } };
    expect(json.pet.id).toBe("p1");
  });
});

describe("PATCH /api/pets", () => {
  it("400 nome vazio", async () => {
    mockCreate.mockResolvedValue(
      supabaseForPatch({
        user: { id: "u1" },
        updated: dbPetRow(),
      }) as never,
    );
    const res = await PATCH(
      new Request("http://localhost", {
        method: "PATCH",
        body: JSON.stringify({ name: "  " }),
      }),
    );
    expect(res.status).toBe(400);
  });

  it("200 nome válido", async () => {
    const updated = dbPetRow({ name: "Pipi" });
    mockCreate.mockResolvedValue(
      supabaseForPatch({ user: { id: "u1" }, updated }) as never,
    );
    const res = await PATCH(
      new Request("http://localhost", {
        method: "PATCH",
        body: JSON.stringify({ name: "Pipi" }),
      }),
    );
    expect(res.status).toBe(200);
    const json = (await res.json()) as { pet: { name: string } };
    expect(json.pet.name).toBe("Pipi");
  });

  it("400 patch vazio", async () => {
    mockCreate.mockResolvedValue(
      supabaseForPatch({ user: { id: "u1" }, updated: dbPetRow() }) as never,
    );
    const res = await PATCH(
      new Request("http://localhost", {
        method: "PATCH",
        body: JSON.stringify({}),
      }),
    );
    expect(res.status).toBe(400);
  });

  it("200 só cor", async () => {
    const updated = dbPetRow({ color_theme: "rosa" });
    mockCreate.mockResolvedValue(
      supabaseForPatch({ user: { id: "u1" }, updated }) as never,
    );
    const res = await PATCH(
      new Request("http://localhost", {
        method: "PATCH",
        body: JSON.stringify({ color_theme: "rosa" }),
      }),
    );
    expect(res.status).toBe(200);
    const json = (await res.json()) as { pet: { color_theme: string | null } };
    expect(json.pet.color_theme).toBe("rosa");
  });

  it("400 tema de cor inválido", async () => {
    mockCreate.mockResolvedValue(
      supabaseForPatch({ user: { id: "u1" }, updated: dbPetRow() }) as never,
    );
    const res = await PATCH(
      new Request("http://localhost", {
        method: "PATCH",
        body: JSON.stringify({ color_theme: "unicornio" }),
      }),
    );
    expect(res.status).toBe(400);
  });
});

describe("POST /api/pets/action", () => {
  it("401 sem auth", async () => {
    mockCreate.mockResolvedValue(
      supabaseForAction({
        user: null,
        pet: dbPetRow(),
      }) as never,
    );
    const res = await POST_ACTION(
      new Request("http://localhost", {
        method: "POST",
        body: JSON.stringify({ action: "feed_meal" }),
      }),
    );
    expect(res.status).toBe(401);
  });

  it("400 acção inválida", async () => {
    mockCreate.mockResolvedValue(
      supabaseForAction({ user: { id: "u1" }, pet: dbPetRow() }) as never,
    );
    const res = await POST_ACTION(
      new Request("http://localhost", {
        method: "POST",
        body: JSON.stringify({ action: "dance" }),
      }),
    );
    expect(res.status).toBe(400);
  });

  it("200 play com playGuess true aumenta felicidade", async () => {
    const pet = dbPetRow({ happiness: 3, weight: 15 });
    mockCreate.mockResolvedValue(
      supabaseForAction({ user: { id: "u1" }, pet }) as never,
    );
    const res = await POST_ACTION(
      new Request("http://localhost", {
        method: "POST",
        body: JSON.stringify({ action: "play", playGuess: true }),
      }),
    );
    expect(res.status).toBe(200);
    const json = (await res.json()) as { pet: { happiness: number } };
    expect(json.pet.happiness).toBeGreaterThanOrEqual(3);
  });
});

describe("POST /api/pets/reset", () => {
  it("200 repõe ovo", async () => {
    const egg = dbPetRow({
      stage: "egg",
      character_type: "egg",
      name: "Tamago",
      sex: null,
      color_theme: null,
    });
    const after = dbPetRow({
      ...egg,
      id: "p1",
      user_id: "u1",
    });
    mockCreate.mockResolvedValue(
      supabaseForReset({
        user: { id: "u1" },
        existing: egg,
        updated: after,
      }) as never,
    );
    const res = await POST_RESET();
    expect(res.status).toBe(200);
    const json = (await res.json()) as {
      pet: { stage: string; sex: string | null; color_theme: string | null };
    };
    expect(json.pet.stage).toBe("egg");
    expect(json.pet.sex).toBeNull();
    expect(json.pet.color_theme).toBeNull();
  });
});

describe("POST /api/push/subscribe", () => {
  it("400 sem endpoint", async () => {
    mockCreate.mockResolvedValue(
      supabaseForPush({ id: "u1" }) as never,
    );
    const res = await POST_PUSH(
      new Request("http://localhost", {
        method: "POST",
        body: JSON.stringify({ keys: { p256dh: "x", auth: "y" } }),
      }),
    );
    expect(res.status).toBe(400);
  });

  it("200 com corpo válido", async () => {
    mockCreate.mockResolvedValue(
      supabaseForPush({ id: "u1" }) as never,
    );
    const res = await POST_PUSH(
      new Request("http://localhost", {
        method: "POST",
        body: JSON.stringify({
          endpoint: "https://push.example/ep",
          keys: { p256dh: "a", auth: "b" },
        }),
      }),
    );
    expect(res.status).toBe(200);
  });
});
