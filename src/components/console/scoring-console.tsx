"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { RotateCcw, Undo2 } from "lucide-react";
import { PageTitle } from "@/components/layouts/console-shell";
import {
  Badge,
  BallChip,
  Button,
  Card,
  Table,
  Tbody,
  Td,
  TeamBadge,
  Th,
  Tr,
} from "@/components/kit";
import { BATTERS, BOWLERS, teamByShort } from "@/lib/data";
import { useToast } from "@/components/kit/toast";
import { cx } from "@/lib/cx";

const KEYS = ["0", "1", "2", "3", "4", "6"] as const;
const EXTRAS = ["wd", "nb", "lb", "b"] as const;

type Ball = { v: string; id: number };

/**
 * Ball-by-ball scoring console.
 * Local state only in the prototype — the real one pushes each ball to the
 * server and broadcasts it to every viewer over the realtime channel.
 */
export function ScoringConsole() {
  const toast = useToast();
  const A = teamByShort("MUM");
  const B = teamByShort("PUN");

  const [balls, setBalls] = useState<Ball[]>([
    { v: "1", id: 1 },
    { v: "4", id: 2 },
    { v: "W", id: 3 },
    { v: "2", id: 4 },
  ]);
  const [runs, setRuns] = useState(182);
  const [wkts, setWkts] = useState(4);
  const [legal, setLegal] = useState(2);
  const [flash, setFlash] = useState<string | null>(null);

  const push = (v: string) => {
    setBalls((b) => [...b.slice(-5), { v, id: Date.now() }]);
    setFlash(v);
    setTimeout(() => setFlash(null), 500);

    if (v === "W") setWkts((w) => Math.min(10, w + 1));
    else if (v === "wd" || v === "nb") setRuns((r) => r + 1);
    else if (!Number.isNaN(Number(v))) setRuns((r) => r + Number(v));

    if (v !== "wd" && v !== "nb") setLegal((l) => (l + 1) % 6);
  };

  const undo = () => setBalls((b) => b.slice(0, -1));

  const over = 18 + legal / 10;

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
                body: `${runs}/${wkts} recorded. Points table and NRR updated.`,
                tone: "warn",
              })
            }
          >
            End innings
          </Button>
        }
      />

      <div className="grid gap-4 lg:grid-cols-[1.1fr_1fr]">
        {/* scoreboard + keypad */}
        <div className="space-y-4">
          <Card className="relative overflow-hidden p-6 text-center">
            {/* boundary / wicket flash */}
            <AnimatePresence>
              {flash ? (
                <motion.span
                  key={flash + String(balls.length)}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 0.22 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.45 }}
                  className="pointer-events-none absolute inset-0"
                  style={{
                    background:
                      flash === "W"
                        ? "var(--live)"
                        : flash === "6"
                          ? "var(--six)"
                          : flash === "4"
                            ? "var(--info)"
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
                key={`${runs}-${wkts}`}
                initial={{ scale: 0.92, opacity: 0.6 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: "spring", stiffness: 420, damping: 24 }}
                className="mt-3 font-mono text-[56px] font-bold leading-none tabular-nums"
              >
                {runs}
                <span className="text-fg-subtle">/{wkts}</span>
              </motion.p>

              <p className="mt-2 font-mono text-[13px] text-fg-subtle">
                ({over.toFixed(1)} ov) · CRR {(runs / over).toFixed(2)}
              </p>

              <div className="mt-5 flex items-center justify-center gap-1.5">
                <AnimatePresence mode="popLayout" initial={false}>
                  {balls.map((b) => (
                    <motion.span
                      key={b.id}
                      layout
                      initial={{ scale: 0.3, opacity: 0, y: 12 }}
                      animate={{ scale: 1, opacity: 1, y: 0 }}
                      exit={{ scale: 0.3, opacity: 0, x: -14 }}
                      transition={{ type: "spring", stiffness: 420, damping: 30, mass: 0.6 }}
                    >
                      <BallChip v={b.v} size={34} />
                    </motion.span>
                  ))}
                </AnimatePresence>
              </div>
            </div>
          </Card>

          <Card className="p-5">
            <div className="grid grid-cols-3 gap-2.5">
              {KEYS.map((k) => (
                <button
                  key={k}
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
                  onClick={() => push(e)}
                  className="h-11 rounded-xl border border-[color-mix(in_oklab,var(--warn)_35%,transparent)] bg-[color-mix(in_oklab,var(--warn)_10%,transparent)] font-mono text-[13px] font-semibold uppercase text-[var(--warn)] transition-[transform,background-color] duration-[180ms] ease-[var(--ease-out)] hover:-translate-y-0.5 active:scale-95"
                >
                  {e}
                </button>
              ))}
            </div>

            <div className="mt-2.5 grid grid-cols-3 gap-2.5">
              <button
                onClick={() => push("W")}
                className="col-span-2 h-14 rounded-xl border border-transparent bg-[var(--live)] font-mono text-lg font-bold uppercase text-white transition-[transform,filter] duration-[180ms] ease-[var(--ease-out)] hover:-translate-y-0.5 hover:brightness-110 active:scale-95"
              >
                Wicket
              </button>
              <button
                onClick={undo}
                className="flex h-14 items-center justify-center gap-2 rounded-xl border border-line bg-surface text-[13px] font-semibold text-fg-muted transition-colors duration-[180ms] hover:bg-surface-strong hover:text-fg"
              >
                <Undo2 size={15} /> Undo
              </button>
            </div>
          </Card>
        </div>

        {/* live state */}
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
                  <Th align="right">SR</Th>
                </tr>
              </thead>
              <Tbody>
                {BATTERS.map((b) => (
                  <Tr key={b.name}>
                    <Td>
                      {b.name}
                      {b.strike ? <span className="ml-1 text-[var(--accent)]">*</span> : null}
                    </Td>
                    <Td align="right" className="font-mono font-semibold">{b.runs}</Td>
                    <Td align="right" className="font-mono text-fg-muted">{b.balls}</Td>
                    <Td align="right" className="font-mono text-fg-muted">
                      {((b.runs / b.balls) * 100).toFixed(1)}
                    </Td>
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
                {BOWLERS.map((b) => (
                  <Tr key={b.name}>
                    <Td>{b.name}</Td>
                    <Td align="right" className="font-mono text-fg-muted">{b.overs}</Td>
                    <Td align="right" className="font-mono text-fg-muted">{b.runs}</Td>
                    <Td align="right" className="font-mono font-semibold">{b.wickets}</Td>
                    <Td align="right" className="font-mono text-fg-muted">{b.econ}</Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
          </Card>

          <Card className="flex items-center gap-3 p-4">
            <RotateCcw size={15} className="shrink-0 text-fg-subtle" />
            <p className="text-[12.5px] text-fg-muted">
              Every ball you tap is pushed live to the match page, the points
              table and the broadcast overlay.
            </p>
          </Card>
        </div>
      </div>
    </>
  );
}
