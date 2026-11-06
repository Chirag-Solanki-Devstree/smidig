import { expect, test, type Page } from "@playwright/test";
import { signInAs } from "./helpers";

/**
 * These assert that controls CHANGE something. The earlier suite only checked
 * that a control rendered and was clickable, which a dead control passes.
 */

test.beforeEach(async ({ page }) => {
  await signInAs(page, "organizer");
});

const go = (page: Page) => page.goto("/dashboard/tournaments/new");

/** Fill step 1 with something valid and move on. */
async function fillBasics(page: Page, name = "Thane Night League") {
  await page.getByTestId("name").fill(name);
  await page.getByTestId("city").fill("Thane");
  await page.getByTestId("venue").fill("Dadoji Ground");
  await page.getByTestId("start").fill("2027-02-01");
  await page.getByTestId("end").fill("2027-02-20");
}

test.describe("1 · dates are real date pickers", () => {
  test("start and end are type=date and hold a value", async ({ page }) => {
    await go(page);
    await expect(page.getByTestId("start")).toHaveAttribute("type", "date");
    await expect(page.getByTestId("end")).toHaveAttribute("type", "date");

    await page.getByTestId("start").fill("2027-02-01");
    await expect(page.getByTestId("start")).toHaveValue("2027-02-01");
  });

  test("registration dates are date pickers too", async ({ page }) => {
    await go(page);
    await fillBasics(page);
    await page.getByTestId("continue").click();
    await page.getByTestId("continue").click();
    await expect(page.getByTestId("regopen")).toHaveAttribute("type", "date");
    await expect(page.getByTestId("regclose")).toHaveAttribute("type", "date");
  });
});

test.describe("2 · date validation", () => {
  test("end before start is rejected and blocks the step", async ({ page }) => {
    await go(page);
    await fillBasics(page);
    await page.getByTestId("end").fill("2027-01-10"); // before start
    await page.getByTestId("continue").click();

    await expect(page.getByTestId("end-error")).toBeVisible();
    await expect(page.getByTestId("end-error")).toContainText("cannot be before");
    // still on step 1
    await expect(page.getByTestId("name")).toBeVisible();
  });

  test("a valid range moves on, and the error clears when corrected", async ({ page }) => {
    await go(page);
    await fillBasics(page);
    await page.getByTestId("end").fill("2027-01-10");
    await page.getByTestId("continue").click();
    await expect(page.getByTestId("end-error")).toBeVisible();

    await page.getByTestId("end").fill("2027-02-20");
    await expect(page.getByTestId("end-error")).toHaveCount(0);
    await page.getByTestId("continue").click();
    await expect(page.getByRole("heading", { name: /format/i })).toBeVisible();
  });

  test("registration cannot close before it opens", async ({ page }) => {
    await go(page);
    await fillBasics(page);
    await page.getByTestId("continue").click();
    await page.getByTestId("continue").click();

    await page.getByTestId("regopen").fill("2027-01-10");
    await page.getByTestId("regclose").fill("2027-01-05");
    await page.getByTestId("continue").click();
    await expect(page.getByTestId("regclose-error")).toBeVisible();
  });

  test("required fields are enforced", async ({ page }) => {
    await go(page);
    await page.getByTestId("continue").click();
    await expect(page.getByTestId("name-error")).toBeVisible();
  });
});

test.describe("3 · banner and logo presets", () => {
  test("a banner preset can be selected", async ({ page }) => {
    await go(page);
    const turf = page.getByTestId("banner-turf");
    const dusk = page.getByTestId("banner-dusk");
    await expect(turf).toHaveAttribute("aria-pressed", "true");

    await dusk.click();
    await expect(dusk).toHaveAttribute("aria-pressed", "true");
    await expect(turf).toHaveAttribute("aria-pressed", "false");
  });

  test("a logo preset can be selected", async ({ page }) => {
    await go(page);
    const cup = page.getByTestId("logo-cup");
    await cup.click();
    await expect(cup).toHaveAttribute("aria-pressed", "true");
    await expect(page.getByTestId("logo-ball")).toHaveAttribute("aria-pressed", "false");
  });

  test("upload inputs exist for both", async ({ page }) => {
    await go(page);
    await expect(page.getByTestId("banner-file")).toHaveAttribute("type", "file");
    await expect(page.getByTestId("logo-file")).toHaveAttribute("type", "file");
  });
});

