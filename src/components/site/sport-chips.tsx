"use client";

import { useState } from "react";
import { motion } from "motion/react";
import { SPORTS } from "@/lib/sports";
import { cx } from "@/lib/cx";

/**
 * Sport switcher. Only cricket is live in phase 1; the rest are shown as
 * "soon" so the marketplace reads as multi-sport from day one and the filter
 * needs no redesign when they turn on.
 */
export function SportChips() {
  const [active, setActive] = useState("cricket");

  return (
    <div className="mask-fade-x -mx-1 overflow-x-auto scroll-thin">
      <div className="flex min-w-max items-center gap-2 px-1 py-1">
        {SPORTS.map((s) => {
          const on = active === s.id;
          const planned = s.status === "planned";
          return (
            <button
              key={s.id}
              onClick={() => !planned && setActive(s.id)}
              disabled={planned}
              className={cx(
                "relative inline-flex items-center gap-2 rounded-full border px-3.5 py-2 text-[12.5px] font-medium",
                "transition-[color,border-color,transform] duration-[var(--dur)] ease-[var(--ease-out)]",
                planned
                  ? "cursor-not-allowed border-line text-fg-subtle opacity-60"
                  : on
                    ? "border-transparent text-[var(--accent-fg)]"
                    : "border-line text-fg-muted hover:-translate-y-0.5 hover:border-line-strong hover:text-fg",
              )}
            >
              {on ? (
                <motion.span
                  layoutId="sport-chip"
                  transition={{ type: "spring", stiffness: 380, damping: 32, mass: 0.6 }}
                  className="absolute inset-0 rounded-full bg-[linear-gradient(110deg,var(--accent),var(--accent-2))]"
                />
              ) : null}
              <span className="relative flex items-center gap-2">
                <s.icon size={14} />
                {s.name}
                {planned ? (
                  <span className="rounded-full border border-line px-1.5 py-px text-[9.5px] uppercase tracking-wide">
                    soon
                  </span>
                ) : null}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
