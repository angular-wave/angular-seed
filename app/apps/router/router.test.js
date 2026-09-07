import { test, expect } from "@playwright/test";
test.describe("Router app", () => {
  test("loads and shows View text", async ({ page }) => {
    await page.goto("/apps/router/router.html");
    await expect(page.locator("body")).toContainText("View");
  });
  test("navigates to home state and shows links", async ({ page }) => {
    await page.goto("/apps/router/router.html");
    // The home state loads templateUrl: /apps/router/_home.html
    await expect(page.locator("ng-view")).toContainText("Home");
    await expect(page.getByRole("link", { name: "Page 1" })).toBeVisible();
    await expect(page.getByRole("link", { name: "Page 2" })).toBeVisible();
  });
  test("navigates to page1 via link", async ({ page }) => {
    await page.goto("/apps/router/router.html");
    await page.getByRole("link", { name: "Page 1" }).click();
    await expect(page.locator("ng-view")).toContainText(
      "NG-Router hello world",
    );
  });
  test("navigates to page2 via link", async ({ page }) => {
    await page.goto("/apps/router/router.html");
    await page.getByRole("link", { name: "Page 2" }).click();
    await expect(
      page
        .locator("ng-view")
        .getByRole("heading", { name: "Page 2", exact: true }),
    ).toBeVisible();
  });
});
