"use client";

import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";
import { Counter } from "@/components/fx/counter";
import { useInViewOnce } from "@/components/fx/in-view";
import { cx } from "@/lib/cx";

/* ------------------------------------------------------------- primitives */

export function Card({ className, children, ...rest }: ComponentProps<"div">) {
  return (
    <div
      {...rest}
      className={cx(
        "rounded-2xl border border-line bg-[color-mix(in_oklab,var(--bg-elev)_82%,transparent)]",
        className,
      )}
    >
      {children}
    </div>
  );
}

/** Tiny trend line. Drawn once when the card is scrolled to. */
function Sparkline({ points, up }: { points: number[]; up: boolean }) {
  const { ref, seen } = useInViewOnce<SVGSVGElement>();
  if (points.length < 2) return null;

  const w = 88;
  const h = 26;
  const min = Math.min(...points);
  const max = Math.max(...points);
  const span = max - min || 1;
  const step = w / (points.length - 1);

  const d = points
    .map((p, i) => {
      const x = (i * step).toFixed(1);
      const y = (h - ((p - min) / span) * (h - 4) - 2).toFixed(1);
      return `${i ? "L" : "M"}${x},${y}`;
    })
    .join("");

  const colour = up ? "var(--ok)" : "var(--live)";

  return (
    <svg
      ref={ref}
      width={w}
      height={h}
      viewBox={`0 0 ${w} ${h}`}
      aria-hidden
      className="overflow-visible"
    >
      <path
        d={d}
        fill="none"
        stroke={colour}
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={cx("draw", seen && "in")}
        // Rough path length: enough for the dash trick, no measuring needed.
        style={{ ["--len" as string]: w * 1.6 }}
      />
    </svg>
  );
}

export function StatCard({
  label,
  value,
  sub,
  trend,
  icon,
  countTo,
  countPrefix,
  countSuffix,
  countDecimals,
  spark,
}: {
  label: string;
  value: ReactNode;
  sub?: string;
  trend?: { dir: "up" | "down"; text: string };
  icon?: ReactNode;
  /** When set, the number counts up the first time the card scrolls in.
   *  Plain props only, so a server page can still render this. */
  countTo?: number;
  countPrefix?: string;
  countSuffix?: string;
  countDecimals?: number;
  /** Trend series for the sparkline. */
  spark?: number[];
}) {
  return (
    <Card className="group relative overflow-hidden p-5 transition-[transform,border-color] duration-[var(--dur)] ease-[var(--ease-out)] hover:-translate-y-0.5 hover:border-line-strong">
      <span className="pointer-events-none absolute inset-x-0 top-0 h-px origin-left scale-x-0 bg-[linear-gradient(90deg,var(--accent),transparent)] transition-transform duration-[600ms] ease-[var(--ease-out)] group-hover:scale-x-100" />
      <div className="flex items-start justify-between gap-3">
        <p className="text-[12px] text-fg-muted">{label}</p>
        {icon ? <span className="text-fg-subtle">{icon}</span> : null}
      </div>
      <p className="mt-2 font-mono text-[26px] font-semibold leading-none tabular-nums">
        {countTo !== undefined ? (
          <Counter
            value={countTo}
            prefix={countPrefix}
            suffix={countSuffix}
            decimals={countDecimals ?? 0}
          />
        ) : (
          value
        )}
      </p>
      <div className="mt-2 flex items-end justify-between gap-3">
        <div>
          {sub ? <p className="text-[11.5px] text-fg-subtle">{sub}</p> : null}
          {trend ? (
            <p
              className={cx(
                "text-[11.5px] font-medium",
                trend.dir === "up" ? "text-[var(--ok)]" : "text-[var(--live)]",
              )}
            >
              {trend.dir === "up" ? "▲" : "▼"} {trend.text}
            </p>
          ) : null}
        </div>
        {spark ? (
          <span className="shrink-0 opacity-70 transition-opacity duration-[var(--dur)] group-hover:opacity-100">
            <Sparkline points={spark} up={trend?.dir !== "down"} />
          </span>
        ) : null}
      </div>
    </Card>
  );
}

const BADGE_TONES = {
  live: "border-[color-mix(in_oklab,var(--live)_45%,transparent)] bg-[color-mix(in_oklab,var(--live)_16%,transparent)] text-[var(--live)]",
  upcoming: "border-line bg-surface text-fg-muted",
  completed: "border-line bg-surface text-fg-subtle",
  open: "border-[color-mix(in_oklab,var(--accent)_45%,transparent)] bg-[color-mix(in_oklab,var(--accent)_14%,transparent)] text-[var(--accent)]",
  closed: "border-[color-mix(in_oklab,var(--warn)_45%,transparent)] bg-[color-mix(in_oklab,var(--warn)_14%,transparent)] text-[var(--warn)]",
  featured: "border-[color-mix(in_oklab,var(--accent-2)_50%,transparent)] bg-[color-mix(in_oklab,var(--accent-2)_16%,transparent)] text-[var(--accent-2)]",
  info: "border-[color-mix(in_oklab,var(--info)_45%,transparent)] bg-[color-mix(in_oklab,var(--info)_14%,transparent)] text-[var(--info)]",
  neutral: "border-line bg-surface text-fg-muted",
} as const;

