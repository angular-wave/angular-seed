import { test, expect } from "@playwright/test";
test.describe("Todo app", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/apps/todo/todo.html");
  });
  test("loads and shows heading", async ({ page }) => {
    await expect(page.locator("h3")).toContainText("Todos");
  });
  test("renders default tasks", async ({ page }) => {
    const items = page.locator("li");
    await expect(items).toHaveCount(2);
    await expect(items.first()).toContainText("Learn AngularTS");
    await expect(items.nth(1)).toContainText("Build an AngularTS app");
  });
  test("can add a new task", async ({ page }) => {
    const input = page.locator('input[type="text"]');
    await input.fill("New E2E task");
    await page.locator('button[type="submit"]').click();
    const items = page.locator("li");
    await expect(items).toHaveCount(3);
    await expect(items.nth(2)).toContainText("New E2E task");
  });
  test("can mark a task done and archive it", async ({ page }) => {
    const firstCheckbox = page.locator('input[type="checkbox"]').first();
    await firstCheckbox.click();
    await page.locator("button", { hasText: "Archive" }).click();
    const items = page.locator("li");
    await expect(items).toHaveCount(1);
    await expect(items.first()).toContainText("Build an AngularTS app");
  });
});
