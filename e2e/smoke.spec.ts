import { test, expect } from "@playwright/test";

test.describe("smoke", () => {
  test("landing mostra Tamagotchi Web e Entrar", async ({ page }) => {
    await page.goto("/");
    await expect(
      page.getByRole("heading", { name: /Tamagotchi Web/i }),
    ).toBeVisible();
    await expect(page.getByRole("link", { name: "Entrar" })).toBeVisible();
  });

  test("página de login", async ({ page }) => {
    await page.goto("/login");
    await expect(
      page.getByRole("heading", { name: "Entrar" }),
    ).toBeVisible();
  });

  test("/play redireciona para login sem sessão", async ({ page }) => {
    await page.goto("/play");
    await expect(page).toHaveURL(/\/login/);
  });
});

test.describe("login E2E", () => {
  test("fluxo completo com credenciais de teste", async ({ page }) => {
    test.skip(
      !process.env.E2E_EMAIL || !process.env.E2E_PASSWORD,
      "Defina E2E_EMAIL e E2E_PASSWORD para este teste.",
    );
    await page.goto("/login");
    await page.getByPlaceholder("Email").fill(process.env.E2E_EMAIL!);
    await page.getByPlaceholder("Palavra-passe").fill(process.env.E2E_PASSWORD!);
    await page.getByRole("button", { name: "Entrar" }).click();
    await expect(page).toHaveURL(/\/play/, { timeout: 20_000 });
    await expect(
      page.getByRole("heading", { name: /Tamagotchi Web/i }),
    ).toBeVisible();
  });
});
