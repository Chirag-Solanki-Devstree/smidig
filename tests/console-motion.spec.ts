import { expect, test } from "@playwright/test";
import { signInAs } from "./helpers";

/**
 * The rest of the suite runs with reduced motion, where every reveal
 * short-circuits to its end state. That hid a real failure once: the
 * IntersectionObserver never fired and console content stayed invisible,
 * and nothing went red. These tests opt motion back in so the observer is
 * genuinely exercised.
 */
test.describe("console scroll motion", () => {
  test.use({ reducedMotion: "no-preference" });

  test("dashboard content is revealed, not left hidden", async ({ page }) => {
    await signInAs(page, "organizer");
    await page.goto("/dashboard");

    // Something must actually become visible.
    await expect.poll(
      () => page.locator(".in").count(),
      { message: "reveal classes should be applied once in view" },
    ).toBeGreaterThan(0);

    // And the first stat card must end up fully opaque.
    const firstCard = page.locator(".rise-stagger > *").first();
    await expect.poll(async () => {
      return firstCard.evaluate((el) => Number(getComputedStyle(el).opacity));
    }).toBeGreaterThan(0.95);
  });

  test("nothing below the fold stays invisible after scrolling to it", async ({ page }) => {
    await signInAs(page, "organizer");
    await page.goto("/dashboard");
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(1200);

    const hidden = await page.evaluate(() => {
      const els = [...document.querySelectorAll<HTMLElement>(".rise, .rise-stagger > *")];
      return els.filter((el) => {
        const r = el.getBoundingClientRect();
        const onScreen = r.top < innerHeight && r.bottom > 0;
        return onScreen && Number(getComputedStyle(el).opacity) < 0.9;
      }).length;
    });
    expect(hidden, "on-screen content must not be left transparent").toBe(0);
  });

  test("admin reveals too", async ({ page }) => {
    await signInAs(page, "admin");
    await page.goto("/admin");
    await expect.poll(() => page.locator(".in").count()).toBeGreaterThan(0);
  });

  test("table rows become visible once the table is reached", async ({ page }) => {
    await signInAs(page, "organizer");
    await page.goto("/dashboard/orders");
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(1200);

    await expect(page.locator("tbody.rows-cascade")).toHaveClass(/\bin\b/);
    const rowOpacity = await page
      .locator("tbody.rows-cascade tr")
      .first()
      .evaluate((el) => Number(getComputedStyle(el).opacity));
    expect(rowOpacity).toBeGreaterThan(0.9);
  });

  test("the console header condenses on scroll", async ({ page }) => {
    await signInAs(page, "organizer");
    await page.goto("/dashboard");
    const header = page.locator("header").first();
    const tall = await header.evaluate((el) => el.getBoundingClientRect().height);

    await page.evaluate(() => window.scrollTo(0, 400));
    await expect.poll(() =>
      header.evaluate((el) => el.getBoundingClientRect().height),
    ).toBeLessThan(tall);
  });

  test("reduced motion shows everything immediately", async ({ browser }) => {
    const ctx = await browser.newContext({ reducedMotion: "reduce" });
    const page = await ctx.newPage();
    await signInAs(page, "organizer");
    await page.goto("/dashboard");

    const transparent = await page.evaluate(() => {
      const els = [...document.querySelectorAll<HTMLElement>(".rise, .rise-stagger > *")];
      return els.filter((el) => Number(getComputedStyle(el).opacity) < 0.9).length;
    });
    expect(transparent, "reduced motion must not hide anything").toBe(0);
    await ctx.close();
  });
});

test.describe("public scroll motion", () => {
  test.use({ reducedMotion: "no-preference" });

  test("browse cards reveal as you scroll, none left transparent", async ({ page }) => {
    await page.goto("/tournaments");
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(1400);

    const hidden = await page.evaluate(() => {
      const cards = [...document.querySelectorAll<HTMLElement>("a[href^='/t/']")];
      return cards.filter((el) => {
        const r = el.getBoundingClientRect();
        const onScreen = r.top < innerHeight && r.bottom > 0;
        return onScreen && Number(getComputedStyle(el).opacity) < 0.9;
      }).length;
    });
    expect(hidden, "on-screen cards must not be left transparent").toBe(0);
  });

  test("ticket wallet cards reveal", async ({ page }) => {
    await page.goto("/me/tickets");
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(1200);
    await expect(page.getByText("SMD-10482").first()).toBeVisible();
  });

  test("section rules draw in on the home page", async ({ page }) => {
    await page.goto("/");
    await page.evaluate(() => window.scrollTo(0, 900));
    await expect.poll(() => page.locator(".rule.in").count()).toBeGreaterThan(0);
  });

  test("match page panels reveal", async ({ page }) => {
    await page.goto("/t/deccan-premier-league-2026/m/14");
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(1200);
    await expect(page.getByText("Commentary")).toBeVisible();

    const hidden = await page.evaluate(() => {
      const els = [...document.querySelectorAll<HTMLElement>(".rise")];
      return els.filter((el) => {
        const r = el.getBoundingClientRect();
        return r.top < innerHeight && r.bottom > 0 && Number(getComputedStyle(el).opacity) < 0.9;
      }).length;
    });
    expect(hidden).toBe(0);
  });

  test("public reduced motion hides nothing", async ({ browser }) => {
    const ctx = await browser.newContext({ reducedMotion: "reduce" });
    const page = await ctx.newPage();
    await page.goto("/tournaments");
    const transparent = await page.evaluate(() => {
      const els = [...document.querySelectorAll<HTMLElement>(".rise, .rule, a[href^='/t/']")];
      return els.filter((el) => Number(getComputedStyle(el).opacity) < 0.9).length;
    });
    expect(transparent).toBe(0);
    await ctx.close();
  });
});
