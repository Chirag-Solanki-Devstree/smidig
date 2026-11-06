import { test, expect, type CDPSession, type Page } from "@playwright/test";

/** Same measurement on a phone profile, where the budget is tightest. */
const CPU_SLOWDOWN = 4;

/**
 * A real one-finger flick, dispatched as touch events.
 *
 * This replaces a `touchscreen.tap()` + `mouse.wheel()` pair that used to stand
 * in for a phone scroll. The tap was not a scroll at all: on the home page it
 * landed on the live-match card and navigated away mid-measurement, so the
 * numbers for `/` were timing a route transition and reported an 83ms frame
 * that had nothing to do with scrolling. A drag that moves past the slop
 * threshold cannot fire a click, and it exercises Lenis' touch path rather
 * than its wheel path, which is what a phone actually uses.
 */
async function flick(client: CDPSession, x: number, from: number, distance: number) {
  await client.send("Input.dispatchTouchEvent", {
    type: "touchStart",
    touchPoints: [{ x, y: from }],
  });
  const steps = 10;
  for (let i = 1; i <= steps; i++) {
    await client.send("Input.dispatchTouchEvent", {
      type: "touchMove",
      touchPoints: [{ x, y: Math.round(from - (distance * i) / steps) }],
    });
  }
  await client.send("Input.dispatchTouchEvent", { type: "touchEnd", touchPoints: [] });
}

async function measure(page: Page, path: string) {
  const client = await page.context().newCDPSession(page);
  await client.send("Emulation.setCPUThrottlingRate", { rate: CPU_SLOWDOWN });
  await page.goto(path, { waitUntil: "load" });
  await page.waitForTimeout(3200);

  await page.evaluate(() => {
    const w = window as unknown as { __f: number[]; __stop?: boolean };
    w.__f = [];
    let last = performance.now();
    const tick = (t: number) => {
      w.__f.push(t - last);
      last = t;
      if (!w.__stop) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  });

  // Touch flicks, not wheel — that is how a phone is actually scrolled.
  const h = page.viewportSize()!.height;
  const urlBefore = page.url();
  for (let i = 0; i < 8; i++) {
    await flick(client, 200, Math.round(h * 0.78), Math.round(h * 0.55));
    await page.waitForTimeout(90);
  }
  await page.waitForTimeout(900);
  // A gesture that navigates is not a scroll measurement. Fail loudly instead
  // of quietly reporting frame times for a different page.
  expect(page.url(), `${path} navigated away mid-measurement`).toBe(urlBefore);

  const raw = await page.evaluate(() => {
    const w = window as unknown as { __f: number[]; __stop?: boolean };
    w.__stop = true;
    return { f: w.__f.slice(5), y: Math.round(window.scrollY) };
  });
  await client.send("Emulation.setCPUThrottlingRate", { rate: 1 });
  await client.detach();

  const f = raw.f.sort((a, b) => a - b);
  const q = (p: number) => +(f[Math.floor(f.length * p)] ?? 0).toFixed(1);
  return {
    page: path,
    median: q(0.5),
    p99: q(0.99),
    max: +(f[f.length - 1] ?? 0).toFixed(1),
    over32: f.filter((x) => x > 32).length,
    over50: f.filter((x) => x > 50).length,
    scrolled: raw.y,
  };
}

test("phone pages stay smooth", async ({ page }) => {
  const rows = [];
  for (const p of ["/", "/tournaments", "/live", "/t/deccan-premier-league-2026/m/14"]) {
    rows.push(await measure(page, p));
  }
  const head = "page".padEnd(40) + "med   p99   max   >32 >50  scrolled";
  console.log(
    "\n=== PHONE (Pixel 7, 4x CPU slowdown) ===\n" +
      [head, "-".repeat(head.length), ...rows.map((r) =>
        r.page.padEnd(40) + String(r.median).padEnd(6) + String(r.p99).padEnd(6) +
        String(r.max).padEnd(6) + String(r.over32).padEnd(4) + String(r.over50).padEnd(5) + r.scrolled,
      )].join("\n") + "\n",
  );
  for (const r of rows) expect(r.over50, `${r.page} long frames`).toBeLessThanOrEqual(2);
});
