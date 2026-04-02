import { existsSync } from "fs";
import { config as loadEnv } from "dotenv";
import { defineConfig, devices } from "@playwright/test";

if (existsSync(".env.local")) {
  loadEnv({ path: ".env.local" });
}

/**
 * Defina PLAYWRIGHT_BASE_URL se a app não estiver em 127.0.0.1:3000.
 * Inicie o servidor antes dos testes: `npm run dev` ou `npm run start`.
 * Opcional: PLAYWRIGHT_START_SERVER=1 para subir `npm run dev` automaticamente.
 */
const baseURL = process.env.PLAYWRIGHT_BASE_URL ?? "http://127.0.0.1:3000";

export default defineConfig({
  testDir: "e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: "list",
  use: {
    baseURL,
    trace: "on-first-retry",
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  webServer: process.env.PLAYWRIGHT_START_SERVER
    ? {
        command: "npm run dev",
        url: baseURL,
        reuseExistingServer: true,
        timeout: 120_000,
      }
    : undefined,
});
