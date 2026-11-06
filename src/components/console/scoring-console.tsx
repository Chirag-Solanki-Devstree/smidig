"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { RotateCcw, Undo2 } from "lucide-react";
import { PageTitle } from "@/components/layouts/console-shell";
import { Badge, BallChip, Button, Card, Table, Tbody, Td, TeamBadge, Th, Tr } from "@/components/kit";
import { useToast } from "@/components/kit/toast";
import { teamByShort } from "@/lib/data";
import { cx } from "@/lib/cx";

const RUN_KEYS = ["0", "1", "2", "3", "4", "6"] as const;
const EXTRAS = ["wd", "nb", "lb", "b"] as const;

type Batter = { id: string; name: string; runs: number; balls: number; fours: number; sixes: number; out: boolean };
type Bowler = { id: string; name: string; balls: number; runs: number; wickets: number };

type State = {
  runs: number;
  wickets: number;
  legalBalls: number;
  strikerId: string;
  nonStrikerId: string;
  batters: Batter[];
  nextIn: number;
  bowlers: Bowler[];
  currentBowlerId: string;
  over: string[];
  lastBall: string | null;
};

const SQUAD = [
  "R. Shetty", "S. Patil", "V. Pillai", "A. Deshmukh", "N. Bose",
  "T. Joseph", "K. Sodhi", "D. Mehta", "G. Patel", "H. Gill", "P. Rane",
];

const BOWLERS = ["T. Rathore", "M. Fernandes"];

const INITIAL: State = {
  runs: 182,
  wickets: 4,
  legalBalls: 110, // 18.2 overs
  strikerId: "b0",
  nonStrikerId: "b1",
  batters: [
    { id: "b0", name: SQUAD[0], runs: 64, balls: 38, fours: 7, sixes: 2, out: false },
    { id: "b1", name: SQUAD[1], runs: 21, balls: 17, fours: 2, sixes: 0, out: false },
  ],
  nextIn: 2,
  bowlers: [
    { id: "w0", name: BOWLERS[0], balls: 20, runs: 28, wickets: 2 },
    { id: "w1", name: BOWLERS[1], balls: 24, runs: 41, wickets: 1 },
  ],
  currentBowlerId: "w0",
  over: ["1", "4", "W", "2"],
  lastBall: null,
};

const oversOf = (balls: number) => `${Math.floor(balls / 6)}.${balls % 6}`;
const econOf = (b: Bowler) => (b.balls ? (b.runs / (b.balls / 6)).toFixed(2) : "0.00");
const srOf = (b: Batter) => (b.balls ? ((b.runs / b.balls) * 100).toFixed(1) : "0.0");

/**
 * Ball-by-ball scoring. One reducer owns the whole innings, so the total, the
 * batters, the bowler, the over strip and the run rate always agree — they are
 * all derived from the same state rather than kept in step by hand.
 *
 * Undo keeps a stack of past states; for a prototype that is simpler and
 * safer than trying to invert each kind of ball.
 */
function applyBall(s: State, ball: string): State {
  const next: State = {
    ...s,
    batters: s.batters.map((b) => ({ ...b })),
    bowlers: s.bowlers.map((b) => ({ ...b })),
    over: [...s.over],
    lastBall: ball,
  };

  const striker = next.batters.find((b) => b.id === next.strikerId)!;
  const bowler = next.bowlers.find((b) => b.id === next.currentBowlerId)!;

  const swap = () => {
    const t = next.strikerId;
    next.strikerId = next.nonStrikerId;
    next.nonStrikerId = t;
  };

  if (ball === "wd" || ball === "nb") {
    // One penalty run, charged to the bowler. Not a legal delivery, so no
    // ball is added to the striker or the over.
    next.runs += 1;
    bowler.runs += 1;
  } else if (ball === "lb" || ball === "b") {
    // Byes count for the team and use up a ball, but are not the batter's
    // runs and are not charged to the bowler.
    next.runs += 1;
    striker.balls += 1;
    bowler.balls += 1;
    next.legalBalls += 1;
  } else if (ball === "W") {
    next.wickets += 1;
    striker.balls += 1;
    striker.out = true;
    bowler.balls += 1;
    bowler.wickets += 1;
    next.legalBalls += 1;

    if (next.nextIn < SQUAD.length && next.wickets < 10) {
      const incoming: Batter = {
        id: `b${next.nextIn}`,
        name: SQUAD[next.nextIn],
        runs: 0, balls: 0, fours: 0, sixes: 0, out: false,
      };
      next.batters.push(incoming);
      next.strikerId = incoming.id;
      next.nextIn += 1;
    }
  } else {
    const n = Number(ball);
    next.runs += n;
    striker.runs += n;
    striker.balls += 1;
    if (n === 4) striker.fours += 1;
    if (n === 6) striker.sixes += 1;
    bowler.runs += n;
    bowler.balls += 1;
    next.legalBalls += 1;
    if (n % 2 === 1) swap();
  }

  // Over strip: only legal deliveries advance it; extras ride along.
  next.over = [...next.over, ball];
  if (ball !== "wd" && ball !== "nb" && next.legalBalls % 6 === 0) {
    next.over = [];
    swap(); // ends change
    // Rotate to the other bowler.
    const other = next.bowlers.find((b) => b.id !== next.currentBowlerId);
    if (other) next.currentBowlerId = other.id;
  }

  return next;
}

