import { expect, test, type Page } from "@playwright/test";
import { MODE_KEY } from "../src/lib/mode";
import { signInAs } from "./helpers";

/**
 * Whole-app sweeps for UI faults that render without erroring, so nothing else
 * in this suite notices them.
 *
 * Both of these shipped: the tournament banners were hard-coded dark hex
 * gradients with no light-mode twin, so every hero and card wore a muddy brown
 * band on a light page; and the tournament card was missing h-full inside its
 * stretched grid cell, so a tournament with no prize pool rendered visibly
 * shorter than the cards beside it.
 */

const PUBLIC_PAGES = [
  "/",
  "/tournaments",
  "/live",
  "/host",
  "/t/deccan-premier-league-2026",
  "/t/ahmedabad-corporate-cup",
  "/t/deccan-premier-league-2026/m/14",
  "/t/deccan-premier-league-2026/register",
  "/me/tickets",
];

const CONSOLE_PAGES = [
  "/dashboard",
  "/dashboard/tournaments",
  "/dashboard/tournaments/new",
  "/dashboard/fixtures",
  "/dashboard/orders",
  "/dashboard/scoring",
  "/admin",
  "/admin/orders",
];

async function setMode(page: Page, mode: "dark" | "light") {
  await page.addInitScript(
    ([k, v]) => window.localStorage.setItem(k as string, v as string),
    [MODE_KEY, mode],
  );
}

async function settle(page: Page, path: string) {
  await page.goto(path, { waitUntil: "load" });
  // Let the reveal choreography finish so nothing is measured mid-transition.
  await page.waitForTimeout(1500);
}

/**
 * Backgrounds that do not change when the theme does.
 *
 * The first version of this asked "is this element dark?", which flagged the
 * primary accent button: lime on a dark page, deep green on a light one, and
 * correct in both. The real question is whether a colour *follows* the theme.
 * Anything painted from a token differs between the two modes; a hard-coded
 * hex is byte-identical, which is exactly what the banner gradients were.
 *
 * Keyed by a structural path so the two passes line up element for element.
 */
const CAPTURE = `() => {
  const path = (el) => {
    const parts = [];
    for (let n = el; n && n.nodeType === 1 && n !== document.documentElement; n = n.parentElement) {
      const i = n.parentElement ? [...n.parentElement.children].indexOf(n) : 0;
      parts.unshift(n.tagName.toLowerCase() + ":" + i);
    }
    return parts.join(">");
  };
  const out = {};
  for (const el of document.querySelectorAll("*")) {
    const r = el.getBoundingClientRect();
    if (r.width * r.height < 12000) continue;
    const s = getComputedStyle(el);
    if (s.visibility === "hidden" || s.display === "none") continue;
    const bg = s.backgroundImage + " | " + s.backgroundColor;
    if (bg.includes("url(")) continue;
    // Only opaque paint counts: scrims and fade overlays carry alpha on purpose.
    const opaque = [...bg.matchAll(/rgba?\\(([^)]+)\\)/gi)].some((m) => {
      const p = m[1].split(/[,\\s\\/]+/).filter(Boolean).map(Number);
      return p.length >= 3 && (p.length < 4 || p[3] >= 0.95);
    }) || /#[0-9a-f]{6}\\b/i.test(bg);
    if (!opaque) continue;
    out[path(el) + "|" + Math.round(r.width) + "x" + Math.round(r.height)] = bg;
  }
  return out;
}`;

/**
 * A card that does not fill its grid cell.
 *
 * Grid items stretch by default, so the cell is already the row's height. The
 * bug is one level in: a card inside the cell that sizes to its own content,
 * which only shows when a sibling happens to have an extra line.
 */
const GRID = `() => {
  const bad = [];
  for (const grid of document.querySelectorAll("*")) {
    if (getComputedStyle(grid).display !== "grid") continue;
    const items = [...grid.children].filter((c) => c.getBoundingClientRect().height > 0);
    if (items.length < 2) continue;
    // Group into visual rows by top edge.
    const rows = new Map();
    for (const it of items) {
      const top = Math.round(it.getBoundingClientRect().top);
      const key = [...rows.keys()].find((k) => Math.abs(k - top) < 4) ?? top;
      rows.set(key, [...(rows.get(key) ?? []), it]);
    }
    for (const row of rows.values()) {
      if (row.length < 2) continue;
      for (const item of row) {
        const ib = item.getBoundingClientRect();
        const kids = [...item.children];
        if (kids.length !== 1) continue;
        const kid = kids[0];
        const ks = getComputedStyle(kid);
        const radius = parseFloat(ks.borderTopLeftRadius) || 0;
        const looksLikeCard =
          radius >= 8 &&
          (ks.borderTopWidth !== "0px" || ks.backgroundColor !== "rgba(0, 0, 0, 0)");
        if (!looksLikeCard) continue;
        const kb = kid.getBoundingClientRect();
        if (ib.height - kb.height > 2) {
          bad.push(
            (kid.className && typeof kid.className === "string"
              ? kid.className.trim().split(/\\s+/).slice(0, 2).join(".")
              : kid.tagName.toLowerCase()) +
            " card " + Math.round(kb.height) + "px in a " + Math.round(ib.height) + "px cell"
          );
        }
      }
    }
  }
  return [...new Set(bad)];
}`;

async function capture(page: Page, path: string) {
  await settle(page, path);
  return (await page.evaluate(`(${CAPTURE})()`)) as Record<string, string>;
}

function frozen(dark: Record<string, string>, light: Record<string, string>) {
  return Object.entries(dark)
    .filter(([key, bg]) => light[key] === bg)
    .map(([key, bg]) => `${key}  ${bg.slice(0, 90)}`);
}

for (const [label, paths, role] of [
  ["public", PUBLIC_PAGES, null],
  ["console", CONSOLE_PAGES, "admin"],
] as const) {
  test(`${label} pages repaint every solid background when the theme flips`, async ({ browser }) => {
    const found: string[] = [];
    for (const path of paths) {
      const shots: Record<string, string>[] = [];
      for (const mode of ["dark", "light"] as const) {
        const ctx = await browser.newContext();
        const page = await ctx.newPage();
        if (role) await signInAs(page, role);
        await setMode(page, mode);
        shots.push(await capture(page, path));
        await ctx.close();
      }
      found.push(...frozen(shots[0], shots[1]).map((f) => `${path}  ${f}`));
    }
    expect(found, "backgrounds identical in both themes (hard-coded, not tokenised)").toEqual([]);
  });
}

/* Card heights depend on how many columns the grid has, so the sweep runs at
   a width where the grids are three-up and again where they fold to two. */
const WIDTHS = [
  { name: "desktop", width: 1280, height: 900 },
  { name: "tablet", width: 820, height: 1180 },
];

for (const vp of WIDTHS) {
  for (const [label, paths, role] of [
    ["public", PUBLIC_PAGES, null],
    ["console", CONSOLE_PAGES, "admin"],
  ] as const) {
    test(`${label} cards fill their grid cells at ${vp.name} width`, async ({ browser }) => {
      const ctx = await browser.newContext({ viewport: { width: vp.width, height: vp.height } });
      const page = await ctx.newPage();
      if (role) await signInAs(page, role);
      const found: string[] = [];
      for (const path of paths) {
        await settle(page, path);
        const bad = (await page.evaluate(`(${GRID})()`)) as string[];
        found.push(...bad.map((b) => `${path}  ${b}`));
      }
      await ctx.close();
      expect(found, `cards short of their row height at ${vp.name} width`).toEqual([]);
    });
  }
}
