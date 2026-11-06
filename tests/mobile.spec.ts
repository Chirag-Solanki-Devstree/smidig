import { expect, test } from "@playwright/test";
import { expectAllClickablesHittable } from "./helpers";

test.describe("mobile", () => {
  test("bottom tab bar is present and navigates", async ({ page }) => {
    await page.goto("/");
    const tabs = page.locator("nav").filter({ hasText: "Tickets" }).last();
    await expect(tabs).toBeVisible();

    await page.getByRole("link", { name: "Live", exact: true }).click();
    await expect(page).toHaveURL(/\/live$/);
  });

  test("hamburger opens the mobile menu", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("button", { name: "Menu" }).click();
    await expect(page.getByRole("link", { name: "Browse", exact: true })).toBeVisible();
    await page.getByRole("link", { name: "Browse", exact: true }).click();
    await expect(page).toHaveURL(/\/tournaments$/);
  });

  test("home clickables are hittable on a phone", async ({ page }) => {
    await page.goto("/");
    await expectAllClickablesHittable(page);
  });

  test("tournament page is usable on a phone", async ({ page }) => {
    await page.goto("/t/deccan-premier-league-2026");
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    await expectAllClickablesHittable(page);
  });
});

test.describe("responsive hiding", () => {
  test("desktop-only nav CTA is hidden on a phone", async ({ page }) => {
    await page.goto("/");
    // Caught by hand: Button carries `inline-flex`, which beat a `hidden`
    // passed through className, so this stayed visible at every width.
    // Scope to the nav: the footer has its own "Host a tournament" link,
    // which is meant to be visible at every width.
    await expect(
      page.locator("header").getByRole("link", { name: /Host a tournament/ }),
    ).toBeHidden();
  });

  test("desktop nav links are hidden, hamburger is shown", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("button", { name: "Menu" })).toBeVisible();
    await expect(page.getByRole("link", { name: "Browse", exact: true })).toBeHidden();
  });

  test("live rail See all is hidden on a phone", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("link", { name: "See all", exact: true })).toBeHidden();
  });
});
