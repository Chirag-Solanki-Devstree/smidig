"use client";

import type { ComponentProps, ReactNode } from "react";
import { Rule } from "@/components/kit";
import { cx } from "@/lib/cx";

/** Label that swaps itself out upward on hover of the button or any parent link. */
export function Swap({ children }: { children: string }) {
  return (
    <span className="swap">
      <span>{children}</span>
      <span aria-hidden>{children}</span>
    </span>
  );
}

export function PrimaryButton({ className, children, ...rest }: ComponentProps<"button">) {
  return (
    <button
      {...rest}
      className={cx(
        "group relative inline-flex h-12 items-center justify-center gap-2 overflow-hidden rounded-full px-7",
        "text-sm font-semibold text-[var(--accent-fg)]",
        "bg-[linear-gradient(110deg,var(--accent),color-mix(in_oklab,var(--accent)_55%,var(--accent-2)))]",
        "shadow-[0_0_0_1px_color-mix(in_oklab,var(--accent)_70%,white),0_14px_44px_-14px_var(--glow)]",
        "transition-[transform,box-shadow] duration-[var(--dur)] ease-[var(--ease-out)]",
        "hover:shadow-[0_0_0_1px_color-mix(in_oklab,var(--accent)_85%,white),0_20px_56px_-12px_var(--glow)] active:scale-[0.98]",
        className,
      )}
    >
      <span
        aria-hidden
        className="absolute inset-0 -translate-x-full bg-[linear-gradient(90deg,transparent,rgba(255,255,255,0.45),transparent)] transition-transform duration-[900ms] ease-[var(--ease-out)] group-hover:translate-x-full"
      />
      <span className="relative flex items-center gap-2">{children}</span>
    </button>
  );
}

export function GhostButton({ className, children, ...rest }: ComponentProps<"button">) {
  return (
    <button
      {...rest}
      className={cx(
        "group inline-flex h-12 items-center justify-center gap-2 rounded-full border border-line px-6",
        "bg-surface text-sm font-medium text-fg",
        "transition-[background-color,border-color,transform] duration-[var(--dur)] ease-[var(--ease-out)]",
        "hover:-translate-y-0.5 hover:border-line-strong hover:bg-surface-strong active:scale-[0.98]",
        className,
      )}
    >
      {children}
    </button>
  );
}

export function Pill({ children }: { children: ReactNode }) {
  return (
    <span className="inline-flex items-center gap-2 rounded-full border border-line bg-surface px-3.5 py-1.5 text-[12px] text-fg-muted">
      {children}
    </span>
  );
}

export function SectionLabel({ children }: { children: ReactNode }) {
  return (
    <span className="inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.22em] text-fg-subtle">
      <Rule />
      {children}
    </span>
  );
}

/** Pulsing live dot. */
export function LiveDot({ className }: { className?: string }) {
  return (
    <span className={cx("relative flex h-2 w-2", className)}>
      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[var(--accent-3)] opacity-70" />
      <span className="relative inline-flex h-2 w-2 rounded-full bg-[var(--accent-3)]" />
    </span>
  );
}

/** Stitched cricket-ball mark used as the logo. */
export function BallMark({ size = 32 }: { size?: number }) {
  return (
    <span
      className="group/ball relative grid shrink-0 place-items-center rounded-full bg-[linear-gradient(135deg,var(--accent),var(--accent-2))] shadow-[0_6px_22px_-8px_var(--glow)] transition-transform duration-[700ms] ease-[var(--ease-out)] hover:rotate-[160deg] hover:scale-105"
      style={{ width: size, height: size }}
    >
      <svg viewBox="0 0 24 24" width={size * 0.62} height={size * 0.62} fill="none">
        <path
          d="M7.5 2.6C9.6 6 9.6 18 7.5 21.4"
          stroke="var(--accent-fg)"
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeDasharray="2 2.4"
        />
        <path
          d="M16.5 2.6C14.4 6 14.4 18 16.5 21.4"
          stroke="var(--accent-fg)"
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeDasharray="2 2.4"
        />
      </svg>
    </span>
  );
}
