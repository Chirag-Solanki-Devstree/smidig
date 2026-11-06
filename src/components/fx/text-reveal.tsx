"use client";

import { motion } from "motion/react";
import { cx } from "@/lib/cx";

const EASE = [0.16, 1, 0.3, 1] as const;

/**
 * Word-by-word mask reveal. Each word rides up out of its own clipping box,
 * which reads far crisper than fading a whole heading at once.
 */
export function TextReveal({
  text,
  className,
  delay = 0,
  stagger = 0.055,
  highlight,
}: {
  text: string;
  className?: string;
  delay?: number;
  stagger?: number;
  /** Words (exact match, punctuation stripped) painted with the accent gradient. */
  highlight?: string[];
}) {
  const words = text.split(" ");
  const hl = new Set(highlight ?? []);

  return (
    <motion.span
      className={cx("inline-block", className)}
      initial="hidden"
      animate="show"
      variants={{
        hidden: {},
        show: { transition: { staggerChildren: stagger, delayChildren: delay } },
      }}
      aria-label={text}
    >
      {words.map((w, i) => (
        <span
          key={`${w}-${i}`}
          aria-hidden
          className="inline-block overflow-hidden pb-[0.12em] align-bottom"
        >
          <motion.span
            className={cx("inline-block", hl.has(w) && "text-gradient")}
            variants={{
              hidden: { y: "110%", opacity: 0 },
              show: {
                y: "0%",
                opacity: 1,
                transition: { duration: 0.9, ease: EASE },
              },
            }}
          >
            {w}
            {i < words.length - 1 ? " " : ""}
          </motion.span>
        </span>
      ))}
    </motion.span>
  );
}
