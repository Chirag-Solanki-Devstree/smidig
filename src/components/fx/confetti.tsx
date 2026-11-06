"use client";

import { useMemo } from "react";
import { motion, useReducedMotion } from "motion/react";

const COLOURS = ["var(--accent)", "var(--accent-2)", "var(--info)", "var(--six)", "var(--ok)"];

/**
 * A short confetti burst for a completed payment or registration.
 * Hand-rolled on transforms only — no canvas library, nothing left running.
 */
export function Confetti({ count = 44 }: { count?: number }) {
  const reduce = useReducedMotion();

  const bits = useMemo(
    () =>
      Array.from({ length: count }, (_, i) => {
        // Deterministic spread so server and client agree.
        const a = (i / count) * Math.PI * 2;
        const dist = 90 + ((i * 37) % 120);
        return {
          i,
          x: Math.cos(a) * dist,
          y: Math.sin(a) * dist - 40,
          rot: ((i * 53) % 360) - 180,
          colour: COLOURS[i % COLOURS.length],
          size: 5 + ((i * 7) % 6),
          delay: (i % 8) * 0.016,
        };
      }),
    [count],
  );

  if (reduce) return null;

  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 grid place-items-center overflow-visible">
      {bits.map((b) => (
        <motion.span
          key={b.i}
          initial={{ x: 0, y: 0, opacity: 1, rotate: 0, scale: 1 }}
          animate={{ x: b.x, y: b.y + 180, opacity: 0, rotate: b.rot, scale: 0.6 }}
          transition={{ duration: 1.5, delay: b.delay, ease: [0.17, 0.67, 0.4, 1] }}
          className="absolute rounded-[2px]"
          style={{ width: b.size, height: b.size * 1.6, background: b.colour }}
        />
      ))}
    </div>
  );
}
