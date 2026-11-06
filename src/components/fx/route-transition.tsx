"use client";

import { usePathname } from "next/navigation";
import { motion, type Variants } from "motion/react";
import type { ReactNode } from "react";

const EASE = [0.22, 1, 0.36, 1] as const;

/**
 * Per-surface entrance transitions.
 *
 * Each route family gets its own movement rather than one shared fade, so the
 * app tells you where you are before you read anything: the marketplace
 * settles, browse sweeps in from the side, a tournament page unrolls from the
 * banner down, a match page snaps in like a broadcast cut, the dashboard
 * slides in behind its sidebar, and admin opens like a shutter.
 *
 * Entrance only. Next's App Router unmounts the old route before the new one
 * paints, so an exit animation would not reliably play.
 */
const TRANSITIONS: { test: RegExp; name: string; variants: Variants }[] = [
  {
    test: /^\/admin/,
    name: "shutter",
    variants: {
      hidden: { opacity: 0, clipPath: "inset(45% 0% 45% 0%)" },
      show: {
        opacity: 1,
        clipPath: "inset(0% 0% 0% 0%)",
        transition: { duration: 0.72, ease: EASE },
      },
    },
  },
  {
    test: /^\/dashboard/,
    name: "slide-behind",
    variants: {
      hidden: { opacity: 0, x: 26, scale: 0.995 },
      show: {
        opacity: 1,
        x: 0,
        scale: 1,
        transition: { duration: 0.5, ease: EASE },
      },
    },
  },
  {
    test: /^\/t\/[^/]+\/m\//,
    name: "broadcast-cut",
    variants: {
      hidden: { opacity: 0, scale: 1.035 },
      show: {
        opacity: 1,
        scale: 1,
        transition: { duration: 0.46, ease: [0.16, 1, 0.3, 1] },
      },
    },
  },
  {
    test: /^\/t\//,
    name: "unroll",
    variants: {
      hidden: { opacity: 0, clipPath: "inset(0% 0% 100% 0%)" },
      show: {
        opacity: 1,
        clipPath: "inset(0% 0% 0% 0%)",
        transition: { duration: 0.8, ease: EASE },
      },
    },
  },
  {
    test: /^\/(tournaments|live)/,
    name: "sweep",
    variants: {
      hidden: { opacity: 0, x: -34 },
      show: { opacity: 1, x: 0, transition: { duration: 0.55, ease: EASE } },
    },
  },
  {
    test: /^\/host/,
    name: "lift",
    variants: {
      hidden: { opacity: 0, y: 40 },
      show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: EASE } },
    },
  },
  {
    test: /.*/,
    name: "settle",
    variants: {
      hidden: { opacity: 0, y: 14 },
      show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: EASE } },
    },
  },
];

export function RouteTransition({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const entry = TRANSITIONS.find((t) => t.test.test(pathname)) ?? TRANSITIONS[TRANSITIONS.length - 1];

  return (
    <motion.div
      key={pathname}
      data-transition={entry.name}
      initial="hidden"
      animate="show"
      variants={entry.variants}
      className="min-h-[60vh]"
    >
      {children}
    </motion.div>
  );
}
