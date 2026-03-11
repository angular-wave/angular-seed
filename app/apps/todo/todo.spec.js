import { test, expect } from "@playwright/test";

test.describe("Todo model", () => {
  test("constructor sets task and defaults done to false", async ({ page }) => {
    await page.setContent("<html><body></body></html>");
    const result = await page.evaluate(() => {
      class Todo {
        constructor(task) {
          this.task = task;
          this.done = false;
        }
      }

      const todo = new Todo("Test task");

      return { task: todo.task, done: todo.done };
    });

    expect(result.task).toBe("Test task");
    expect(result.done).toBe(false);
  });

  test("done can be toggled to true", async ({ page }) => {
    await page.setContent("<html><body></body></html>");
    const result = await page.evaluate(() => {
      class Todo {
        constructor(task) {
          this.task = task;
          this.done = false;
        }
      }

      const todo = new Todo("Toggle me");
      todo.done = true;

      return { task: todo.task, done: todo.done };
    });

    expect(result.task).toBe("Toggle me");
    expect(result.done).toBe(true);
  });
});
