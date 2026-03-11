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
    await expect(page.locator('a[ng-sref="page1"]')).toBeVisible();
    await expect(page.locator('a[ng-sref="page2"]')).toBeVisible();
  });
  test("navigates to page1 via link", async ({ page }) => {
    await page.goto("/apps/router/router.html");
    await page.locator('a[ng-sref="page1"]').click();
    await expect(page.locator("ng-view")).toContainText(
      "NG-Router hello world",
    );
  });
});
