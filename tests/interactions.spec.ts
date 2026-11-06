import { expect, test } from "@playwright/test";
import { signInAs } from "./helpers";

/**
 * Every control that has no backend must still answer the click.
 * These tests are what prove "nothing happens when I click" is fixed.
 */

const toast = (page: import("@playwright/test").Page) => page.getByTestId("toast").first();

test.describe("public actions respond", () => {
  test("ticket type is selectable and Get tickets confirms", async ({ page }) => {
    await page.goto("/t/deccan-premier-league-2026/m/14");

    const general = page.getByRole("button", { name: /General/ });
    await general.click();
    await expect(general).toHaveAttribute("aria-pressed", "true");

    await page.getByTestId("get-tickets").click();
    await expect(toast(page)).toContainText("Ticket reserved");
  });

  test("share copies a link", async ({ page }) => {
    await page.goto("/t/deccan-premier-league-2026/m/14");
    await page.getByRole("button", { name: /Share this match/ }).click();
    await expect(toast(page)).toContainText("Link copied");
  });

  test("sponsor package can be bought", async ({ page }) => {
    await page.goto("/t/deccan-premier-league-2026");
    await page.getByRole("button", { name: "Sponsors", exact: true }).click();
    await page.getByRole("button", { name: "Buy this package" }).first().click();
    await expect(toast(page)).toContainText("package reserved");
  });

  test("stall must be picked before booking, then books", async ({ page }) => {
    await page.goto("/t/deccan-premier-league-2026");
    await page.getByRole("button", { name: "Food & stalls", exact: true }).click();

    const book = page.getByRole("button", { name: /Pick a stall on the map/ });
    await expect(book).toBeDisabled();

    await page.getByRole("button", { name: /^A3/ }).click();
    const booked = page.getByRole("button", { name: /Book stall A3/ });
    await expect(booked).toBeEnabled();
    await booked.click();
    await expect(toast(page)).toContainText("Stall A3 held");
  });

  test("registration payment confirms", async ({ page }) => {
    await page.goto("/t/deccan-premier-league-2026/register");
    for (let i = 0; i < 3; i++) await page.getByRole("button", { name: "Continue" }).click();
    await page.getByTestId("pay").click();
    await expect(toast(page)).toContainText("Entry confirmed");
    await expect(page.getByTestId("pay")).toContainText("Paid");
  });

  test("hero search goes to browse", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("button", { name: "Search", exact: true }).click();
    await expect(page).toHaveURL(/\/tournaments$/);
  });

  test("footer links go to real routes", async ({ page }) => {
    await page.goto("/");
    const link = page.getByRole("link", { name: "Styleguide", exact: true });
    await link.scrollIntoViewIfNeeded();
    await link.click();
    await expect(page).toHaveURL(/\/styleguide$/);
  });

  test("host page waitlist form responds", async ({ page }) => {
    await page.goto("/host");
    await page.getByPlaceholder("you@yourleague.com").fill("me@club.com");
    await page.getByRole("button", { name: /Start free/ }).last().click();
    await expect(toast(page)).toContainText("You are on the list");
  });
});

test.describe("organizer actions respond", () => {
  test.beforeEach(async ({ page }) => signInAs(page, "organizer"));

  test("approve a team", async ({ page }) => {
    await page.goto("/dashboard/teams");
    await page.getByRole("button", { name: "Approve" }).first().click();
    await expect(toast(page)).toContainText("Thane Titans approved");
  });

  test("reject a team", async ({ page }) => {
    await page.goto("/dashboard/teams");
    await page.getByRole("button", { name: "Reject" }).first().click();
    await expect(toast(page)).toContainText("rejected");
  });

  test("unpaid team cannot be approved", async ({ page }) => {
    await page.goto("/dashboard/teams");
    const row = page.locator("tr", { hasText: "Dadar Dragons" });
    await expect(row.getByRole("button", { name: "Approve" })).toBeDisabled();
  });

  test("export orders", async ({ page }) => {
    await page.goto("/dashboard/orders");
    await page.getByRole("button", { name: /Export CSV/ }).click();
    await expect(toast(page)).toContainText("Export queued");
  });

  test("regenerate fixtures", async ({ page }) => {
    await page.goto("/dashboard/fixtures");
    await page.getByRole("button", { name: /Regenerate/ }).click();
    await expect(toast(page)).toContainText("Fixtures regenerated");
  });

  test("open stripe", async ({ page }) => {
    await page.goto("/dashboard/payouts");
    await page.getByRole("button", { name: /Open Stripe/ }).click();
    await expect(toast(page)).toContainText("Stripe Express login");
  });

  test("add a sponsor tier", async ({ page }) => {
    await page.goto("/dashboard/sponsors");
    await page.getByRole("button", { name: /Add a tier/ }).click();
    await expect(toast(page)).toContainText("New sponsor tier");
  });

  test("new ticket type", async ({ page }) => {
    await page.goto("/dashboard/tickets");
    await page.getByRole("button", { name: /New ticket type/ }).click();
    await expect(toast(page)).toContainText("New ticket type");
  });

  test("end innings from the scoring console", async ({ page }) => {
    await page.goto("/dashboard/scoring");
    await page.getByRole("button", { name: /End innings/ }).click();
    await expect(toast(page)).toContainText("Innings ended");
  });

  test("publish a tournament from the wizard", async ({ page }) => {
    await page.goto("/dashboard/tournaments/new");
    for (let i = 0; i < 6; i++) {
      await page.getByRole("button", { name: "Save and continue" }).click();
    }
    await page.getByTestId("publish").click();
    await expect(toast(page)).toContainText("Tournament published");
    await expect(page.getByTestId("publish")).toContainText("Published");
  });
});

test.describe("admin actions respond", () => {
  test.beforeEach(async ({ page }) => signInAs(page, "admin"));

  test("approve an organizer", async ({ page }) => {
    await page.goto("/admin/organizers");
    await page.getByRole("button", { name: "Approve" }).first().click();
    await expect(toast(page)).toContainText("approved");
  });

  test("suspend an organizer", async ({ page }) => {
    await page.goto("/admin/organizers");
    await page.getByRole("button", { name: "Suspend" }).first().click();
    await expect(toast(page)).toContainText("suspended");
  });

  test("refund an order", async ({ page }) => {
    await page.goto("/admin/orders");
    await page.getByRole("button", { name: "Refund" }).first().click();
    await expect(toast(page)).toContainText("Refunded");
  });

  test("refund is disabled on an already refunded order", async ({ page }) => {
    await page.goto("/admin/orders");
    const row = page.locator("tr", { hasText: "SMD-10468" });
    await expect(row.getByRole("button", { name: "Refund" })).toBeDisabled();
  });

  test("save a fee rule", async ({ page }) => {
    await page.goto("/admin/fees");
    await page.getByRole("button", { name: "Save rule" }).click();
    await expect(toast(page)).toContainText("Fee rule saved");
  });
});

test.describe("toast behaviour", () => {
  test("a toast can be dismissed", async ({ page }) => {
    await page.goto("/t/deccan-premier-league-2026/m/14");
    await page.getByTestId("get-tickets").click();
    await expect(toast(page)).toBeVisible();
    await page.getByRole("button", { name: "Dismiss" }).first().click();
    await expect(page.getByTestId("toast")).toHaveCount(0);
  });
});
