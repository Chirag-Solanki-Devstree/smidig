"use client";

import { useRef } from "react";
import { motion, useScroll, useSpring, useTransform } from "motion/react";
import { TextReveal } from "@/components/fx/text-reveal";
import { Magnetic } from "@/components/fx/magnetic";
import { Scorecard } from "@/components/site/scorecard";
import { BRAND } from "@/lib/content";
import { GhostButton, LiveDot, Pill, PrimaryButton, Swap } from "@/components/ui";

const EASE = [0.22, 1, 0.36, 1] as const;

export function Hero() {
  const wrap = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({
    target: wrap,
    offset: ["start 0.9", "end 0.3"],
  });
  const p = useSpring(scrollYProgress, { stiffness: 110, damping: 30, mass: 0.7 });

  const rotateX = useTransform(p, [0, 1], [26, 0]);
  const scale = useTransform(p, [0, 1], [0.86, 1]);
  const y = useTransform(p, [0, 1], [50, 0]);
  const glow = useTransform(p, [0, 1], [0.2, 0.75]);

  return (
    <section id="top" className="relative pt-36 pb-12 sm:pt-44">
      <div className="shell">
        <div className="mx-auto max-w-3xl text-center">
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: EASE, delay: 0.2 }}
          >
            <Pill>
              <LiveDot />
              Live scoring in 14 leagues today
              <span className="text-fg-subtle">·</span>
              <span className="shimmer font-semibold">Season 2026 open</span>
            </Pill>
          </motion.div>

          <h1 className="display mt-7 text-[clamp(2.5rem,7.4vw,4.9rem)]">
            <TextReveal text="Run your cricket" delay={0.3} />
            <br />
            <TextReveal
              text="tournament like a pro league."
              delay={0.48}
              highlight={["pro", "league."]}
            />
          </h1>

          <motion.p
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, ease: EASE, delay: 0.85 }}
            className="mx-auto mt-6 max-w-xl text-pretty text-[15px] leading-relaxed text-fg-muted sm:text-base"
          >
            {BRAND.sub}
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, ease: EASE, delay: 1 }}
            className="mt-9 flex flex-wrap items-center justify-center gap-3"
          >
            <Magnetic strength={0.3}>
              <PrimaryButton>
                <Swap>Create a tournament</Swap>
                <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className="transition-transform duration-[var(--dur)] ease-[var(--ease-out)] group-hover:translate-x-1">
                  <path d="M5 12h13M13 6l6 6-6 6" />
                </svg>
              </PrimaryButton>
            </Magnetic>
            <Magnetic strength={0.22}>
              <GhostButton>
                <span className="grid h-5 w-5 place-items-center rounded-full bg-[var(--accent)] text-[var(--accent-fg)] transition-transform duration-[var(--dur)] ease-[var(--ease-out)] group-hover:scale-110">
                  <svg viewBox="0 0 24 24" width="11" height="11" fill="currentColor">
                    <path d="M8 5.5l10 6.5-10 6.5z" />
                  </svg>
                </span>
                Watch a live match
              </GhostButton>
            </Magnetic>
          </motion.div>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.9, delay: 1.2 }}
            className="mt-5 text-[12px] text-fg-subtle"
          >
            Free for your first tournament · No card needed
          </motion.p>
        </div>

        {/* Live scorecard, tilted back then straightening on scroll */}
        <div ref={wrap} className="mt-16 sm:mt-20" style={{ perspective: 1800 }}>
          <motion.div
            style={{ rotateX, scale, y, transformStyle: "preserve-3d" }}
            className="relative mx-auto max-w-3xl will-change-transform"
          >
            <motion.div
              aria-hidden
              style={{ opacity: glow }}
              className="absolute -inset-x-24 -top-20 bottom-0 -z-10 bg-[radial-gradient(55%_55%_at_50%_10%,var(--glow)_0%,transparent_62%)]"
            />
            <Scorecard />
          </motion.div>
        </div>
      </div>
    </section>
  );
}
