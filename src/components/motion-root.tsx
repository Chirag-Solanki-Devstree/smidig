"use client";

import { MotionConfig } from "motion/react";

/**
 * One place to set the page's motion defaults.
 * `reducedMotion="user"` drops transform and layout animation for anyone who
 * asks for reduced motion, while keeping opacity and colour changes.
 */
export function MotionRoot({ children }: { children: React.ReactNode }) {
  return (
    <MotionConfig
      reducedMotion="user"
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </MotionConfig>
  );
}
