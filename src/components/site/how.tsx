"use client";

import { useRef, useState } from "react";
import { motion, useMotionValueEvent, useScroll, useTransform } from "motion/react";
import { SectionLabel } from "@/components/ui";
import { STEPS } from "@/lib/content";
import { cx } from "@/lib/cx";

export function How() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] });
  const [active, setActive] = useState(0);

  useMotionValueEvent(scrollYProgress, "change", (v) => {
    setActive(Math.min(STEPS.length - 1, Math.floor(v * STEPS.length)));
  });

  const barScale = useTransform(scrollYProgress, [0, 1], [0, 1]);

  return (
    <section id="how" ref={ref} className="relative h-[300vh]">
      <div className="sticky top-0 flex min-h-screen items-center py-24">
        <div className="shell grid w-full gap-12 lg:grid-cols-2 lg:items-center">
          <div>
            <SectionLabel>How it works</SectionLabel>
            <h2 className="display mt-5 text-[clamp(2rem,4.4vw,3rem)]">
              Season set up in an afternoon.
            </h2>

            <div className="relative mt-10 pl-6">
              <span className="absolute left-0 top-1 h-[calc(100%-0.5rem)] w-px bg-line" />
              <motion.span
                style={{ scaleY: barScale }}
                className="absolute left-0 top-1 h-[calc(100%-0.5rem)] w-px origin-top bg-[linear-gradient(180deg,var(--accent),var(--accent-2))]"
              />
              <ul className="space-y-8">
                {STEPS.map((s, i) => (
                  <li
                    key={s.k}
                    className={cx(
                      "transition-[opacity,transform] duration-[600ms] ease-[var(--ease-out)]",
                      i === active ? "opacity-100" : "translate-x-1 opacity-35",
                    )}
                  >
                    <p className="font-mono text-[11px] tracking-widest text-[var(--accent)]">{s.k}</p>
                    <h3 className="mt-1.5 text-lg font-semibold tracking-tight">{s.title}</h3>
                    <p className="mt-1.5 max-w-md text-[13.5px] leading-relaxed text-fg-muted">
                      {s.body}
                    </p>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="relative aspect-[4/3] w-full overflow-hidden rounded-2xl glass">
            {STEPS.map((s, i) => (
              <motion.div
                key={s.k}
                initial={false}
                animate={{
                  opacity: i === active ? 1 : 0,
                  scale: i === active ? 1 : 1.06,
                }}
                transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
                className="absolute inset-0 grid place-items-center p-8"
              >
                <StepArt index={i} active={i === active} />
              </motion.div>
            ))}
            <div className="absolute bottom-4 left-4 flex gap-1.5">
              {STEPS.map((s, i) => (
                <span
                  key={s.k}
                  className={cx(
                    "h-1 rounded-full transition-all duration-[600ms] ease-[var(--ease-out)]",
                    i === active ? "w-8 bg-[var(--accent)]" : "w-3 bg-line-strong",
                  )}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function StepArt({ index, active }: { index: number; active: boolean }) {
  /* 1 — fixture grid builds itself */
  if (index === 0) {
    return (
      <div className="grid w-full max-w-sm grid-cols-2 gap-2.5">
        {Array.from({ length: 6 }).map((_, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 14 }}
            animate={active ? { opacity: 1, y: 0 } : { opacity: 0, y: 14 }}
            transition={{ delay: i * 0.07, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="flex items-center justify-between rounded-lg border border-line bg-surface px-3 py-2.5 font-mono text-[10px] text-fg-muted"
          >
            <span>M{i + 1}</span>
            <span className="text-fg-subtle">v</span>
            <span>{["MUM", "PUN", "DEL", "KOC", "JAI", "NAG"][i]}</span>
          </motion.div>
        ))}
      </div>
    );
  }

  /* 2 — squad avatars pop in */
  if (index === 1) {
    return (
      <div className="grid w-full max-w-xs grid-cols-4 gap-3">
        {Array.from({ length: 11 }).map((_, i) => (
          <motion.span
            key={i}
            initial={{ scale: 0, opacity: 0 }}
            animate={active ? { scale: 1, opacity: 1 } : { scale: 0, opacity: 0 }}
            transition={{ delay: i * 0.05, type: "spring", stiffness: 300, damping: 22 }}
            className="grid aspect-square place-items-center rounded-full border border-line bg-surface font-mono text-[10px] text-fg-subtle"
          >
            {i + 1}
          </motion.span>
        ))}
        <motion.span
          initial={{ scale: 0 }}
          animate={active ? { scale: 1 } : { scale: 0 }}
          transition={{ delay: 0.6, type: "spring", stiffness: 300, damping: 22 }}
          className="grid aspect-square place-items-center rounded-full bg-[var(--accent)] font-mono text-[10px] font-bold text-[var(--accent-fg)]"
        >
          C
        </motion.span>
      </div>
    );
  }

  /* 3 — ball tracks to the boundary */
  return (
    <svg viewBox="0 0 260 180" className="h-full w-full">
      <ellipse cx="130" cy="90" rx="110" ry="76" fill="none" stroke="var(--border)" strokeWidth="1.2" />
      <ellipse cx="130" cy="90" rx="62" ry="42" fill="none" stroke="var(--border)" strokeWidth="1" strokeDasharray="4 4" />
      <rect x="124" y="70" width="12" height="40" rx="2" fill="color-mix(in oklab, var(--accent) 25%, transparent)" />
      <motion.path
        d="M130 92 C 160 70, 196 44, 226 36"
        fill="none"
        stroke="var(--accent)"
        strokeWidth="2"
        strokeLinecap="round"
        initial={{ pathLength: 0 }}
        animate={active ? { pathLength: 1 } : { pathLength: 0 }}
        transition={{ duration: 1, ease: [0.22, 1, 0.36, 1], delay: 0.2 }}
      />
      <motion.circle
        r="5"
        fill="var(--accent-3)"
        initial={{ opacity: 0 }}
        animate={active ? { opacity: 1 } : { opacity: 0 }}
        transition={{ delay: 0.2 }}
      >
        {active ? (
          <animateMotion
            dur="1.2s"
            begin="0.2s"
            fill="freeze"
            path="M130 92 C 160 70, 196 44, 226 36"
          />
        ) : null}
      </motion.circle>
      <motion.text
        x="206"
        y="78"
        fontSize="13"
        fontFamily="monospace"
        fontWeight="bold"
        fill="var(--accent)"
        textAnchor="middle"
        initial={{ opacity: 0, y: 86 }}
        animate={active ? { opacity: 1, y: 78 } : { opacity: 0, y: 86 }}
        transition={{ delay: 1.2, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      >
        SIX
      </motion.text>
    </svg>
  );
}