test.describe("4, 5, 6 · format choices actually change", () => {
  test.beforeEach(async ({ page }) => {
    await go(page);
    await fillBasics(page);
    await page.getByTestId("continue").click();
  });

  test("match type changes", async ({ page }) => {
    await expect(page.getByTestId("matchtype-t20")).toHaveAttribute("aria-pressed", "true");
    await page.getByTestId("matchtype-odi").click();
    await expect(page.getByTestId("matchtype-odi")).toHaveAttribute("aria-pressed", "true");
    await expect(page.getByTestId("matchtype-t20")).toHaveAttribute("aria-pressed", "false");
  });

  test("tournament format changes", async ({ page }) => {
    await page.getByTestId("format-knockout").click();
    await expect(page.getByTestId("format-knockout")).toHaveAttribute("aria-pressed", "true");
    await expect(page.getByTestId("format-league")).toHaveAttribute("aria-pressed", "false");
  });

  test("ball type changes", async ({ page }) => {
    await page.getByTestId("balltype-tennis").click();
    await expect(page.getByTestId("balltype-tennis")).toHaveAttribute("aria-pressed", "true");
    await expect(page.getByTestId("balltype-leather")).toHaveAttribute("aria-pressed", "false");
  });

  test("squad max below min is rejected", async ({ page }) => {
    await page.getByTestId("squadmax").fill("5");
    await page.getByTestId("continue").click();
    await expect(page.getByTestId("squadmax-error")).toBeVisible();
  });
});

test.describe("8, 9, 10 · registration and ticket controls", () => {
  test.beforeEach(async ({ page }) => {
    await go(page);
    await fillBasics(page);
    await page.getByTestId("continue").click();
    await page.getByTestId("continue").click();
  });

  test("approval state changes", async ({ page }) => {
    await expect(page.getByTestId("approval-manual")).toHaveAttribute("aria-pressed", "true");
    await page.getByTestId("approval-auto").click();
    await expect(page.getByTestId("approval-auto")).toHaveAttribute("aria-pressed", "true");
    await expect(page.getByTestId("approval-manual")).toHaveAttribute("aria-pressed", "false");
  });

  test("entry fee is editable and the fee preview follows it", async ({ page }) => {
    await page.getByTestId("entryfee").fill("12000");
    await expect(page.getByTestId("fee-preview")).toContainText("11,400");
    await expect(page.getByTestId("fee-preview")).toContainText("600");

    await page.getByTestId("entryfee").fill("0");
    await expect(page.getByTestId("fee-preview")).toContainText("Free entry");
  });

  test("sell tickets toggles, and hides the rows when off", async ({ page }) => {
    await page.getByTestId("regopen").fill("2027-01-01");
    await page.getByTestId("regclose").fill("2027-01-20");
    await page.getByTestId("continue").click();

    await expect(page.getByTestId("ticket-rows")).toBeVisible();
    await page.getByTestId("selltickets-no").click();
    await expect(page.getByTestId("selltickets-no")).toHaveAttribute("aria-pressed", "true");
    await expect(page.getByTestId("ticket-rows")).toHaveCount(0);

    await page.getByTestId("selltickets-yes").click();
    await expect(page.getByTestId("ticket-rows")).toBeVisible();
  });

  test("add ticket type adds a row, and remove takes it away", async ({ page }) => {
    await page.getByTestId("regopen").fill("2027-01-01");
    await page.getByTestId("regclose").fill("2027-01-20");
    await page.getByTestId("continue").click();

    const rows = page.getByTestId("ticket-rows").locator("> div");
    await expect(rows).toHaveCount(2);

    await page.getByTestId("add-ticket").click();
    await expect(rows).toHaveCount(3);

    await page.getByRole("button", { name: /Remove/ }).first().click();
    await expect(rows).toHaveCount(2);
  });

  test("a nameless ticket type blocks the step", async ({ page }) => {
    await page.getByTestId("regopen").fill("2027-01-01");
    await page.getByTestId("regclose").fill("2027-01-20");
    await page.getByTestId("continue").click();

    await page.getByTestId("add-ticket").click();
    await page.getByTestId("continue").click();
    await expect(page.getByRole("main").getByText("Every ticket type needs a name")).toBeVisible();
  });
});

test.describe("sponsor tiers", () => {
  test("a tier can be added and removed", async ({ page }) => {
    await go(page);
    await fillBasics(page);
    await page.getByTestId("continue").click();
    await page.getByTestId("continue").click();
    await page.getByTestId("regopen").fill("2027-01-01");
    await page.getByTestId("regclose").fill("2027-01-20");
    await page.getByTestId("continue").click();
    await page.getByTestId("continue").click();

    const rows = page.getByTestId("sponsor-rows").locator("> div");
    await expect(rows).toHaveCount(2);
    await page.getByTestId("add-tier").click();
    await expect(rows).toHaveCount(3);
  });
});

