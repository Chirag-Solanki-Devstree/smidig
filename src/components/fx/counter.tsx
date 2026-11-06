"use client";

import { useEffect, useRef } from "react";
import { motion, useMotionValue, useTransform, animate } from "motion/react";

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
  const raw = useMotionValue(0);
  const text = useTransform(raw, (v) => {
    const n = v.toFixed(decimals);
    const [int, frac] = n.split(".");
    const grouped = int.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    return `${prefix}${frac ? `${grouped}.${frac}` : grouped}${suffix}`;
  });

  // Driven by an observer rather than React state: a page full of these
  // would otherwise re-render every counter in the frame they come into
  // view, which is exactly when there is least budget.
  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      raw.set(value);
      return;
    }

    let controls: { stop: () => void } | null = null;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        io.disconnect();
        controls = animate(raw, value, { duration, ease: [0.16, 1, 0.3, 1] });
      },
      { threshold: 0.6 },
    );
    io.observe(el);

    return () => {
      io.disconnect();
      controls?.stop();
    };
  }, [value, duration, raw]);

  return (
    <span ref={ref} className="tabular-nums">
      <motion.span>{text}</motion.span>
    </span>
  );
}