export type BadgeTone = keyof typeof BADGE_TONES;

export function Badge({
  tone = "neutral",
  children,
  pulse,
  className,
}: {
  tone?: BadgeTone;
  children: ReactNode;
  pulse?: boolean;
  className?: string;
}) {
  return (
    <span
      className={cx(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide",
        BADGE_TONES[tone],
        className,
      )}
    >
      {pulse ? (
        <span className="relative flex h-1.5 w-1.5">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-current opacity-75" />
          <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-current" />
        </span>
      ) : null}
      {children}
    </span>
  );
}

export function TeamBadge({
  short,
  colour,
  size = 36,
}: {
  short: string;
  colour: string;
  size?: number;
}) {
  return (
    <span
      className="grid shrink-0 place-items-center rounded-full font-mono font-bold"
      style={{
        width: size,
        height: size,
        fontSize: size * 0.3,
        background: `color-mix(in oklab, ${colour} 22%, transparent)`,
        color: colour,
        border: `1px solid color-mix(in oklab, ${colour} 45%, transparent)`,
      }}
    >
      {short}
    </span>
  );
}

/* --------------------------------------------------------- cricket pieces */

export function BallChip({ v, size = 28 }: { v: string; size?: number }) {
  const tone =
    v === "W"
      ? "bg-[var(--live)] text-white border-transparent"
      : v === "6"
        ? "bg-[var(--six)] text-white border-transparent"
        : v === "4"
          ? "bg-[var(--info)] text-white border-transparent"
          : v === "wd" || v === "nb"
            ? "bg-[color-mix(in_oklab,var(--warn)_20%,transparent)] text-[var(--warn)] border-[color-mix(in_oklab,var(--warn)_40%,transparent)]"
            : "bg-surface text-fg-muted border-line";
  return (
    <span
      className={cx(
        "grid shrink-0 place-items-center rounded-full border font-mono font-semibold",
        tone,
      )}
      style={{ width: size, height: size, fontSize: size * 0.42 }}
    >
      {v}
    </span>
  );
}

export function OverStrip({ balls }: { balls: readonly string[] }) {
  return (
    <div className="flex items-center gap-1.5">
      {balls.map((b, i) => (
        <BallChip key={`${b}-${i}`} v={b} />
      ))}
    </div>
  );
}

/* --------------------------------------------------------------- feedback */

export function EmptyState({
  title,
  body,
  action,
  icon,
}: {
  title: string;
  body: string;
  action?: ReactNode;
  icon?: ReactNode;
}) {
  return (
    <div className="grid place-items-center rounded-2xl border border-dashed border-line-strong bg-surface/40 px-6 py-14 text-center">
      <div className="max-w-sm">
        {icon ? (
          <span className="mx-auto mb-4 grid h-12 w-12 place-items-center rounded-full border border-line bg-surface text-fg-subtle">
            {icon}
          </span>
        ) : null}
        <p className="text-[15px] font-semibold">{title}</p>
        <p className="mt-1.5 text-[13px] leading-relaxed text-fg-muted">{body}</p>
        {action ? <div className="mt-5">{action}</div> : null}
      </div>
    </div>
  );
}

export function Skeleton({ className }: { className?: string }) {
  return (
    <span
      className={cx(
        "block animate-pulse rounded-md bg-[color-mix(in_oklab,var(--fg)_8%,transparent)]",
        className,
      )}
    />
  );
}

export function Progress({
  value,
  max,
  tone = "accent",
}: {
  value: number;
  max: number;
  tone?: "accent" | "warn" | "info";
}) {
  const pct = Math.min(100, Math.round((value / Math.max(1, max)) * 100));
  const bg =
    tone === "warn"
      ? "var(--warn)"
      : tone === "info"
        ? "var(--info)"
        : "linear-gradient(90deg,var(--accent),var(--accent-2))";
  return (
    <span className="block h-1.5 w-full overflow-hidden rounded-full bg-line">
      <span
        className="block h-full rounded-full transition-[width] duration-[700ms] ease-[var(--ease-out)]"
        style={{ width: `${pct}%`, background: bg }}
      />
    </span>
  );
}

/* ----------------------------------------------------------------- tables */

export function Table({ children }: { children: ReactNode }) {
  return (
    <div className="overflow-x-auto scroll-thin">
      <table className="w-full min-w-[34rem] text-[13.5px]">{children}</table>
    </div>
  );
}