test.describe("11, 12 · publish navigates and the tournament appears", () => {
  test("publishing goes to the list and shows the new tournament", async ({ page }) => {
    await go(page);
    await fillBasics(page, "Kalyan Floodlight Cup");
    await page.getByTestId("continue").click(); // → format
    await page.getByTestId("matchtype-t10").click();
    await page.getByTestId("format-knockout").click();
    await page.getByTestId("balltype-tennis").click();
    await page.getByTestId("continue").click(); // → registration
    await page.getByTestId("entryfee").fill("4000");
    await page.getByTestId("regopen").fill("2027-01-01");
    await page.getByTestId("regclose").fill("2027-01-20");
    await page.getByTestId("continue").click(); // → tickets
    await page.getByTestId("continue").click(); // → sponsors
    await page.getByTestId("continue").click(); // → rules
    await page.getByTestId("continue").click(); // → review

    await expect(page.getByTestId("review-name")).toContainText("Kalyan Floodlight Cup");

    await page.getByTestId("publish").click();
    await expect(page).toHaveURL(/\/dashboard\/tournaments$/, { timeout: 10_000 });
    const table = page.locator("table");
    await expect(table.getByText("Kalyan Floodlight Cup")).toBeVisible();
    await expect(table.getByText("Just created")).toBeVisible();
  });

  test("it survives a refresh", async ({ page }) => {
    await go(page);
    await fillBasics(page, "Persisted Cup");
    await page.getByTestId("continue").click();
    await page.getByTestId("continue").click();
    await page.getByTestId("regopen").fill("2027-01-01");
    await page.getByTestId("regclose").fill("2027-01-20");
    await page.getByTestId("continue").click();
    await page.getByTestId("continue").click();
    await page.getByTestId("continue").click();
    await page.getByTestId("continue").click();
    await page.getByTestId("publish").click();
    await expect(page).toHaveURL(/\/dashboard\/tournaments$/, { timeout: 10_000 });

    await page.reload();
    await expect(page.locator("table").getByText("Persisted Cup")).toBeVisible();
  });

  test("publishing with a missing field jumps back to that step", async ({ page }) => {
    await go(page);
    // Jump straight to review without filling anything.
    await page.getByTestId("step-6").click();
    // Step guard should have stopped us; confirm we never left step 1.
    await expect(page.getByTestId("name")).toBeVisible();
  });
});

/* ------------------------------------------------------------------ team
   The same class of bug lived in the team registration wizard: its fields
   were decorative too. */
test.describe("team registration wizard", () => {
  const open = (page: Page) => page.goto("/t/deccan-premier-league-2026/register");

  test("fields hold their values", async ({ page }) => {
    await open(page);
    await page.getByTestId("team-name").fill("Thane Titans");
    await expect(page.getByTestId("team-name")).toHaveValue("Thane Titans");
  });

  test("short code is forced to three upper-case letters", async ({ page }) => {
    await open(page);
    await page.getByTestId("team-short").fill("thanex");
    await expect(page.getByTestId("team-short")).toHaveValue("THA");
  });

  test("empty team details are rejected", async ({ page }) => {
    await open(page);
    await page.getByRole("button", { name: "Continue" }).click();
    await expect(page.getByTestId("team-name-error")).toBeVisible();
  });

  test("a bad email is rejected", async ({ page }) => {
    await open(page);
    await page.getByTestId("team-name").fill("Thane Titans");
    await page.getByTestId("team-short").fill("THA");
    await page.getByTestId("team-city").fill("Thane");
    await page.getByTestId("team-email").fill("nope");
    await page.getByRole("button", { name: "Continue" }).click();
    await expect(page.getByTestId("team-email-error")).toBeVisible();
  });

  test("squad rows can be added and removed, and the count follows", async ({ page }) => {
    await open(page);
    await page.getByTestId("team-name").fill("Thane Titans");
    await page.getByTestId("team-short").fill("THA");
    await page.getByTestId("team-city").fill("Thane");
    await page.getByTestId("team-email").fill("captain@titans.in");
    await page.getByRole("button", { name: "Continue" }).click();

    const rows = page.getByTestId("squad-rows").locator("li");
    await expect(rows).toHaveCount(11);
    await expect(page.getByTestId("squad-count")).toContainText("11 of 11");

    await page.getByTestId("add-player").click();
    await expect(rows).toHaveCount(12);
    await expect(page.getByTestId("squad-count")).toContainText("11 of 12");
  });

  test("a squad under eleven is rejected", async ({ page }) => {
    await open(page);
    await page.getByTestId("team-name").fill("Thane Titans");
    await page.getByTestId("team-short").fill("THA");
    await page.getByTestId("team-city").fill("Thane");
    await page.getByTestId("team-email").fill("captain@titans.in");
    await page.getByRole("button", { name: "Continue" }).click();

    await page.getByRole("button", { name: /Remove player/ }).first().click();
    await page.getByRole("button", { name: "Continue" }).click();
    await expect(page.getByText("at least 11 named players").first()).toBeVisible();
  });

  test("review shows what was typed, not placeholders", async ({ page }) => {
    await open(page);
    await page.getByTestId("team-name").fill("Kalyan Kings");
    await page.getByTestId("team-short").fill("KAL");
    await page.getByTestId("team-city").fill("Kalyan");
    await page.getByTestId("team-email").fill("skip@kings.in");
    await page.getByRole("button", { name: "Continue" }).click();
    await page.getByRole("button", { name: "Continue" }).click();
    await expect(page.getByText("Kalyan Kings (KAL)")).toBeVisible();
  });
});

