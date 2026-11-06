import { test, expect } from "@playwright/test";
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";

/**
 * Guards for performance mistakes that render correctly and so slip past every
 * other test in this suite. Each one here was a real measured regression, not a
 * hypothetical: the interaction tests all passed while the dashboard dropped a
 * frame on every scroll, because a dropped frame is not a wrong pixel.
 */

/** Comments explain these rules, so they must not trip them. */
function code(src: string) {
  return src.replace(/\/\*[\s\S]*?\*\//g, "").replace(/(^|\s)\/\/.*$/gm, "");
}

function sourceFiles(dir = "src"): string[] {
  return readdirSync(dir).flatMap((name) => {
    const path = join(dir, name);
    if (statSync(path).isDirectory()) return sourceFiles(path);
    return /\.tsx?$/.test(name) ? [path] : [];
  });
}

test.describe.configure({ mode: "serial" });

test.describe("performance guards", () => {
  test("no per-call locale formatting in rendered code", () => {
    // `n.toLocaleString(locale)` constructs a fresh Intl formatter on every
    // call, and building the formatter is the expensive half. These screens
    // format money in table cells, stat cards and chart tooltips, so the cost
    // lands on scroll and keystroke paths. The revenue chart's tooltip hit
    // 32.6ms of script while the pointer crossed the chart mid-scroll.
    // Use the shared formatters in src/lib/money.ts instead — they are built
    // once at module scope.
    // toLocaleDateString and toLocaleTimeString cost exactly the same and were
    // missed by the first version of this guard, which named only one of them.
    const offenders = sourceFiles()
      .map((f) => [f, code(readFileSync(f, "utf8"))] as const)
      .filter(([, src]) => /\.toLocale(String|DateString|TimeString)\(/.test(src))
      .map(([f]) => f);

    expect(
      offenders,
      "use the cached formatters in src/lib/money.ts or src/lib/dates.ts",
    ).toEqual([]);
  });

  test("Intl formatters are built at module scope, not inside components", () => {
    // Same cost, moved: `new Intl.NumberFormat(...)` inside a component body or
    // a render callback pays construction on every render.
    const offenders: string[] = [];
    for (const file of sourceFiles()) {
      const src = code(readFileSync(file, "utf8"));
      for (const [i, line] of src.split("\n").entries()) {
        if (!/new Intl\.(NumberFormat|DateTimeFormat)/.test(line)) continue;
        // Module-scope declarations start at column 0; anything indented is
        // inside a function, a component or a callback.
        if (/^(const|let|var|export)/.test(line)) continue;
        offenders.push(`${file}:${i + 1}`);
      }
    }
    expect(offenders, "hoist the formatter to module scope").toEqual([]);
  });
});