export function ScoringConsole() {
  const toast = useToast();
  const A = teamByShort("MUM");
  const B = teamByShort("PUN");

  const [state, setState] = useState<State>(INITIAL);
  const [past, setPast] = useState<State[]>([]);
  const [flash, setFlash] = useState<string | null>(null);

  const push = (ball: string) => {
    setPast((p) => [...p.slice(-40), state]);
    setState((s) => applyBall(s, ball));
    setFlash(ball);
    setTimeout(() => setFlash(null), 480);
  };

  const undo = () => {
    setPast((p) => {
      if (!p.length) return p;
      setState(p[p.length - 1]);
      return p.slice(0, -1);
    });
  };

  const striker = state.batters.find((b) => b.id === state.strikerId);
  const nonStriker = state.batters.find((b) => b.id === state.nonStrikerId);
  const atCrease = [striker, nonStriker].filter(Boolean) as Batter[];
  const overs = oversOf(state.legalBalls);
  const crr = state.legalBalls ? (state.runs / (state.legalBalls / 6)).toFixed(2) : "0.00";

  return (
    <>
      <PageTitle
        title="Live scoring"
        sub="Match 14 · Mumbai Mavericks v Pune Panthers · Group A"
        badge="You are scoring"
        action={
          <Button
            variant="danger"
            size="sm"
            onClick={() =>
              toast({
                title: "Innings ended",
                body: `${state.runs}/${state.wickets} in ${overs} overs recorded. Points table and NRR updated.`,
                tone: "warn",
              })
            }
          >
            End innings
          </Button>
        }
      />

      <div className="grid gap-4 lg:grid-cols-[1.1fr_1fr]">
        <div className="space-y-4">
          <Card className="relative overflow-hidden p-6 text-center">
            <AnimatePresence>
              {flash ? (
                <motion.span
                  key={`${flash}-${state.legalBalls}-${state.runs}`}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 0.22 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.45 }}
                  className="pointer-events-none absolute inset-0"
                  style={{
                    background:
                      flash === "W" ? "var(--live)"
                        : flash === "6" ? "var(--six)"
                        : flash === "4" ? "var(--info)"
                        : "transparent",
                  }}
                />
              ) : null}
            </AnimatePresence>

            <div className="relative">
              <div className="flex items-center justify-center gap-3">
                <TeamBadge short={A.short} colour={A.colour} size={30} />
                <span className="text-[13px] text-fg-muted">batting</span>
              </div>

              <motion.p
                key={`${state.runs}-${state.wickets}`}
                initial={{ scale: 0.92, opacity: 0.6 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: "spring", stiffness: 420, damping: 24 }}
                className="mt-3 font-mono text-[56px] font-bold leading-none tabular-nums"
                data-testid="score"
              >
                {state.runs}
                <span className="text-fg-subtle">/{state.wickets}</span>
              </motion.p>

              <p className="mt-2 font-mono text-[13px] text-fg-subtle" data-testid="overs">
                ({overs} ov) · CRR {crr}
              </p>

              <div className="mt-5 flex min-h-[34px] items-center justify-center gap-1.5" data-testid="over-strip">
                <AnimatePresence mode="popLayout" initial={false}>
                  {state.over.map((b, i) => (
                    <motion.span
                      key={`${state.legalBalls}-${i}-${b}`}
                      layout
                      initial={{ scale: 0.3, opacity: 0, y: 12 }}
                      animate={{ scale: 1, opacity: 1, y: 0 }}
                      exit={{ scale: 0.3, opacity: 0, x: -14 }}
                      transition={{ type: "spring", stiffness: 420, damping: 30, mass: 0.6 }}
                    >
                      <BallChip v={b} size={34} />
                    </motion.span>
                  ))}
                </AnimatePresence>
              </div>
            </div>
          </Card>

          <Card className="p-5">
            <div className="grid grid-cols-3 gap-2.5">
              {RUN_KEYS.map((k) => (
                <button
                  key={k}
                  data-testid={`run-${k}`}
                  onClick={() => push(k)}
                  className={cx(
                    "h-16 rounded-xl border font-mono text-xl font-bold",
                    "transition-[transform,background-color,border-color] duration-[180ms] ease-[var(--ease-out)]",
                    "hover:-translate-y-0.5 active:translate-y-0 active:scale-95",
                    k === "4"
                      ? "border-[color-mix(in_oklab,var(--info)_45%,transparent)] bg-[color-mix(in_oklab,var(--info)_14%,transparent)] text-[var(--info)]"
                      : k === "6"
                        ? "border-[color-mix(in_oklab,var(--six)_45%,transparent)] bg-[color-mix(in_oklab,var(--six)_14%,transparent)] text-[var(--six)]"
                        : "border-line bg-surface text-fg hover:border-line-strong",
                  )}
                >
                  {k}
                </button>
              ))}
            </div>

            <div className="mt-2.5 grid grid-cols-4 gap-2.5">
              {EXTRAS.map((e) => (
                <button
                  key={e}
                  data-testid={`extra-${e}`}
                  onClick={() => push(e)}
                  className="h-11 rounded-xl border border-[color-mix(in_oklab,var(--warn)_35%,transparent)] bg-[color-mix(in_oklab,var(--warn)_10%,transparent)] font-mono text-[13px] font-semibold uppercase text-[var(--warn)] transition-[transform,background-color] duration-[180ms] ease-[var(--ease-out)] hover:-translate-y-0.5 active:scale-95"
                >
                  {e}
                </button>
              ))}
            </div>

            <div className="mt-2.5 grid grid-cols-3 gap-2.5">
              <button
                data-testid="wicket"
                onClick={() => push("W")}
                className="col-span-2 h-14 rounded-xl border border-transparent bg-[var(--live)] font-mono text-lg font-bold uppercase text-white transition-[transform,filter] duration-[180ms] ease-[var(--ease-out)] hover:-translate-y-0.5 hover:brightness-110 active:scale-95"
              >
                Wicket
              </button>
              <button
                data-testid="undo"
                onClick={undo}
                disabled={!past.length}
                className="flex h-14 items-center justify-center gap-2 rounded-xl border border-line bg-surface text-[13px] font-semibold text-fg-muted transition-colors duration-[180ms] hover:bg-surface-strong hover:text-fg disabled:opacity-40"
              >
                <Undo2 size={15} /> Undo
              </button>
            </div>
          </Card>
        </div>

        <div className="space-y-4">
          <Card className="overflow-hidden">
            <div className="flex items-center justify-between border-b border-line px-5 py-3.5">
              <h2 className="text-[14px] font-semibold">At the crease</h2>
              <Badge tone="live" pulse>Broadcasting</Badge>
            </div>
            <Table>
              <thead>
                <tr>
                  <Th>Batter</Th>
                  <Th align="right">R</Th>
                  <Th align="right">B</Th>
                  <Th align="right">4s</Th>
                  <Th align="right">6s</Th>
                  <Th align="right">SR</Th>
                </tr>
              </thead>
              <Tbody>
                {atCrease.map((b) => (
                  <Tr key={b.id}>
                    <Td testId={b.id === state.strikerId ? "striker-name" : undefined}>
                      {b.name}
                      {b.id === state.strikerId ? (
                        <span className="ml-1 text-[var(--accent)]">*</span>
                      ) : null}
                    </Td>
                    <Td align="right" className="font-mono font-semibold" testId={b.id === state.strikerId ? "striker-runs" : undefined}>
                      {b.runs}
                    </Td>
                    <Td align="right" className="font-mono text-fg-muted" testId={b.id === state.strikerId ? "striker-balls" : undefined}>
                      {b.balls}
                    </Td>
                    <Td align="right" className="font-mono text-fg-muted">{b.fours}</Td>
                    <Td align="right" className="font-mono text-fg-muted">{b.sixes}</Td>
                    <Td align="right" className="font-mono text-fg-muted">{srOf(b)}</Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
          </Card>

          <Card className="overflow-hidden">
            <div className="border-b border-line px-5 py-3.5">
              <h2 className="text-[14px] font-semibold">Bowling · {B.name}</h2>
            </div>
            <Table>
              <thead>
                <tr>
                  <Th>Bowler</Th>
                  <Th align="right">O</Th>
                  <Th align="right">R</Th>
                  <Th align="right">W</Th>
                  <Th align="right">Econ</Th>
                </tr>
              </thead>
              <Tbody>
                {state.bowlers.map((b) => (
                  <Tr key={b.id}>
                    <Td testId={b.id === state.currentBowlerId ? "current-bowler" : undefined}>
                      {b.name}
                      {b.id === state.currentBowlerId ? (
                        <span className="ml-1.5 text-[11px] text-[var(--accent)]">bowling</span>
                      ) : null}
                    </Td>
                    <Td align="right" className="font-mono text-fg-muted">{oversOf(b.balls)}</Td>
                    <Td align="right" className="font-mono text-fg-muted" testId={b.id === state.currentBowlerId ? "bowler-runs" : undefined}>
                      {b.runs}
                    </Td>
                    <Td align="right" className="font-mono font-semibold" testId={b.id === state.currentBowlerId ? "bowler-wickets" : undefined}>
                      {b.wickets}
                    </Td>
                    <Td align="right" className="font-mono text-fg-muted">{econOf(b)}</Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
          </Card>

          <Card className="flex items-center gap-3 p-4">
            <RotateCcw size={15} className="shrink-0 text-fg-subtle" />
            <p className="text-[12.5px] text-fg-muted">
              Every ball you tap updates the total, the batters, the bowler and the
              over together — and in the real build is pushed live to the match
              page, the points table and the broadcast overlay.
            </p>
          </Card>
        </div>
      </div>
    </>
  );
}
