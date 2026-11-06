import { test, expect, type Page } from "@playwright/test";

/** Same measurement on a phone profile, where the budget is tightest. */
const CPU_SLOWDOWN = 4;

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
  for (let i = 0; i < 8; i++) {
    await page.touchscreen.tap(200, Math.round(h * 0.5)).catch(() => {});
    await page.mouse.wheel(0, 500);
    await page.waitForTimeout(90);
  }
  await page.waitForTimeout(900);

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
