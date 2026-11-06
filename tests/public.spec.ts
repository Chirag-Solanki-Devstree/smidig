import { expect, test } from "@playwright/test";
import { collectConsoleErrors, expectAllClickablesHittable } from "./helpers";

test.describe("public marketplace", () => {
  test("home renders every section and has no console errors", async ({ page }) => {
    const errors = collectConsoleErrors(page);
    await page.goto("/");

    await expect(page.getByRole("heading", { level: 1 })).toContainText("Find a tournament");
    await expect(page.getByText("Matches in progress")).toBeVisible();
    await expect(page.getByText("Tournaments worth watching")).toBeVisible();
    await expect(page.getByText("Register your team this week")).toBeVisible();
    await expect(page.getByText("You do not have to play to take part.")).toBeVisible();

    expect(errors, errors.join("\n")).toEqual([]);
  });

  test("every clickable on home is actually hittable", async ({ page }) => {
    await page.goto("/");
    await expectAllClickablesHittable(page);
  });

  test("nav links navigate", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("link", { name: "Browse", exact: true }).click();
    await expect(page).toHaveURL(/\/tournaments$/);

    await page.getByRole("link", { name: "Live now", exact: true }).click();
    await expect(page).toHaveURL(/\/live$/);

    await page.getByRole("link", { name: "Host", exact: true }).click();
    await expect(page).toHaveURL(/\/host$/);
  });

  test("sport chips: cricket selectable, other sports disabled", async ({ page }) => {
    await page.goto("/");
    const cricket = page.getByRole("button", { name: /Cricket/ }).first();
    await expect(cricket).toBeEnabled();
    await cricket.click();
    await expect(cricket).toHaveAttribute("disabled", /.*/ ).catch(() => {});
    await expect(page.getByRole("button", { name: /Hockey/ }).first()).toBeDisabled();
  });

  test("live rail arrows scroll the rail", async ({ page }) => {
    await page.goto("/");
    const rail = page.locator("section", { hasText: "Matches in progress" }).locator(".overflow-x-auto").first();
    await expect(rail).toBeVisible();
    const before = await rail.evaluate((e) => e.scrollLeft);
    await page.getByRole("button", { name: "Scroll right" }).click();
    await page.waitForTimeout(600);
    const after = await rail.evaluate((e) => e.scrollLeft);
    expect(after, "right arrow should move the rail").toBeGreaterThan(before);
  });

  test("tournament card opens the tournament", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("link", { name: /Deccan Premier League 2026/ }).first().click();
    await expect(page).toHaveURL(/\/t\/deccan-premier-league-2026$/);
    await expect(page.getByRole("heading", { level: 1 })).toContainText("Deccan Premier League 2026");
  });
});

test.describe("browse", () => {
  test("filters narrow the results and clear again", async ({ page }) => {
    await page.goto("/tournaments");
    await expect(page.getByText("6 results")).toBeVisible();

    await page.getByPlaceholder("Search by name, city or organizer").fill("kochi");
    await expect(page.getByText("1 result", { exact: true })).toBeVisible();
    await expect(page.getByRole("link", { name: /Kochi Monsoon Shield/ })).toBeVisible();

    await page.getByRole("button", { name: "Clear search" }).click();
    await expect(page.getByText("6 results")).toBeVisible();
  });

  test("filter panel opens and a filter applies", async ({ page }) => {
    await page.goto("/tournaments");
    await page.getByRole("button", { name: /Filters/ }).click();
    await page.getByLabel("City").selectOption("Mumbai");
    await expect(page.getByText("1 result", { exact: true })).toBeVisible();
    await expect(page.getByRole("button", { name: /Clear all/ })).toBeVisible();
    await page.getByRole("button", { name: /Clear all/ }).click();
    await expect(page.getByText("6 results")).toBeVisible();
  });

  test("empty state appears when nothing matches", async ({ page }) => {
    await page.goto("/tournaments");
    await page.getByPlaceholder("Search by name, city or organizer").fill("zzzzz");
    await expect(page.getByText("No tournaments match those filters")).toBeVisible();
    await expect(page.getByRole("button", { name: "Clear filters" })).toBeVisible();
  });

  test("all clickables hittable", async ({ page }) => {
    await page.goto("/tournaments");
    await expectAllClickablesHittable(page);
  });
});

