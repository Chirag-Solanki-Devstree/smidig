"use client";

import { motion, useReducedMotion } from "motion/react";

/**
 * Fixed backdrop: pitch stripes, hairline grid, drifting floodlight pools, grain.
 *
 * Deliberately filter-free. A `blur()` on a viewport-sized element forces the
 * browser to allocate and re-blur a full-screen offscreen buffer, which is one
 * of the biggest costs during a fast scroll. Radial gradients with soft stops
 * give the same look for free, and the pools then animate purely on the
 * compositor.
 */
export function Backdrop() {
  const reduce = useReducedMotion();

  const pool = (
    i: number,
    className: string,
    to: [number, number],
    dur: number,
  ) => (
    <motion.div
      key={i}
      aria-hidden
      className={className}
      style={{ willChange: "transform" }}
      animate={reduce ? undefined : { x: [0, to[0], 0], y: [0, to[1], 0], scale: [1, 1.12, 1] }}
      transition={{ duration: dur, repeat: Infinity, ease: "easeInOut" }}
    />
  );

  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      <div className="absolute inset-0 turf-bg opacity-60" />
      <div className="absolute inset-0 grid-bg mask-fade-y opacity-70" />

      <div className="absolute inset-0">
        {pool(
          0,
          "absolute left-[2%] top-[-22%] h-[56vmax] w-[56vmax] rounded-full bg-[radial-gradient(circle_at_center,color-mix(in_oklab,var(--accent)_38%,transparent)_0%,transparent_58%)]",
          [140, 90],
          26,
        )}
        {pool(
          1,
          "absolute right-[-6%] top-[0%] h-[46vmax] w-[46vmax] rounded-full bg-[radial-gradient(circle_at_center,color-mix(in_oklab,var(--accent-2)_32%,transparent)_0%,transparent_58%)]",
          [-110, 130],
          32,
        )}
        {pool(
          2,
          "absolute left-[28%] top-[56%] h-[50vmax] w-[50vmax] rounded-full bg-[radial-gradient(circle_at_center,color-mix(in_oklab,var(--accent-3)_22%,transparent)_0%,transparent_58%)]",
          [100, -120],
          38,
        )}
      </div>

      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_0%,transparent_28%,var(--bg)_76%)]" />

      {/* Grain. No mix-blend-mode: a blend mode forces the whole stacking
          context to re-composite on every frame it is painted over. */}
      <div
        className="absolute inset-0 opacity-[var(--noise-opacity)]"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='160'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
        }}
      />
    </div>
  );
}
