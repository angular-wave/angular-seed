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

test.describe("TodoController", () => {
  /** Inline the two classes so page.evaluate can use them */
  function injectTodoClasses() {
    return `
      class Todo {
        constructor(task) { this.task = task; this.done = false; }
      }
      class TodoController {
        constructor() {
          this.tasks = [
            new Todo("Learn AngularTS"),
            new Todo("Build an AngularTS app"),
          ];
        }
        add(task) { this.tasks.push(new Todo(task)); }
        archive() { this.tasks = this.tasks.filter(t => !t.done); }
      }
    `;
  }

  test("starts with 2 default tasks", async ({ page }) => {
    await page.setContent("<html><body></body></html>");
    const count = await page.evaluate(
      new Function(
        `${injectTodoClasses()} const c = new TodoController(); return c.tasks.length;`,
      ),
    );
    expect(count).toBe(2);
  });

  test("add() appends a new task", async ({ page }) => {
    await page.setContent("<html><body></body></html>");
    const result = await page.evaluate(
      new Function(`
        ${injectTodoClasses()}
        const c = new TodoController();
        c.add("New task");
        return { length: c.tasks.length, last: c.tasks[c.tasks.length - 1].task };
      `),
    );
    expect(result.length).toBe(3);
    expect(result.last).toBe("New task");
  });

  test("archive() removes completed tasks", async ({ page }) => {
    await page.setContent("<html><body></body></html>");
    const result = await page.evaluate(
      new Function(`
        ${injectTodoClasses()}
        const c = new TodoController();
        c.tasks[0].done = true;
        c.archive();
        return { length: c.tasks.length, remaining: c.tasks[0].task };
      `),
    );
    expect(result.length).toBe(1);
    expect(result.remaining).toBe("Build an AngularTS app");
  });

  test("archive() with no completed tasks removes nothing", async ({
    page,
  }) => {
    await page.setContent("<html><body></body></html>");
    const count = await page.evaluate(
      new Function(`
        ${injectTodoClasses()}
        const c = new TodoController();
        c.archive();
        return c.tasks.length;
      `),
    );
    expect(count).toBe(2);
  });
});
