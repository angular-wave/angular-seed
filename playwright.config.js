import { defineConfig } from "@playwright/test";

const PORT = Number(process.env.PORT) || 4000;

export default defineConfig({
  testDir: "tests",
  timeout: 30_000,
  retries: 0,
  workers: 1,
  reporter: [["list"], ["html", { open: "never" }]],
  use: {
    headless: true,
  },
  projects: [
    {
      name: "unit",
      testMatch: "unit/**/*.test.js",
    },
    {
      name: "e2e",
      testMatch: "e2e/**/*.test.js",
      use: {
        baseURL: `http://localhost:${PORT}`,
      },
      webServer: {
        command: `make serve_test PORT=${PORT}`,
        port: PORT,
        reuseExistingServer: !process.env.CI,
        timeout: 30_000,
      },
    },
  ],
});
