import { test, expect } from "@playwright/test";

test.describe("Index page", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test("loads and shows heading", async ({ page }) => {
    await expect(page.locator("h1")).toContainText("AngularTS Seed");
  });

  test("displays version in footer", async ({ page }) => {
    const footer = page.locator("#footer");
    await expect(footer).toContainText("version:");
    // Version string should be non-empty (e.g. "0.16.0")
    await expect(footer).not.toContainText("version: }}");
  });

  test("has links to all sample apps", async ({ page }) => {
    const todoLink = page.locator('a[href="/apps/todo/todo.html"]');
    const routerLink = page.locator('a[href="/apps/router/router.html"]');
    const ionicLink = page.locator('a[href="/apps/ionic/ionic.html"]');

    await expect(todoLink).toBeVisible();
    await expect(routerLink).toBeVisible();
    await expect(ionicLink).toBeVisible();

    await expect(todoLink).toHaveText("Todo App");
    await expect(routerLink).toHaveText("Router App");
    await expect(ionicLink).toHaveText("Ionic App");
  });

  test("todo link navigates to todo app", async ({ page }) => {
    await page.locator('a[href="/apps/todo/todo.html"]').click();
    await expect(page).toHaveURL(/\/apps\/todo\/todo\.html/);
    await expect(page.locator("h3")).toContainText("Todos");
  });

  test("router link navigates to router app", async ({ page }) => {
    await page.locator('a[href="/apps/router/router.html"]').click();
    await expect(page).toHaveURL(/\/apps\/router\/router\.html/);
    await expect(page.locator("body")).toContainText("View");
  });

  test("has correct page title", async ({ page }) => {
    await expect(page).toHaveTitle("AngularTS Seed");
  });

  test("ng-cloak is removed after angular bootstraps", async ({ page }) => {
    // After Angular bootstraps, ng-cloak should be removed
    await expect(page.locator("body")).not.toHaveAttribute("ng-cloak");
  });
});
