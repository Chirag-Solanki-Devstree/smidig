"use client";

import { useEffect } from "react";
import { motion, useMotionValue, useSpring } from "motion/react";

const SIZE = 760;

/**
 * Floodlight that trails the pointer.
 *
 * It is a fixed-size element moved with `x`/`y`, not a full-viewport element
 * whose `background` gradient is rewritten each frame — rewriting the gradient
 * repaints the whole viewport on every pointer move, which is exactly the kind
 * of work that competes with scrolling.
 */
export function CursorGlow() {
  const x = useMotionValue(-9999);
  const y = useMotionValue(-9999);
  const sx = useSpring(x, { stiffness: 90, damping: 22, mass: 0.6 });
  const sy = useSpring(y, { stiffness: 90, damping: 22, mass: 0.6 });

  useEffect(() => {
    if (!window.matchMedia("(pointer: fine)").matches) return;

    // Coalesce to one write per frame; pointermove can fire far more often.
    let px = 0;
    let py = 0;
    let queued = false;
    const flush = () => {
      queued = false;
      x.set(px - SIZE / 2);
      y.set(py - SIZE / 2);
    };
    const move = (e: PointerEvent) => {
      px = e.clientX;
      py = e.clientY;
      if (!queued) {
        queued = true;
        requestAnimationFrame(flush);
      }
    };

    window.addEventListener("pointermove", move, { passive: true });
    return () => window.removeEventListener("pointermove", move);
  }, [x, y]);

  return (
    <motion.div
      aria-hidden
      style={{ x: sx, y: sy, width: SIZE, height: SIZE, willChange: "transform" }}
      className="pointer-events-none fixed left-0 top-0 z-[5] hidden rounded-full bg-[radial-gradient(circle_at_center,color-mix(in_oklab,var(--accent)_10%,transparent)_0%,transparent_62%)] md:block"
    />
  );
}
