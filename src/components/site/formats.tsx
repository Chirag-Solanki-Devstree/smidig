"use client";

import { useRef } from "react";
import { motion, useScroll, useSpring, useTransform } from "motion/react";
import { FORMATS } from "@/lib/content";
import { SectionLabel } from "@/components/ui";

/**
 * Horizontal scroll scene: the section pins and the format cards slide
 * sideways, driven by vertical scroll progress through a spring.
 */
export function Formats() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] });
  const p = useSpring(scrollYProgress, { stiffness: 90, damping: 28, mass: 0.6 });

  // 5 cards: travel just past the last one.
  const x = useTransform(p, [0, 1], ["2%", "-68%"]);
  const railScale = useTransform(p, [0, 1], [0, 1]);

  return (
    <section id="formats" ref={ref} className="relative h-[320vh]">
      <div className="sticky top-0 flex h-screen flex-col justify-center overflow-hidden">
        <div className="shell mb-10">
          <SectionLabel>Every format</SectionLabel>
          <h2 className="display mt-5 max-w-2xl text-[clamp(2rem,4.6vw,3.1rem)]">
            Twenty20 to five-day. Same platform.
          </h2>
        </div>

        <motion.div style={{ x }} className="flex w-max gap-5 px-5 will-change-transform md:px-8">
          {FORMATS.map((f, i) => (
            <FormatCard key={f.tag} {...f} index={i} />
          ))}
        </motion.div>

        <div className="shell mt-10">
          <div className="h-[2px] w-full overflow-hidden rounded-full bg-line">
            <motion.div
              style={{ scaleX: railScale }}
              className="h-full origin-left rounded-full bg-[linear-gradient(90deg,var(--accent),var(--accent-2))]"
            />
          </div>
        </div>
      </div>
    </section>
  );
}

function FormatCard({
  tag,
  title,
  overs,
  body,
  index,
}: {
  tag: string;
  title: string;
  overs: string;
  body: string;
  index: number;
}) {
  return (
    <article className="group relative h-[380px] w-[78vw] overflow-hidden rounded-3xl glass p-7 sm:w-[420px]">
      {/* number watermark drifts on hover */}
      <span className="pointer-events-none absolute -right-4 -top-10 select-none font-mono text-[9rem] font-bold leading-none text-[color-mix(in_oklab,var(--fg)_5%,transparent)] transition-transform duration-[900ms] ease-[var(--ease-out)] group-hover:-translate-y-2 group-hover:translate-x-2">
        {String(index + 1).padStart(2, "0")}
      </span>

      <span className="inline-flex items-center rounded-full bg-[color-mix(in_oklab,var(--accent)_16%,transparent)] px-3 py-1 font-mono text-[11px] font-bold tracking-widest text-[var(--accent)]">
        {tag}
      </span>

      <h3 className="display mt-6 text-3xl">{title}</h3>
      <p className="mt-1.5 font-mono text-[12px] text-fg-subtle">{overs}</p>
      <p className="mt-5 max-w-sm text-[14px] leading-relaxed text-fg-muted">{body}</p>

      <span className="absolute bottom-7 left-7 flex items-center gap-2 text-[13px] font-medium text-[var(--accent)]">
        Configure rules
        <svg
          viewBox="0 0 24 24"
          width="15"
          height="15"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="transition-transform duration-[var(--dur)] ease-[var(--ease-out)] group-hover:translate-x-1.5"
        >
          <path d="M5 12h13M13 6l6 6-6 6" />
        </svg>
      </span>

      {/* bottom sweep on hover */}
      <span className="pointer-events-none absolute inset-x-0 bottom-0 h-px origin-left scale-x-0 bg-[linear-gradient(90deg,var(--accent),transparent)] transition-transform duration-[700ms] ease-[var(--ease-out)] group-hover:scale-x-100" />
    </article>
  );
}
