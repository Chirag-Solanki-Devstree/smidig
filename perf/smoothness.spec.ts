import { test, type Page, expect } from "@playwright/test";

const SESSION_KEY = "smidig.session";

/**
 * Frame-time measurement under a deliberately pessimistic setup:
 *  - real wheel input through CDP, not dispatched WheelEvents
 *  - 4x CPU throttling, so this stands in for a mid-range laptop
 *  - long tasks recorded alongside frames, since a single 120ms task is
 *    what a person actually feels, even if the frame average looks fine
 */
const CPU_SLOWDOWN = 4;

type Result = {
  page: string;
  frames: number;
  median: number;
  p95: number;
  p99: number;
  max: number;
  over20: number;
  over32: number;
  over50: number;
  longTasks: number;
  blockingMs: number;
  scrolled: number;
};

async function measure(page: Page, path: string, label = path): Promise<Result> {
  const client = await page.context().newCDPSession(page);
  await client.send("Emulation.setCPUThrottlingRate", { rate: CPU_SLOWDOWN });

  await page.goto(path, { waitUntil: "load" });
  await page.waitForTimeout(3200); // settle hydration and fonts before measuring scroll

  await page.evaluate(() => {
    (window as unknown as { __perf: { frames: number[]; long: number[] } }).__perf = {
      frames: [],
      long: [],
    };
    const w = window as unknown as { __perf: { frames: number[]; long: number[] }; __stop?: boolean };
    let last = performance.now();
    const tick = (t: number) => {
      w.__perf.frames.push(t - last);
      last = t;
      if (!w.__stop) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);

    try {
      const po = new PerformanceObserver((list) => {
        for (const e of list.getEntries()) w.__perf.long.push(e.duration);
      });
      po.observe({ entryTypes: ["longtask"] });
    } catch {
      /* not every build exposes longtask */
    }
  });

  // Real wheel events, in bursts, the way a person flicks a trackpad.
  await page.mouse.move(700, 450);
  for (let i = 0; i < 26; i++) {
    await page.mouse.wheel(0, 340);
    await page.waitForTimeout(60);
  }
  await page.waitForTimeout(900);

  const raw = await page.evaluate(() => {
    const w = window as unknown as {
      __perf: { frames: number[]; long: number[] };
      __stop?: boolean;
    };
    w.__stop = true;
    return { ...w.__perf, scrolled: Math.round(window.scrollY) };
  });

  await client.send("Emulation.setCPUThrottlingRate", { rate: 1 });
  await client.detach();

  const f = raw.frames.slice(5).sort((a, b) => a - b);
  const q = (p: number) => +(f[Math.floor(f.length * p)] ?? 0).toFixed(1);

  return {
    page: label,
    frames: f.length,
    median: q(0.5),
    p95: q(0.95),
    p99: q(0.99),
    max: +(f[f.length - 1] ?? 0).toFixed(1),
    over20: f.filter((x) => x > 20).length,
    over32: f.filter((x) => x > 32).length,
    over50: f.filter((x) => x > 50).length,
    longTasks: raw.long.length,
    blockingMs: Math.round(raw.long.reduce((s, d) => s + Math.max(0, d - 50), 0)),
    scrolled: raw.scrolled,
  };
}

const PUBLIC_PAGES = [
  "/",
  "/tournaments",
  "/live",
  "/host",
  "/t/deccan-premier-league-2026",
  "/t/deccan-premier-league-2026/m/14",
  "/me/tickets",
];

const CONSOLE_PAGES = [
  "/dashboard",
  "/dashboard/orders",
  "/dashboard/fixtures",
  "/dashboard/scoring",
  "/admin",
  "/admin/orders",
];

function table(rows: Result[]) {
  const head = "page".padEnd(42) + "med   p95   p99   max   >20 >32 >50  longTask  TBTms  scrolled";
  const lines = rows.map(
    (r) =>
      r.page.padEnd(42) +
      String(r.median).padEnd(6) +
      String(r.p95).padEnd(6) +
      String(r.p99).padEnd(6) +
      String(r.max).padEnd(6) +
      String(r.over20).padEnd(4) +
      String(r.over32).padEnd(4) +
      String(r.over50).padEnd(5) +
      String(r.longTasks).padEnd(10) +
      String(r.blockingMs).padEnd(7) +
      String(r.scrolled),
  );
  return [head, "-".repeat(head.length), ...lines].join("\n");
}

test("public pages stay smooth under 4x CPU throttling", async ({ page }) => {
  const rows: Result[] = [];
  for (const p of PUBLIC_PAGES) rows.push(await measure(page, p));
  console.log("\n=== PUBLIC (4x CPU slowdown, real wheel input) ===\n" + table(rows) + "\n");

  for (const r of rows) {
    expect(r.scrolled, `${r.page} should have scrolled`).toBeGreaterThan(200);
    expect(r.over50, `${r.page} had frames over 50ms`).toBeLessThanOrEqual(2);
  }
});

test("console pages stay smooth under 4x CPU throttling", async ({ page }) => {
  await page.addInitScript(
    ([k, v]) => localStorage.setItem(k as string, v as string),
    [SESSION_KEY, JSON.stringify({ name: "Perf", email: "p@s.app", role: "organizer" })],
  );
  const rows: Result[] = [];
  for (const p of CONSOLE_PAGES.filter((x) => x.startsWith("/dashboard")))
    rows.push(await measure(page, p));

  await page.addInitScript(
    ([k, v]) => localStorage.setItem(k as string, v as string),
    [SESSION_KEY, JSON.stringify({ name: "Perf", email: "p@s.app", role: "admin" })],
  );
  for (const p of CONSOLE_PAGES.filter((x) => x.startsWith("/admin")))
    rows.push(await measure(page, p));

  console.log("\n=== CONSOLE (4x CPU slowdown, real wheel input) ===\n" + table(rows) + "\n");

  for (const r of rows) {
    expect(r.over50, `${r.page} had frames over 50ms`).toBeLessThanOrEqual(2);
  }
});
