import { defineConfig } from "@playwright/test";

const PORT = Number(process.env.PORT) || 4000;
const useExternalServer = process.env.PLAYWRIGHT_EXTERNAL_SERVER === "1";

export default defineConfig({
  testDir: ".",
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
      testMatch: "app/**/*.spec.js",
    },
    {
      name: "e2e",
      testMatch: "app/**/*.test.js",
      use: {
        baseURL: `http://localhost:${PORT}`,
      },
      ...(useExternalServer
        ? {}
        : {
            webServer: {
              command: `make serve OPEN_BROWSER=0 PORT=${PORT}`,
              port: PORT,
              reuseExistingServer: !process.env.CI,
              timeout: 30_000,
            },
          }),
    },
  ],
});
