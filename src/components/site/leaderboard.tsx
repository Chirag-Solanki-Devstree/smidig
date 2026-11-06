"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Counter } from "@/components/fx/counter";
import { Reveal, RevealItem } from "@/components/fx/reveal";
import { SectionLabel } from "@/components/ui";
import { STATS, TOP_RUNS, TOP_WICKETS } from "@/lib/content";
import { cx } from "@/lib/cx";

const TABS = ["Most runs", "Most wickets"] as const;

export function Leaderboard() {
  const [tab, setTab] = useState<(typeof TABS)[number]>(TABS[0]);
  const runs = tab === "Most runs";

  return (
    <section id="stats" className="relative py-24 sm:py-32">
      <div className="shell">
        {/* season counters */}
        <Reveal className="grid gap-px overflow-hidden rounded-2xl border border-line bg-line sm:grid-cols-2 lg:grid-cols-4">
          {STATS.map((s) => (
            <RevealItem
              key={s.label}
              className="group bg-bg-elev p-7 text-center transition-colors duration-[var(--dur)] hover:bg-surface-strong"
            >
              <p className="display text-[clamp(1.9rem,3.8vw,2.6rem)] text-gradient">
                <Counter value={s.value} decimals={s.decimals ?? 0} suffix={s.suffix} />
              </p>
              <p className="mt-2 text-[13px] text-fg-muted transition-colors duration-[var(--dur)] group-hover:text-fg">
                {s.label}
              </p>
            </RevealItem>
          ))}
        </Reveal>

        {/* leaderboard */}
        <Reveal className="mt-16 text-center" amount={0.4}>
          <RevealItem>
            <SectionLabel>Season leaders</SectionLabel>
          </RevealItem>
          <RevealItem>
            <h2 className="display mt-5 text-[clamp(1.9rem,4vw,2.8rem)]">
              Every run and wicket, counted.
            </h2>
          </RevealItem>
        </Reveal>

        <div className="mt-9 flex justify-center">
          <div className="inline-flex rounded-full border border-line bg-surface p-1">
            {TABS.map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className="relative rounded-full px-5 py-2 text-[13px] font-medium"
              >
                {tab === t ? (
                  <motion.span
                    layoutId="lb-pill"
                    transition={{ type: "spring", stiffness: 340, damping: 30, mass: 0.6 }}
                    className="absolute inset-0 rounded-full bg-[linear-gradient(110deg,var(--accent),var(--accent-2))]"
                  />
                ) : null}
                <span className={cx("relative", tab === t ? "text-[var(--accent-fg)]" : "text-fg-muted")}>
                  {t}
                </span>
              </button>
            ))}
          </div>
        </div>

        <div className="mx-auto mt-8 max-w-3xl overflow-hidden rounded-2xl border border-line bg-bg-elev">
          <div className="grid grid-cols-[2.2rem_1fr_3rem_4rem_4rem] gap-x-3 border-b border-line px-5 py-3 font-mono text-[10px] uppercase tracking-widest text-fg-subtle sm:grid-cols-[2.5rem_1fr_4rem_5rem_5rem]">
            <span>#</span>
            <span>Player</span>
            <span className="text-right">{runs ? "Runs" : "Wkts"}</span>
            <span className="text-right">{runs ? "SR" : "Econ"}</span>
            <span className="text-right">{runs ? "HS" : "BBI"}</span>
          </div>

          <AnimatePresence mode="wait" initial={false}>
            <motion.ul
              key={tab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.34, ease: [0.22, 1, 0.36, 1] }}
            >
              {(runs ? TOP_RUNS : TOP_WICKETS).map((r, i) => (
                <motion.li
                  key={r.name}
                  initial={{ opacity: 0, x: -14 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.06, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                  className="group relative grid grid-cols-[2.2rem_1fr_3rem_4rem_4rem] items-center gap-x-3 border-b border-line px-5 py-3.5 text-[13.5px] last:border-0 sm:grid-cols-[2.5rem_1fr_4rem_5rem_5rem]"
                >
                  {/* accent wash slides in on hover */}
                  <span className="pointer-events-none absolute inset-0 origin-left scale-x-0 bg-[linear-gradient(90deg,color-mix(in_oklab,var(--accent)_10%,transparent),transparent)] transition-transform duration-[520ms] ease-[var(--ease-out)] group-hover:scale-x-100" />
                  <span className="pointer-events-none absolute inset-y-0 left-0 w-[2px] origin-top scale-y-0 bg-[var(--accent)] transition-transform duration-[420ms] ease-[var(--ease-out)] group-hover:scale-y-100" />

                  <span
                    className={cx(
                      "relative font-mono text-[12px]",
                      r.pos === 1 ? "text-[var(--accent)]" : "text-fg-subtle",
                    )}
                  >
                    {String(r.pos).padStart(2, "0")}
                  </span>
                  <span className="relative flex min-w-0 items-center gap-2.5">
                    <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full border border-line bg-surface font-mono text-[9px] text-fg-subtle transition-colors duration-[var(--dur)] group-hover:border-[var(--accent)] group-hover:text-[var(--accent)]">
                      {r.team}
                    </span>
                    <span className="truncate font-medium transition-transform duration-[var(--dur)] ease-[var(--ease-out)] group-hover:translate-x-0.5">
                      {r.name}
                    </span>
                  </span>
                  <span className="relative text-right font-mono font-semibold">
                    {"runs" in r ? r.runs : r.wkts}
                  </span>
                  <span className="relative text-right font-mono text-fg-muted">
                    {"sr" in r ? r.sr : r.econ}
                  </span>
                  <span className="relative text-right font-mono text-fg-muted">
                    {"hs" in r ? r.hs : r.bbi}
                  </span>
                </motion.li>
              ))}
            </motion.ul>
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}
