"use client";

import { useRef } from "react";
import {
  motion,
  useMotionTemplate,
  useMotionValue,
  useSpring,
  useTransform,
  useReducedMotion,
} from "motion/react";
import type { ReactNode } from "react";
import { cx } from "@/lib/cx";

/**
 * Hover tilt with a sheen that tracks the pointer.
 * Pointer position lives in motion values, so a moving cursor never
 * triggers a React render — only the compositor works.
 */
export function TiltCard({
  children,
  className,
  max = 9,
  lift = 8,
}: {
  children: ReactNode;
  className?: string;
  /** Maximum rotation in degrees. */
  max?: number;
  /** How far the card rises toward the viewer, in px. */
  lift?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();

  // -0.5 .. 0.5 across the card
  const px = useMotionValue(0);
  const py = useMotionValue(0);
  const hover = useMotionValue(0);

  const spring = { stiffness: 220, damping: 24, mass: 0.5 };
  const rotateY = useSpring(useTransform(px, [-0.5, 0.5], [-max, max]), spring);
  const rotateX = useSpring(useTransform(py, [-0.5, 0.5], [max, -max]), spring);
  const z = useSpring(useTransform(hover, [0, 1], [0, lift]), spring);

  const gx = useTransform(px, [-0.5, 0.5], ["0%", "100%"]);
  const gy = useTransform(py, [-0.5, 0.5], ["0%", "100%"]);
  const sheen = useMotionTemplate`radial-gradient(60% 60% at ${gx} ${gy}, color-mix(in oklab, var(--accent) 22%, transparent), transparent 70%)`;
  const ring = useMotionTemplate`radial-gradient(40% 40% at ${gx} ${gy}, color-mix(in oklab, var(--accent) 85%, white), transparent 70%)`;

  if (reduce) {
    return (
      <div className={cx("relative rounded-2xl glass", className)}>{children}</div>
    );
  }

  return (
    <div style={{ perspective: 1000 }} className="h-full">
      <motion.div
        ref={ref}
        onPointerMove={(e) => {
          const r = ref.current?.getBoundingClientRect();
          if (!r) return;
          px.set((e.clientX - r.left) / r.width - 0.5);
          py.set((e.clientY - r.top) / r.height - 0.5);
        }}
        onPointerEnter={() => hover.set(1)}
        onPointerLeave={() => {
          hover.set(0);
          px.set(0);
          py.set(0);
        }}
        style={{ rotateX, rotateY, z, transformStyle: "preserve-3d" }}
        className={cx(
          "group relative h-full overflow-hidden rounded-2xl glass will-change-transform",
          className,
        )}
      >
        <motion.span
          aria-hidden
          style={{ background: sheen, opacity: hover }}
          className="pointer-events-none absolute inset-0"
        />
        <motion.span
          aria-hidden
          style={{
            background: ring,
            opacity: hover,
            mask: "linear-gradient(#000,#000) content-box, linear-gradient(#000,#000)",
            maskComposite: "exclude",
            WebkitMask:
              "linear-gradient(#000,#000) content-box, linear-gradient(#000,#000)",
            WebkitMaskComposite: "xor",
            padding: 1,
          }}
          className="pointer-events-none absolute inset-0 rounded-2xl"
        />
        <div className="relative h-full" style={{ transform: "translateZ(40px)" }}>
          {children}
        </div>
      </motion.div>
    </div>
  );
}