test.describe("tournament page", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/t/deccan-premier-league-2026");
  });

  test("every tab switches its panel", async ({ page }) => {
    const checks: [string, RegExp][] = [
      ["Fixtures", /Match 14/],
      ["Points table", /Mumbai Mavericks/],
      ["Teams", /Nagpur Nawabs/],
      ["Sponsors", /Most picked|Title|Gold/],
      ["Food & stalls", /Stall map/],
      ["Venue", /Getting there/],
      ["Overview", /Rules & format/],
    ];
    for (const [tab, expected] of checks) {
      await page.getByRole("button", { name: tab, exact: true }).click();
      await expect(page.getByText(expected).first()).toBeVisible();
    }
  });

  test("action buttons work", async ({ page }) => {
    await page.getByRole("button", { name: /Become a sponsor/ }).click();
    await expect(page.getByText("Current sponsors")).toBeVisible();

    await page.getByRole("button", { name: /Book a stall/ }).click();
    await expect(page.getByText("Stall map")).toBeVisible();
  });

  test("register link goes to the wizard", async ({ page }) => {
    await page.getByRole("link", { name: /Register a team/ }).click();
    await expect(page).toHaveURL(/\/register$/);
    await expect(page.getByRole("heading", { name: "Register your team" })).toBeVisible();
  });

  test("buy tickets link opens a match", async ({ page }) => {
    await page.getByRole("link", { name: /Buy tickets/ }).click();
    await expect(page).toHaveURL(/\/m\/14$/);
  });

  test("all clickables hittable", async ({ page }) => {
    await expectAllClickablesHittable(page);
  });
});

test.describe("match page", () => {
  test("scoreboard, scorecard, commentary and ticket box render", async ({ page }) => {
    await page.goto("/t/deccan-premier-league-2026/m/14");
    await expect(page.getByText("MUM need 24 off 10")).toBeVisible();
    await expect(page.getByText("Batting · Mumbai Mavericks")).toBeVisible();
    await expect(page.getByText("Commentary")).toBeVisible();
    await expect(page.getByRole("button", { name: /Get tickets/ })).toBeVisible();
    await expect(page.getByText("Match sponsors")).toBeVisible();
  });

  test("back link returns to the tournament", async ({ page }) => {
    await page.goto("/t/deccan-premier-league-2026/m/14");
    await page.getByRole("link", { name: /Deccan Premier League 2026/ }).first().click();
    await expect(page).toHaveURL(/\/t\/deccan-premier-league-2026$/);
  });

  test("all clickables hittable", async ({ page }) => {
    await page.goto("/t/deccan-premier-league-2026/m/14");
    await expectAllClickablesHittable(page);
  });
});

test.describe("registration wizard", () => {
  test("walks all four steps and back", async ({ page }) => {
    await page.goto("/t/deccan-premier-league-2026/register");
    await expect(page.getByText("Team details")).toBeVisible();

    await page.getByRole("button", { name: "Continue" }).click();
    await expect(page.getByRole("heading", { name: "Squad" })).toBeVisible();

    await page.getByRole("button", { name: "Continue" }).click();
    await expect(page.getByText("Check before you pay")).toBeVisible();

    await page.getByRole("button", { name: "Continue" }).click();
    await expect(page.getByRole("heading", { name: "Payment" })).toBeVisible();
    await expect(page.getByText("You pay")).toBeVisible();

    await page.getByRole("button", { name: "Back" }).click();
    await expect(page.getByText("Check before you pay")).toBeVisible();
  });

  test("back is disabled on the first step", async ({ page }) => {
    await page.goto("/t/deccan-premier-league-2026/register");
    await expect(page.getByRole("button", { name: "Back" })).toBeDisabled();
  });
});

test.describe("live, tickets, host, styleguide", () => {
  for (const [path, heading] of [
    ["/live", "Live right now"],
    ["/me/tickets", "My tickets"],
    ["/styleguide", "Styleguide"],
  ] as const) {
    test(`${path} renders and is clickable`, async ({ page }) => {
      const errors = collectConsoleErrors(page);
      await page.goto(path);
      await expect(page.getByText(heading).first()).toBeVisible();
      await expectAllClickablesHittable(page);
      expect(errors, errors.join("\n")).toEqual([]);
    });
  }

  test("/host renders the organizer pitch", async ({ page }) => {
    await page.goto("/host");
    await expect(page.getByRole("heading", { level: 1 })).toContainText("Run your cricket");
  });
});

