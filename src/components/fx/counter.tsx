"use client";

import { useEffect, useRef } from "react";
import {
  motion,
  useInView,
  useMotionValue,
  useReducedMotion,
  useTransform,
  animate,
} from "motion/react";

/**
 * Counts up the first time it enters view.
 * The displayed string is a derived MotionValue, so the count runs
 * entirely outside React's render loop — no re-render per frame.
 */
export function Counter({
  value,
  decimals = 0,
  prefix = "",
  suffix = "",
  duration = 1.8,
}: {
  value: number;
  decimals?: number;
  prefix?: string;
  suffix?: string;
  duration?: number;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.6 });
  const reduce = useReducedMotion();

  const raw = useMotionValue(0);
  const text = useTransform(raw, (v) => {
    const n = v.toFixed(decimals);
    const [int, frac] = n.split(".");
    const grouped = int.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    return `${prefix}${frac ? `${grouped}.${frac}` : grouped}${suffix}`;
  });

  useEffect(() => {
    if (!inView) return;
    if (reduce) {
      raw.set(value);
      return;
    }
    const controls = animate(raw, value, {
      duration,
      ease: [0.16, 1, 0.3, 1],
    });
    return () => controls.stop();
  }, [inView, value, duration, reduce, raw]);

  return (
    <span ref={ref} className="tabular-nums">
      <motion.span>{text}</motion.span>
    </span>
  );
}
