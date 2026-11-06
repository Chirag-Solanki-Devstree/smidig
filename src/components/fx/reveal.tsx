"use client";

import { motion, type Variants } from "motion/react";
import type { ReactNode } from "react";

const EASE = [0.22, 1, 0.36, 1] as const;

/**
 * Opacity + transform only — no `filter`.
 *
 * A blur in the hidden state is held by every unrevealed element at once, and
 * each one keeps its own offscreen buffer alive for the whole scroll. With
 * ~30 of them on the page that was the single largest scroll cost here.
 */
export const riseIn: Variants = {
  hidden: { opacity: 0, y: 26 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, ease: EASE },
  },
};

/** Scroll-triggered container. Children using `riseIn` stagger automatically. */
export function Reveal({
  children,
  className,
  delay = 0,
  stagger = 0.08,
  amount = 0.3,
  once = true,
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
  stagger?: number;
  amount?: number;
  once?: boolean;
}) {
  return (
    <motion.div
      className={className}
      initial="hidden"
      whileInView="show"
      viewport={{ once, amount }}
      variants={{
        hidden: {},
        show: { transition: { staggerChildren: stagger, delayChildren: delay } },
      }}
    >
      {children}
    </motion.div>
  );
}

/** A single item inside <Reveal>. */
export function RevealItem({
  children,
  className,
  as = "div",
}: {
  children: ReactNode;
  className?: string;
  as?: "div" | "li" | "p" | "span";
}) {
  const Tag = motion[as];
  return (
    <Tag variants={riseIn} className={className}>
      {children}
    </Tag>
  );
}
