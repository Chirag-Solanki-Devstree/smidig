import { defineConfig, devices } from "@playwright/test";

const PORT = 3300;
const baseURL = `http://127.0.0.1:${PORT}`;

/** Separate from the test suite: this measures, it does not assert much. */
export default defineConfig({
  testDir: "./perf",
  workers: 1,
  retries: 0,
  timeout: 180_000,
  reporter: [["list"]],
  use: { baseURL, reducedMotion: "no-preference" },
  projects: [
    {
      name: "desktop",
      use: { ...devices["Desktop Chrome"], viewport: { width: 1440, height: 900 } },
      testIgnore: /phone/,
    },
    { name: "phone", use: { ...devices["Pixel 7"] }, testMatch: /phone/ },
  ],
  webServer: {
    command: `npx next start -p ${PORT}`,
    url: baseURL,
    reuseExistingServer: !process.env.CI,
    timeout: 180_000,
  },
});
