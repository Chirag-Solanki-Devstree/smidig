"use client";

import { useRef } from "react";
import { motion } from "motion/react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { MatchCard } from "@/components/cards/match-card";
import { Button } from "@/components/kit";
import { LiveDot } from "@/components/ui";
import { MATCHES } from "@/lib/data";

const rail = MATCHES.filter((m) => m.status !== "completed");

/** Horizontal rail of live and upcoming matches with drag + arrow scrolling. */
export function LiveRail() {
  const ref = useRef<HTMLDivElement>(null);

  const nudge = (dir: 1 | -1) =>
    ref.current?.scrollBy({ left: dir * 340, behavior: "smooth" });

  return (
    <section className="py-12 sm:py-16">
      <div className="shell mb-5 flex items-end justify-between gap-4">
        <div>
          <span className="inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.22em] text-fg-subtle">
            <LiveDot />
            Live now
          </span>
          <h2 className="display mt-3 text-[clamp(1.5rem,3vw,2.1rem)]">
            Matches in progress
          </h2>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => nudge(-1)}
            aria-label="Scroll left"
            className="grid h-9 w-9 place-items-center rounded-full border border-line bg-surface text-fg-muted transition-[transform,color,border-color] duration-[var(--dur)] ease-[var(--ease-out)] hover:-translate-x-0.5 hover:border-line-strong hover:text-fg"
          >
            <ChevronLeft size={16} />
          </button>
          <button
            onClick={() => nudge(1)}
            aria-label="Scroll right"
            className="grid h-9 w-9 place-items-center rounded-full border border-line bg-surface text-fg-muted transition-[transform,color,border-color] duration-[var(--dur)] ease-[var(--ease-out)] hover:translate-x-0.5 hover:border-line-strong hover:text-fg"
          >
            <ChevronRight size={16} />
          </button>
          <span className="hidden sm:block">
            <Button href="/live" variant="ghost" size="sm">
              See all
            </Button>
          </span>
        </div>
      </div>

      <div
        ref={ref}
        className="mask-fade-x flex snap-x snap-mandatory gap-4 overflow-x-auto scroll-thin px-5 pb-2 md:px-8"
      >
        {rail.map((m, i) => (
          <motion.div
            key={m.id}
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.6, delay: i * 0.07, ease: [0.22, 1, 0.36, 1] }}
            className="w-[86vw] shrink-0 snap-start sm:w-[22rem]"
          >
            <MatchCard m={m} />
          </motion.div>
        ))}
      </div>
    </section>
  );
}
