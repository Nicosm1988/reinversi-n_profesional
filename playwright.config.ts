import { defineConfig, devices } from "@playwright/test";

const isCI = Boolean(process.env.CI);

export default defineConfig({
  testDir: "tests/e2e",
  timeout: 45_000,
  fullyParallel: true,
  retries: isCI ? 2 : 0,
  workers: isCI ? 1 : undefined,
  reporter: isCI ? [["github"], ["html", { open: "never" }]] : "list",
  use: {
    baseURL: "http://127.0.0.1:3000",
    trace: "on-first-retry",
  },
  webServer: isCI
    ? {
        command: "npm run build && npm run start",
        url: "http://127.0.0.1:3000",
        timeout: 180_000,
        reuseExistingServer: false,
      }
    : {
        command: "npm run dev",
        url: "http://127.0.0.1:3000",
        timeout: 120_000,
        reuseExistingServer: true,
      },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
});