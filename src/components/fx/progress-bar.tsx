"use client";

import { motion, useScroll, useSpring } from "motion/react";

/** Thin page-scroll indicator pinned under the nav. */
export function ScrollProgress() {
  const { scrollYProgress } = useScroll();
  const x = useSpring(scrollYProgress, { stiffness: 140, damping: 26, restDelta: 0.001 });

  return (
    <motion.div
      aria-hidden
      style={{ scaleX: x }}
      // pointer-events-none matters: this sits above the nav at z-60, and
      // without it the top 2px of the nav stops taking clicks.
      className="pointer-events-none fixed inset-x-0 top-0 z-[60] h-[2px] origin-left bg-[linear-gradient(90deg,var(--accent),var(--accent-2),var(--accent-3))]"
    />
  );
}