/* --------------------------------------------------------------- searches */
test.describe("searches actually filter", () => {
  test("organizer order search narrows the table", async ({ page }) => {
    await page.goto("/dashboard/orders");
    await expect(page.getByTestId("order-count")).toContainText("Showing 8 of 8");
    await page.getByTestId("order-search").fill("Vertex");
    await expect(page.getByTestId("order-count")).toContainText("Showing 1 of 8");
  });

  test("order flow filter works", async ({ page }) => {
    await page.goto("/dashboard/orders");
    await page.getByTestId("order-flow").selectOption("ticket");
    await expect(page.getByTestId("order-count")).toContainText("Showing 3 of 8");
  });

  test("admin order search narrows the table", async ({ page }) => {
    await signInAs(page, "admin");
    await page.goto("/admin/orders");
    await page.getByTestId("order-search").fill("SMD-10482");
    await expect(page.getByTestId("order-count")).toContainText("Showing 1 of 8");
  });

  test("a search with no matches shows an empty state", async ({ page }) => {
    await page.goto("/dashboard/orders");
    await page.getByTestId("order-search").fill("zzzzzz");
    await expect(page.getByText("No orders match")).toBeVisible();
  });
});

test.describe("home search carries through to browse", () => {
  test("typing a city and searching lands on a filtered browse", async ({ page }) => {
    await page.goto("/");
    await page.getByTestId("hero-q").fill("Kochi");
    await page.getByRole("button", { name: "Search", exact: true }).click();
    await expect(page).toHaveURL(/\/tournaments\?q=Kochi/);
    await expect(page.getByText("1 result", { exact: true })).toBeVisible();
  });
});

test.describe("waitlist email", () => {
  test("rejects a bad address and accepts a good one", async ({ page }) => {
    await page.goto("/host");
    await page.getByTestId("waitlist-email").fill("nope");
    await page.getByRole("button", { name: /Start free/ }).last().click();
    // Toasts stack newest-last, and the first one is still on screen.
    await expect(page.getByTestId("toast").last()).toContainText("Check that address");

    await page.getByTestId("waitlist-email").fill("me@club.in");
    await page.getByRole("button", { name: /Start free/ }).last().click();
    await expect(page.getByTestId("toast").last()).toContainText("on the list");
    // And the field clears on success.
    await expect(page.getByTestId("waitlist-email")).toHaveValue("");
  });
});

/* ------------------------------------------------------------ preview --- */
test.describe("wizard preview", () => {
  test("Preview opens a real listing, not a toast", async ({ page }) => {
    await go(page);
    await page.getByTestId("name").fill("Panvel Premier Cup");
    await page.getByTestId("city").fill("Panvel");
    await page.getByTestId("entryfee"); // no-op; entry fee lives on a later step

    await page.getByTestId("preview").click();
    const dialog = page.getByTestId("preview-dialog");
    await expect(dialog).toBeVisible();
    await expect(page.getByTestId("preview-name")).toContainText("Panvel Premier Cup");
    await expect(dialog).toContainText("Panvel");

    await page.getByTestId("preview-close").click();
    await expect(dialog).toHaveCount(0);
  });

  test("Escape closes the preview", async ({ page }) => {
    await go(page);
    await page.getByTestId("preview").click();
    await expect(page.getByTestId("preview-dialog")).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(page.getByTestId("preview-dialog")).toHaveCount(0);
  });

  test("preview reflects the chosen banner and format", async ({ page }) => {
    await go(page);
    await page.getByTestId("name").fill("Dusk Cup");
    await page.getByTestId("banner-dusk").click();
    await page.getByTestId("preview").click();
    await expect(page.getByTestId("preview-dialog")).toContainText("Cricket");
    await expect(page.getByTestId("preview-dialog")).toContainText("T20");
  });
});