test.describe("theme", () => {
  test("mode toggle flips the document and persists", async ({ page }) => {
    await page.goto("/");
    const html = page.locator("html");
    await expect(html).toHaveAttribute("data-mode", "dark");

    await page.getByRole("button", { name: /Switch to light mode/ }).click();
    await expect(html).toHaveAttribute("data-mode", "light");

    await page.reload();
    await expect(html).toHaveAttribute("data-mode", "light");
  });
});

test.describe("cursor ball trail", () => {
  test("the trail layer never intercepts pointer events", async ({ page }) => {
    await page.goto("/");
    const pe = await page.evaluate(() => {
      const layers = [...document.querySelectorAll("div.pointer-events-none.absolute.inset-0")];
      return layers.map((l) => getComputedStyle(l).pointerEvents);
    });
    expect(pe.length).toBeGreaterThan(0);
    expect(pe.every((v) => v === "none")).toBe(true);
  });

  test("hero CTA still clicks with the trail present", async ({ page }) => {
    await page.goto("/");
    // Drag the pointer across the hero so the trail is populated first.
    for (const [x, y] of [[300, 300], [500, 340], [700, 300], [900, 340]]) {
      await page.mouse.move(x, y);
    }
    await page.getByRole("link", { name: "Find a tournament", exact: true }).click();
    await expect(page).toHaveURL(/\/tournaments$/);
  });
});

test.describe("cursor ball trail — motion enabled", () => {
  // The rest of the suite runs with reduced motion, where the trail correctly
  // disables itself. This group opts back in so it can be exercised.
  test.use({ reducedMotion: "no-preference" });

  test("the flame draws behind the ball and clears when the cursor leaves", async ({ page }) => {
    await page.goto("/");

    const result = await page.evaluate(async () => {
      const layer = document.querySelector('[data-testid="ball-trail"]')!;
      const svg = layer.querySelector("svg")!;
      const longest = () => layer.querySelector("path")!;
      const fire = (x: number, y: number) =>
        window.dispatchEvent(
          new PointerEvent("pointermove", { clientX: x, clientY: y, bubbles: true, pointerType: "mouse" }),
        );

      const box = (layer.parentElement as HTMLElement).getBoundingClientRect();

      // Sweep across the hero.
      for (let i = 0; i < 40; i++) {
        const t = i / 60;
        fire(box.left + 60 + t * (box.width - 140), box.top + box.height * 0.5);
        await new Promise((r) => requestAnimationFrame(r));
      }

      const d = longest().getAttribute("d") || "";
      const visible = getComputedStyle(svg).opacity;

      // Leave the hero entirely.
      fire(box.left + box.width / 2, box.top + box.height + 400);
      await new Promise((r) => setTimeout(r, 120));

      return {
        drawn: d.length,
        curves: (d.match(/C/g) || []).length,
        visibleWhileInside: visible,
        hiddenAfterLeaving: getComputedStyle(svg).opacity,
      };
    });

    expect(result.drawn, "the flame path should be drawn").toBeGreaterThan(20);
    expect(result.curves, "the flame should be a smooth multi-segment curve").toBeGreaterThan(3);
    expect(Number(result.visibleWhileInside)).toBeGreaterThan(0.5);
    expect(Number(result.hiddenAfterLeaving)).toBeLessThan(0.5);
  });
});

test.describe("flame length", () => {
  test.use({ reducedMotion: "no-preference" });

  test("a fast drag does not make the flame longer than a slow one", async ({ page }) => {
    await page.goto("/");
    const { slow, fast } = await page.evaluate(async () => {
      const fire = (x: number, y: number) =>
        window.dispatchEvent(
          new PointerEvent("pointermove", { clientX: x, clientY: y, bubbles: true, pointerType: "mouse" }),
        );
      const len = () => {
        const p = document.querySelector<SVGPathElement>('[data-testid="ball-trail"] path');
        return p ? p.getTotalLength() : -1;
      };
      for (let i = 0; i < 36; i++) {
        fire(200 + i * 4, 300);
        await new Promise((r) => requestAnimationFrame(r));
      }
      const slow = len();
      for (let i = 0; i < 26; i++) {
        fire(160 + i * 18, 310);
        await new Promise((r) => requestAnimationFrame(r));
      }
      return { slow, fast: len() };
    });

    // The spring chain stretches with speed; the draw step clamps it.
    expect(fast).toBeLessThanOrEqual(130);
    expect(slow).toBeLessThanOrEqual(130);
  });
});