export function Th({ children, align }: { children?: ReactNode; align?: "right" }) {
  return (
    <th
      className={cx(
        "whitespace-nowrap px-4 py-2.5 font-mono text-[10px] font-semibold uppercase tracking-widest text-fg-subtle",
        align === "right" ? "text-right" : "text-left",
      )}
    >
      {children}
    </th>
  );
}

export function Td({
  children,
  align,
  className,
  testId,
}: {
  children?: ReactNode;
  align?: "right";
  className?: string;
  /** Explicit, because this component does not spread unknown props. */
  testId?: string;
}) {
  return (
    <td
      data-testid={testId}
      className={cx("whitespace-nowrap px-4 py-3", align === "right" ? "text-right" : "", className)}
    >
      {children}
    </td>
  );
}

export function Tbody({ children }: { children: ReactNode }) {
  // Hold the cascade until the table is actually in view, so rows further
  // down the page do not play their entrance before anyone sees them.
  const { ref, seen } = useInViewOnce<HTMLTableSectionElement>({ amount: 0.02 });
  return (
    <tbody ref={ref} className={cx("rows-cascade", seen && "in")}>
      {children}
    </tbody>
  );
}

export function Tr({ children }: { children: ReactNode }) {
  return (
    <tr className="group border-t border-line transition-colors duration-[var(--dur)] hover:bg-surface">
      {children}
    </tr>
  );
}

/* ---------------------------------------------------------------- buttons */

type BtnProps = {
  variant?: "primary" | "secondary" | "ghost" | "gold" | "danger";
  size?: "sm" | "md";
  className?: string;
  children: ReactNode;
  href?: string;
} & Omit<ComponentProps<"button">, "ref">;

/** Note: this carries `inline-flex`, so passing `hidden` through `className`
 *  will NOT hide the button — both are display utilities of equal weight and
 *  `inline-flex` wins. Wrap the button in a `<span className="hidden …">`. */
const BTN_BASE =
  "group/btn relative inline-flex items-center justify-center gap-2 rounded-full font-semibold transition-[transform,background-color,border-color,box-shadow] duration-[var(--dur)] ease-[var(--ease-out)] active:scale-[0.98] disabled:pointer-events-none disabled:opacity-50";

const BTN_VARIANT = {
  primary:
    "border border-transparent bg-[linear-gradient(110deg,var(--accent),color-mix(in_oklab,var(--accent)_55%,var(--accent-2)))] text-[var(--accent-fg)] shadow-[0_10px_34px_-14px_var(--glow)] hover:-translate-y-0.5 hover:shadow-[0_16px_44px_-12px_var(--glow)]",
  secondary:
    "border border-line bg-surface text-fg hover:-translate-y-0.5 hover:border-line-strong hover:bg-surface-strong",
  ghost: "border border-transparent text-fg-muted hover:bg-surface-strong hover:text-fg",
  gold: "border border-[color-mix(in_oklab,var(--accent-2)_55%,transparent)] bg-[color-mix(in_oklab,var(--accent-2)_16%,transparent)] text-[var(--accent-2)] hover:-translate-y-0.5 hover:bg-[color-mix(in_oklab,var(--accent-2)_24%,transparent)]",
  danger:
    "border border-[color-mix(in_oklab,var(--live)_50%,transparent)] bg-[color-mix(in_oklab,var(--live)_14%,transparent)] text-[var(--live)] hover:bg-[color-mix(in_oklab,var(--live)_22%,transparent)]",
} as const;

export function Button({
  variant = "secondary",
  size = "md",
  className,
  children,
  href,
  ...rest
}: BtnProps) {
  const cls = cx(
    BTN_BASE,
    BTN_VARIANT[variant],
    size === "sm" ? "h-8 px-3.5 text-[12.5px]" : "h-10 px-5 text-[13.5px]",
    className,
  );
  if (href)
    return (
      <Link href={href} className={cls}>
        {children}
      </Link>
    );
  return (
    <button {...rest} className={cls}>
      {children}
    </button>
  );
}

export function SectionHeading({
  eyebrow,
  title,
  sub,
  action,
}: {
  eyebrow?: string;
  title: string;
  sub?: string;
  action?: ReactNode;
}) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
      <div>
        {eyebrow ? (
          <span className="inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.22em] text-fg-subtle">
            <span className="h-px w-7 bg-[linear-gradient(90deg,transparent,var(--accent))]" />
            {eyebrow}
          </span>
        ) : null}
        <h2 className="display mt-3 text-[clamp(1.5rem,3vw,2.1rem)]">{title}</h2>
        {sub ? <p className="mt-1.5 max-w-xl text-[13.5px] text-fg-muted">{sub}</p> : null}
      </div>
      {action}
    </div>
  );
}