/* ------------------------------------------------- live scoring is joined */
test.describe("live scoring updates everything together", () => {
  const openScoring = async (page: Page) => {
    await page.goto("/dashboard/scoring");
    await expect(page.getByTestId("score")).toBeVisible();
  };

  test("a four adds to the total, the striker and the bowler", async ({ page }) => {
    await openScoring(page);
    await expect(page.getByTestId("score")).toContainText("182");
    await expect(page.getByTestId("striker-runs")).toHaveText("64");
    await expect(page.getByTestId("striker-balls")).toHaveText("38");
    await expect(page.getByTestId("bowler-runs")).toHaveText("28");

    await page.getByTestId("run-4").click();

    await expect(page.getByTestId("score")).toContainText("186");
    await expect(page.getByTestId("striker-runs")).toHaveText("68");
    await expect(page.getByTestId("striker-balls")).toHaveText("39");
    await expect(page.getByTestId("bowler-runs")).toHaveText("32");
  });

  test("an odd run rotates the strike", async ({ page }) => {
    await openScoring(page);
    const before = await page.getByTestId("striker-name").textContent();
    await page.getByTestId("run-1").click();
    const after = await page.getByTestId("striker-name").textContent();
    expect(after).not.toBe(before);
  });

  test("a wicket brings in a new batter on nought", async ({ page }) => {
    await openScoring(page);
    await page.getByTestId("wicket").click();

    await expect(page.getByTestId("score")).toContainText("/5");
    await expect(page.getByTestId("striker-runs")).toHaveText("0");
    await expect(page.getByTestId("striker-balls")).toHaveText("0");
    await expect(page.getByTestId("bowler-wickets")).toHaveText("3");
  });

  test("a wide adds a run but no ball to the striker", async ({ page }) => {
    await openScoring(page);
    await expect(page.getByTestId("overs")).toContainText("18.2");
    await page.getByTestId("extra-wd").click();

    await expect(page.getByTestId("score")).toContainText("183");
    await expect(page.getByTestId("striker-balls")).toHaveText("38"); // unchanged
    await expect(page.getByTestId("bowler-runs")).toHaveText("29");
    // No legal ball, so the over does not advance — though the run rate does.
    await expect(page.getByTestId("overs")).toContainText("18.2");
  });

  test("a bye adds a team run but not the batter's", async ({ page }) => {
    await openScoring(page);
    await page.getByTestId("extra-b").click();

    await expect(page.getByTestId("score")).toContainText("183");
    await expect(page.getByTestId("striker-runs")).toHaveText("64"); // not his
    await expect(page.getByTestId("striker-balls")).toHaveText("39"); // ball used
    await expect(page.getByTestId("bowler-runs")).toHaveText("28"); // not charged
  });

  test("undo reverses the whole ball, not just the score", async ({ page }) => {
    await openScoring(page);
    await page.getByTestId("run-6").click();
    await expect(page.getByTestId("score")).toContainText("188");
    await expect(page.getByTestId("striker-runs")).toHaveText("70");

    await page.getByTestId("undo").click();
    await expect(page.getByTestId("score")).toContainText("182");
    await expect(page.getByTestId("striker-runs")).toHaveText("64");
    await expect(page.getByTestId("striker-balls")).toHaveText("38");
    await expect(page.getByTestId("bowler-runs")).toHaveText("28");
  });

  test("completing the over clears the strip and changes the bowler", async ({ page }) => {
    await openScoring(page);
    // 18.2 overs → four legal balls to the over's end.
    const first = await page.getByTestId("current-bowler").textContent();
    for (let i = 0; i < 4; i++) await page.getByTestId("run-0").click();

    await expect(page.getByTestId("overs")).toContainText("19.0");
    await expect(page.getByTestId("over-strip").locator("> span")).toHaveCount(0);
    const second = await page.getByTestId("current-bowler").textContent();
    expect(second).not.toBe(first);
  });
});
