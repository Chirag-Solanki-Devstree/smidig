import { expect, test } from "@playwright/test";
import { collectConsoleErrors, expectAllClickablesHittable, signInAs } from "./helpers";

const ORGANIZER_ROUTES: [string, string][] = [
  ["/dashboard", "Overview"],
  ["/dashboard/tournaments", "Tournaments"],
  ["/dashboard/tournaments/new", "New tournament"],
  ["/dashboard/fixtures", "Fixtures"],
  ["/dashboard/teams", "Teams"],
  ["/dashboard/tickets", "Tickets"],
  ["/dashboard/sponsors", "Sponsors"],
  ["/dashboard/stalls", "Food stalls"],
  ["/dashboard/scoring", "Live scoring"],
  ["/dashboard/scan", "Gate scanner"],
  ["/dashboard/orders", "Orders"],
  ["/dashboard/payouts", "Payouts"],
];

const ADMIN_ROUTES: [string, string][] = [
  ["/admin", "Platform overview"],
  ["/admin/organizers", "Organizers"],
  ["/admin/fees", "Fee settings"],
  ["/admin/orders", "Orders & refunds"],
];

test.describe("organizer dashboard", () => {
  test.beforeEach(async ({ page }) => {
    await signInAs(page, "organizer");
  });

  for (const [path, heading] of ORGANIZER_ROUTES) {
    test(`${path} renders, no console errors, all clicks hittable`, async ({ page }) => {
      const errors = collectConsoleErrors(page);
      await page.goto(path);
      await expect(page.getByRole("heading", { name: heading, exact: true }).first()).toBeVisible();
      await expectAllClickablesHittable(page);
      expect(errors, errors.join("\n")).toEqual([]);
    });
  }

  test("sidebar navigates between sections", async ({ page }) => {
    await page.goto("/dashboard");
    await page.getByRole("link", { name: "Fixtures", exact: true }).click();
    await expect(page).toHaveURL(/\/dashboard\/fixtures$/);
    await page.getByRole("link", { name: "Payouts", exact: true }).click();
    await expect(page).toHaveURL(/\/dashboard\/payouts$/);
  });

  test("sidebar collapses, stays usable, and expands again", async ({ page }) => {
    await page.goto("/dashboard");
    const rail = page.locator("aside").first();
    const toggle = page.getByTestId("sidebar-toggle");

    const wide = (await rail.boundingBox())!.width;
    await toggle.click();
    await expect(toggle).toHaveAttribute("aria-label", "Expand sidebar");

    await expect
      .poll(async () => (await rail.boundingBox())!.width)
      .toBeLessThan(wide);

    // Collapsed links keep their title, so they must still navigate.
    await page.getByRole("link", { name: "Fixtures", exact: true }).click();
    await expect(page).toHaveURL(/\/dashboard\/fixtures$/);

    await toggle.click();
    await expect(toggle).toHaveAttribute("aria-label", "Collapse sidebar");
    await expect
      .poll(async () => (await rail.boundingBox())!.width)
      .toBe(wide);
  });

  test("scoring console updates the score", async ({ page }) => {
    await page.goto("/dashboard/scoring");
    const score = page.locator("p.font-mono").filter({ hasText: "/" }).first();
    await expect(score).toContainText("182");

    await page.getByRole("button", { name: "6", exact: true }).click();
    await expect(score).toContainText("188");

    await page.getByRole("button", { name: "4", exact: true }).click();
    await expect(score).toContainText("192");

    await page.getByRole("button", { name: "WICKET" }).click();
    await expect(score).toContainText("/5");
  });

  test("scoring undo removes the last ball", async ({ page }) => {
    await page.goto("/dashboard/scoring");
    const strip = page.locator("div.flex.items-center.justify-center.gap-1\\.5").first();
    const before = await strip.locator("> span").count();
    await page.getByRole("button", { name: "1", exact: true }).click();
    await page.getByRole("button", { name: /Undo/ }).click();
    await expect(strip.locator("> span")).toHaveCount(before);
  });

  test("creation wizard opens on step one and will not skip ahead empty", async ({ page }) => {
    await page.goto("/dashboard/tournaments/new");
    await expect(page.getByText("Step 1 of 7")).toBeVisible();

    // Validation holds the step until the required fields are filled.
    // tests/wizard.spec.ts walks the whole flow with real values.
    await page.getByTestId("continue").click();
    await expect(page.getByText("Step 1 of 7")).toBeVisible();
    await expect(page.getByTestId("name-error")).toBeVisible();
  });

  test("wizard sport picker: cricket on, others disabled", async ({ page }) => {
    await page.goto("/dashboard/tournaments/new");
    await expect(page.getByRole("button", { name: "Cricket", exact: true })).toBeEnabled();
    await expect(page.getByRole("button", { name: /Hockey \(soon\)/ })).toBeDisabled();
  });

  test("gate scanner pauses and resumes", async ({ page }) => {
    await page.goto("/dashboard/scan");
    await expect(page.getByText("Scanning…")).toBeVisible();
    await page.getByRole("button", { name: "Pause scanner" }).click();
    await expect(page.getByText("Paused")).toBeVisible();
    await page.getByRole("button", { name: "Resume scanner" }).click();
    await expect(page.getByText("Scanning…")).toBeVisible();
  });
});

test.describe("platform admin", () => {
  test.beforeEach(async ({ page }) => {
    await signInAs(page, "admin");
  });

  for (const [path, heading] of ADMIN_ROUTES) {
    test(`${path} renders, no console errors, all clicks hittable`, async ({ page }) => {
      const errors = collectConsoleErrors(page);
      await page.goto(path);
      await expect(page.getByRole("heading", { name: heading, exact: true }).first()).toBeVisible();
      await expectAllClickablesHittable(page);
      expect(errors, errors.join("\n")).toEqual([]);
    });
  }

  test("fee preview recalculates when the rule changes", async ({ page }) => {
    await page.goto("/admin/fees");
    const preview = page.locator("text=/On a .* ticket:/");
    await expect(preview).toContainText("₹1,055");

    await page.getByTestId("paidby-organizer").click();
    await expect(preview).toContainText("₹945");
  });
});
