import { beforeEach, describe, expect, it, vi } from "vitest";

const { sendNotification } = vi.hoisted(() => ({
  sendNotification: vi.fn().mockResolvedValue(undefined),
}));

vi.mock("@/lib/supabase/server", () => ({
  createClient: vi.fn(),
}));

vi.mock("web-push", () => ({
  default: {
    setVapidDetails: vi.fn(),
    sendNotification,
  },
}));

import { createClient } from "@/lib/supabase/server";
import { POST as POST_ACTION } from "@/app/api/pets/action/route";
import { dbPetRow } from "../helpers/dbRow";

const mockCreate = vi.mocked(createClient);

/** Segunda chamada a `from('pets')` é update; depois `push_subscriptions`. */
function supabaseForActionWithSubs(opts: {
  user: { id: string };
  pet: Record<string, unknown>;
  subscriptions: { endpoint: string; keys: { p256dh: string; auth: string } }[];
}) {
  let petsFromCount = 0;
  return {
    auth: {
      getUser: vi.fn().mockResolvedValue({ data: { user: opts.user } }),
    },
    from: vi.fn((table: string) => {
      if (table === "pets") {
        petsFromCount += 1;
        if (petsFromCount === 1) {
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
            eq: vi.fn().mockResolvedValue({ error: null }),
          })),
        };
      }
      if (table === "push_subscriptions") {
        return {
          select: vi.fn(() => ({
            eq: vi.fn().mockResolvedValue({
              data: opts.subscriptions,
              error: null,
            }),
          })),
        };
      }
      return {};
    }),
  };
}

beforeEach(() => {
  mockCreate.mockReset();
  sendNotification.mockClear();
  delete process.env.NEXT_PUBLIC_WEB_PUSH_PUBLIC_KEY;
  delete process.env.WEB_PUSH_PRIVATE_KEY;
});

describe("POST /api/pets/action + web push", () => {
  it("sem VAPID não chama sendNotification mesmo com gatilho e subscrições", async () => {
    const pet = dbPetRow({ is_sick: true });
    mockCreate.mockResolvedValue(
      supabaseForActionWithSubs({
        user: { id: "u1" },
        pet,
        subscriptions: [
          { endpoint: "https://push.test/ep", keys: { p256dh: "x", auth: "y" } },
        ],
      }) as never,
    );
    const res = await POST_ACTION(
      new Request("http://localhost", {
        method: "POST",
        body: JSON.stringify({ action: "feed_snack" }),
      }),
    );
    expect(res.status).toBe(200);
    expect(sendNotification).not.toHaveBeenCalled();
  });

  it("com VAPID e subscrições chama sendNotification quando estado gera alerta", async () => {
    process.env.NEXT_PUBLIC_WEB_PUSH_PUBLIC_KEY = "BK_test_public";
    process.env.WEB_PUSH_PRIVATE_KEY = "private_test_key";
    const pet = dbPetRow({ is_sick: true, hunger: 5, happiness: 5 });
    mockCreate.mockResolvedValue(
      supabaseForActionWithSubs({
        user: { id: "u1" },
        pet,
        subscriptions: [
          { endpoint: "https://push.test/ep42", keys: { p256dh: "p", auth: "a" } },
        ],
      }) as never,
    );
    const res = await POST_ACTION(
      new Request("http://localhost", {
        method: "POST",
        body: JSON.stringify({ action: "feed_snack" }),
      }),
    );
    expect(res.status).toBe(200);
    expect(sendNotification).toHaveBeenCalledTimes(1);
    const payload = JSON.parse(sendNotification.mock.calls[0][1] as string) as {
      title: string;
    };
    expect(payload.title).toBeTruthy();
  });
});
