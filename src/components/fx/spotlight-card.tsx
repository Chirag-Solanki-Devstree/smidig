"use client";

import { useRef } from "react";
import { motion, useMotionTemplate, useMotionValue } from "motion/react";
import type { ReactNode } from "react";
import { cx } from "@/lib/cx";

/**
 * Card whose border and surface light up where the cursor is.
 * Pointer position feeds two motion values, so no React re-render per frame.
 */
export function SpotlightCard({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const mx = useMotionValue(-200);
  const my = useMotionValue(-200);

  const border = useMotionTemplate`radial-gradient(220px circle at ${mx}px ${my}px, color-mix(in oklab, var(--accent) 70%, white), transparent 70%)`;
  const glow = useMotionTemplate`radial-gradient(320px circle at ${mx}px ${my}px, color-mix(in oklab, var(--accent) 16%, transparent), transparent 70%)`;

  return (
    <div
      ref={ref}
      onPointerMove={(e) => {
        const r = ref.current?.getBoundingClientRect();
        if (!r) return;
        mx.set(e.clientX - r.left);
        my.set(e.clientY - r.top);
      }}
      onPointerLeave={() => {
        mx.set(-200);
        my.set(-200);
      }}
      className={cx(
        "group relative overflow-hidden rounded-2xl glass",
        "transition-transform duration-500 will-change-transform hover:-translate-y-1",
        className,
      )}
    >
      {/* lit border: a gradient layer masked to a 1px ring */}
      <motion.div
        aria-hidden
        className="pointer-events-none absolute inset-0 rounded-2xl opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        style={{
          background: border,
          mask: "linear-gradient(#000,#000) content-box, linear-gradient(#000,#000)",
          maskComposite: "exclude",
          WebkitMask:
            "linear-gradient(#000,#000) content-box, linear-gradient(#000,#000)",
          WebkitMaskComposite: "xor",
          padding: 1,
        }}
      />
      <motion.div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        style={{ background: glow }}
      />
      <div className="relative">{children}</div>
    </div>
  );
}
