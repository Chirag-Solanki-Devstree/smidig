import { expect, type Page } from "@playwright/test";

export const SESSION_KEY = "smidig.session";

export type Role =
  | "admin"
  | "organizer"
  | "captain"
  | "spectator"
  | "sponsor"
  | "vendor";

/** Seed a session before the app boots, so guarded routes render directly. */
export async function signInAs(page: Page, role: Role, email = "test@smidig.app") {
  await page.addInitScript(
    ([key, value]) => window.localStorage.setItem(key as string, value as string),
    [SESSION_KEY, JSON.stringify({ name: "Test User", email, role })],
  );
}

/**
 * Every clickable thing on the page must actually be reachable: visible,
 * enabled, and not covered by another element at its own centre point.
 * This is what catches "the click does nothing" bugs.
 */
export async function expectAllClickablesHittable(page: Page, opts?: { skip?: string[] }) {
  const skip = opts?.skip ?? [];

  const targets = page.locator(
    "a[href], button:not([disabled]), [role='button']:not([aria-disabled='true'])",
  );
  const count = await targets.count();
  expect(count, "page should have clickable elements").toBeGreaterThan(0);

  const blocked: string[] = [];

  for (let i = 0; i < count; i++) {
    const el = targets.nth(i);
    if (!(await el.isVisible())) continue;

    const label =
      (await el.getAttribute("data-testid")) ||
      (await el.getAttribute("aria-label")) ||
      ((await el.textContent()) || "").trim().slice(0, 40) ||
      (await el.getAttribute("href")) ||
      `#${i}`;

    if (skip.some((s) => label.includes(s))) continue;

    // elementFromPoint works in viewport coordinates, so bring it on screen.
    await el.scrollIntoViewIfNeeded().catch(() => {});
    // Lenis keeps scrolling after the call returns; let it settle.
    await waitForScrollIdle(page);

    // Measure and hit-test in one pass, inside the page, so the element cannot
    // move between reading its box and asking what is on top of it.
    const result = await el.evaluate((node) => {
      const r = (node as Element).getBoundingClientRect();
      if (r.width < 2 || r.height < 2) return null;
      const x = r.x + r.width / 2;
      const y = r.y + r.height / 2;
      if (y < 0 || y > innerHeight || x < 0 || x > innerWidth) return null;

      const top = document.elementFromPoint(x, y);
      if (!top) return null;
      if (node === top || (node as Element).contains(top) || top.contains(node)) return null;

      const hit = top.closest("a[href], button, [role='button'], label");
      if (hit === node) return null;

      const cls = (top.getAttribute?.("class") || "").slice(0, 70);
      return `covered by <${top.tagName.toLowerCase()} class="${cls}">`;
    });

    if (result) blocked.push(`${label} — ${result}`);
  }

  expect(blocked, `clickables blocked by an overlay:\n${blocked.join("\n")}`).toEqual([]);
}

/** Resolves once the scroll position has stopped changing. */
export async function waitForScrollIdle(page: Page, quietFrames = 3) {
  await page.evaluate(
    (quiet) =>
      new Promise<void>((resolve) => {
        let last = window.scrollY;
        let still = 0;
        const tick = () => {
          const now = window.scrollY;
          still = Math.abs(now - last) < 0.5 ? still + 1 : 0;
          last = now;
          if (still >= quiet) resolve();
          else requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
        setTimeout(resolve, 1500);
      }),
    quietFrames,
  );
}

/** No console errors other than known-noisy dev/network chatter. */
export function collectConsoleErrors(page: Page) {
  const errors: string[] = [];
  page.on("console", (m) => {
    if (m.type() !== "error") return;
    const t = m.text();
    if (t.includes("_next/hmr") || t.includes("Failed to load resource")) return;
    errors.push(t);
  });
  page.on("pageerror", (e) => errors.push(String(e)));
  return errors;
}
