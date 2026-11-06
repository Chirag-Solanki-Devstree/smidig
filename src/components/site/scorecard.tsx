"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion, useInView } from "motion/react";
import { useRef } from "react";
import { cx } from "@/lib/cx";

/** The last six balls of an over, replayed on a loop once in view. */
const SEQUENCE = ["1", "4", "W", "2", "6", "•"] as const;

const BATTERS = [
  { name: "R. Shetty", runs: 64, balls: 38, fours: 7, sixes: 2, strike: true },
  { name: "S. Patil", runs: 21, balls: 17, fours: 2, sixes: 0, strike: false },
];

export function Scorecard() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { amount: 0.4 });
  const [n, setN] = useState(0);

  // Advance the ball-by-ball strip while the card is on screen.
  useEffect(() => {
    if (!inView) return;
    const id = setInterval(() => setN((v) => v + 1), 1400);
    return () => clearInterval(id);
  }, [inView]);

  const balls = Array.from({ length: 6 }, (_, i) => SEQUENCE[(n + i) % SEQUENCE.length]);
  const last = balls[5];

  return (
    <div
      ref={ref}
      className="overflow-hidden rounded-2xl border border-line bg-[color-mix(in_oklab,var(--bg-elev)_92%,transparent)] shadow-[var(--shadow-lift)]"
    >
      {/* header */}
      <div className="flex items-center gap-3 border-b border-line px-5 py-3.5">
        <span className="flex items-center gap-2 rounded-full bg-[color-mix(in_oklab,var(--accent-3)_18%,transparent)] px-2.5 py-1 text-[10.5px] font-semibold uppercase tracking-wider text-[var(--accent-3)]">
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[var(--accent-3)]" />
          Live
        </span>
        <span className="truncate text-[12.5px] text-fg-muted">
          Match 14 · Deccan Premier League
        </span>
        <span className="ml-auto hidden font-mono text-[11px] text-fg-subtle sm:block">
          Wankhede · D/N
        </span>
      </div>

      {/* score */}
      <div className="grid gap-5 px-5 py-5 sm:grid-cols-[1.1fr_auto_1fr] sm:items-center">
        <TeamScore name="Mumbai Mavericks" short="MUM" score="182" wkts="4" ov="18.2" active />
        <div className="hidden flex-col items-center gap-1 sm:flex">
          <span className="font-mono text-[10px] uppercase tracking-widest text-fg-subtle">vs</span>
          <span className="h-10 w-px bg-line" />
        </div>
        <TeamScore name="Pune Panthers" short="PUN" score="205" wkts="6" ov="20.0" />
      </div>

      {/* required / run rate */}
      <div className="grid grid-cols-3 gap-px border-y border-line bg-line">
        {[
          { k: "CRR", v: "9.93" },
          { k: "REQ", v: "14.40" },
          { k: "TO WIN", v: "24 off 10" },
        ].map((s) => (
          <div key={s.k} className="bg-bg-elev px-4 py-3 text-center">
            <p className="font-mono text-[10px] uppercase tracking-widest text-fg-subtle">{s.k}</p>
            <p className="mt-1 font-mono text-[15px] font-semibold text-fg">{s.v}</p>
          </div>
        ))}
      </div>

      {/* batters */}
      <div className="px-5 py-4">
        <div className="grid grid-cols-[1fr_auto_auto_auto_auto] gap-x-4 font-mono text-[10px] uppercase tracking-widest text-fg-subtle">
          <span>Batter</span>
          <span className="text-right">R</span>
          <span className="text-right">B</span>
          <span className="text-right">4s</span>
          <span className="text-right">6s</span>
        </div>
        <div className="mt-2 space-y-1.5">
          {BATTERS.map((b) => (
            <div
              key={b.name}
              className="group grid grid-cols-[1fr_auto_auto_auto_auto] items-center gap-x-4 rounded-lg px-2 py-1.5 -mx-2 text-[13px] transition-colors duration-[var(--dur)] hover:bg-surface-strong"
            >
              <span className="flex items-center gap-1.5 truncate">
                {b.name}
                {b.strike ? (
                  <span className="text-[var(--accent)]" aria-label="on strike">
                    *
                  </span>
                ) : null}
              </span>
              <span className="text-right font-mono font-semibold">{b.runs}</span>
              <span className="text-right font-mono text-fg-muted">{b.balls}</span>
              <span className="text-right font-mono text-fg-muted">{b.fours}</span>
              <span className="text-right font-mono text-fg-muted">{b.sixes}</span>
            </div>
          ))}
        </div>
      </div>

      {/* this over */}
      <div className="flex items-center gap-3 border-t border-line px-5 py-4">
        <span className="font-mono text-[10px] uppercase tracking-widest text-fg-subtle">
          This over
        </span>
        <div className="flex items-center gap-1.5">
          <AnimatePresence mode="popLayout" initial={false}>
            {balls.map((b, i) => (
              <motion.span
                key={`${n}-${i}`}
                layout
                initial={i === 5 ? { scale: 0.4, opacity: 0, y: 8 } : false}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.4, opacity: 0, x: -10 }}
                transition={{ type: "spring", stiffness: 420, damping: 30, mass: 0.6 }}
                className={cx(
                  "grid h-7 w-7 place-items-center rounded-full font-mono text-[12px] font-semibold",
                  b === "W"
                    ? "bg-[var(--accent-3)] text-white"
                    : b === "6" || b === "4"
                      ? "bg-[var(--accent)] text-[var(--accent-fg)]"
                      : "border border-line bg-surface text-fg-muted",
                )}
              >
                {b}
              </motion.span>
            ))}
          </AnimatePresence>
        </div>
        <motion.span
          key={`cue-${n}`}
          initial={{ opacity: 0, x: -6 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          className="ml-auto hidden text-[12px] text-fg-muted sm:block"
        >
          {last === "W"
            ? "Wicket!"
            : last === "6"
              ? "Over long-on, six."
              : last === "4"
                ? "Through the covers, four."
                : "Worked to square leg."}
        </motion.span>
      </div>
    </div>
  );
}

function TeamScore({
  name,
  short,
  score,
  wkts,
  ov,
  active,
}: {
  name: string;
  short: string;
  score: string;
  wkts: string;
  ov: string;
  active?: boolean;
}) {
  return (
    <div className="flex items-center gap-3">
      <span
        className={cx(
          "grid h-10 w-10 shrink-0 place-items-center rounded-xl font-mono text-[11px] font-bold",
          active
            ? "bg-[linear-gradient(135deg,var(--accent),var(--accent-2))] text-[var(--accent-fg)]"
            : "border border-line bg-surface text-fg-muted",
        )}
      >
        {short}
      </span>
      <div className="min-w-0">
        <p className="truncate text-[12.5px] text-fg-muted">{name}</p>
        <p className="font-mono text-[22px] font-semibold leading-tight">
          {score}
          <span className="text-fg-subtle">/{wkts}</span>
          <span className="ml-2 text-[12px] font-normal text-fg-subtle">({ov})</span>
        </p>
      </div>
    </div>
  );
}
