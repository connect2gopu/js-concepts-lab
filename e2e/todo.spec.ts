import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

test.describe("Todo App — Happy Path", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/todo");
  });

  test("shows empty state on first visit", async ({ page }) => {
    await expect(page.getByText("No todos yet. Add one above!")).toBeVisible();
    await expect(page.getByRole("button", { name: "Add" })).toBeDisabled();
  });

  test("adds a todo item", async ({ page }) => {
    await page.getByLabel("New todo text").fill("Buy groceries");
    await page.getByRole("button", { name: "Add" }).click();

    await expect(page.getByText("Buy groceries")).toBeVisible();
    await expect(
      page.getByText("No todos yet. Add one above!")
    ).not.toBeVisible();
  });

  test("toggles a todo as completed — strikethrough + counter", async ({
    page,
  }) => {
    await page.getByLabel("New todo text").fill("Buy groceries");
    await page.getByRole("button", { name: "Add" }).click();

    await page
      .getByRole("checkbox", { name: /Mark "Buy groceries" as complete/ })
      .click();

    await expect(page.getByText("Buy groceries")).toHaveClass(/line-through/);
    await expect(page.getByText("1 / 1 completed")).toBeVisible();
  });

  test("deletes a todo item", async ({ page }) => {
    await page.getByLabel("New todo text").fill("Buy groceries");
    await page.getByRole("button", { name: "Add" }).click();

    await page
      .getByRole("button", { name: /Delete "Buy groceries"/ })
      .click();

    await expect(page.getByText("Buy groceries")).not.toBeVisible();
    await expect(page.getByText("No todos yet. Add one above!")).toBeVisible();
  });
});

test.describe("Todo App — Priority Badge", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/todo");
  });

  test("new todo shows medium priority badge", async ({ page }) => {
    await page.getByLabel("New todo text").fill("Check priority badge");
    await page.getByRole("button", { name: "Add" }).click();
    await expect(page.getByText("medium")).toBeVisible();
  });
});

test.describe("Todo App — Edge Cases", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/todo");
  });

  test("Add button is disabled when input is empty", async ({ page }) => {
    await expect(page.getByRole("button", { name: "Add" })).toBeDisabled();
    await expect(page.getByRole("listitem")).toHaveCount(0);
  });

  test("adds 5 todos — all render", async ({ page }) => {
    for (let i = 1; i <= 5; i++) {
      await page.getByLabel("New todo text").fill(`Todo item ${i}`);
      await page.getByRole("button", { name: "Add" }).click();
    }
    await expect(page.getByRole("listitem")).toHaveCount(5);
  });

  test("input clears after adding", async ({ page }) => {
    await page.getByLabel("New todo text").fill("Buy groceries");
    await page.getByRole("button", { name: "Add" }).click();
    await expect(page.getByLabel("New todo text")).toHaveValue("");
  });
});

test.describe("Todo App — Visual Regression", () => {
  test("empty state screenshot", async ({ page }) => {
    await page.goto("/todo");
    await expect(page).toHaveScreenshot("empty-state.png");
  });

  test("with todos screenshot — one completed", async ({ page }) => {
    await page.goto("/todo");
    await page.getByLabel("New todo text").fill("Buy groceries");
    await page.getByRole("button", { name: "Add" }).click();
    await page.getByLabel("New todo text").fill("Walk the dog");
    await page.getByRole("button", { name: "Add" }).click();
    await page
      .getByRole("checkbox", { name: /Mark "Buy groceries" as complete/ })
      .click();
    await expect(page).toHaveScreenshot("with-todos.png");
  });
});

test.describe("Todo App — Accessibility", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/todo");
    // Add an item so the full interactive UI is present for audit
    await page.getByLabel("New todo text").fill("Buy groceries");
    await page.getByRole("button", { name: "Add" }).click();
  });

  test("no automated accessibility violations", async ({ page }) => {
    const results = await new AxeBuilder({ page }).include("main").analyze();
    expect(results.violations).toEqual([]);
  });

  test("checkbox has accessible label", async ({ page }) => {
    await expect(
      page.getByRole("checkbox", { name: /Mark "Buy groceries"/ })
    ).toBeVisible();
  });

  test("delete button has aria-label", async ({ page }) => {
    await expect(
      page.getByRole("button", { name: /Delete "Buy groceries"/ })
    ).toBeVisible();
  });
});
