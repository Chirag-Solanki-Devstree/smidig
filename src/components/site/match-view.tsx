"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "motion/react";
import { MapPin, Play, Share2, Ticket } from "lucide-react";
import {
  Badge,
  BallChip,
  Button,
  Card,
  Progress,
  Table,
  Tbody,
  Td,
  TeamBadge,
  Th,
  Tr,
} from "@/components/kit";
import {
  BATTERS,
  BOWLERS,
  COMMENTARY,
  OVER_BALLS,
  SPONSORS,
  TICKET_TYPES,
  matchByNo,
  teamByShort,
  tournamentBySlug,
} from "@/lib/data";
import { formatMoney, splitFee } from "@/lib/money";
import { useToast } from "@/components/kit/toast";
import { cx } from "@/lib/cx";

export function MatchView({ slug, no }: { slug: string; no: number }) {
  const m = matchByNo(slug, no)!;
  const t = tournamentBySlug(slug)!;
  const A = teamByShort(m.teamA);
  const B = teamByShort(m.teamB);
  const live = m.status === "live";

  const toast = useToast();
  const [picked, setPicked] = useState(TICKET_TYPES[1].id);
  const [n, setN] = useState(0);
  useEffect(() => {
    if (!live) return;
    const id = setInterval(() => setN((v) => v + 1), 1600);
    return () => clearInterval(id);
  }, [live]);
  const balls = Array.from({ length: 6 }, (_, i) => OVER_BALLS[(n + i) % OVER_BALLS.length]);

  return (
    <div className="shell pt-28 pb-16 sm:pt-32">
      <Link
        href={`/t/${slug}`}
        className="inline-flex items-center gap-1.5 text-[12.5px] text-fg-muted transition-colors duration-[var(--dur)] hover:text-fg"
      >
        ← {t.name}
      </Link>

      {/* broadcast scoreboard */}
      <motion.div
        initial={{ opacity: 0, scale: 0.985 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="mt-4 overflow-hidden rounded-2xl border border-line bg-[color-mix(in_oklab,var(--bg-elev)_90%,transparent)]"
      >
        <div className="flex flex-wrap items-center gap-3 border-b border-line px-5 py-3">
          {live ? <Badge tone="live" pulse>Live</Badge> : <Badge tone="completed">Result</Badge>}
          <span className="text-[12.5px] text-fg-muted">
            Match {m.no} · {m.stage}
          </span>
          <span className="ml-auto inline-flex items-center gap-1.5 text-[12px] text-fg-subtle">
            <MapPin size={12} /> {m.venue}
          </span>
        </div>

        <div className="grid gap-5 px-5 py-6 sm:grid-cols-[1.1fr_auto_1.1fr] sm:items-center">
          <TeamScore team={A} innings={m.a} active={live} />
          <div className="hidden flex-col items-center gap-1 sm:flex">
            <span className="font-mono text-[10px] uppercase tracking-widest text-fg-subtle">vs</span>
            <span className="h-12 w-px bg-line" />
          </div>
          <TeamScore team={B} innings={m.b} align="right" />
        </div>

        {m.target || m.result ? (
          <p className="border-t border-line bg-surface/50 px-5 py-3 text-center text-[13.5px] font-medium text-[var(--accent)]">
            {m.result ?? m.target}
          </p>
        ) : null}

        {live ? (
          <div className="flex flex-wrap items-center gap-3 border-t border-line px-5 py-4">
            <span className="font-mono text-[10px] uppercase tracking-widest text-fg-subtle">
              This over
            </span>
            <div className="flex items-center gap-1.5">
              <AnimatePresence mode="popLayout" initial={false}>
                {balls.map((b, i) => (
                  <motion.span
                    key={`${n}-${i}`}
                    layout
                    initial={i === 5 ? { scale: 0.3, opacity: 0, y: 10 } : false}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    exit={{ scale: 0.3, opacity: 0, x: -12 }}
                    transition={{ type: "spring", stiffness: 420, damping: 30, mass: 0.6 }}
                  >
                    <BallChip v={b} />
                  </motion.span>
                ))}
              </AnimatePresence>
            </div>
          </div>
        ) : null}
      </motion.div>

      <div className="mt-6 grid gap-5 lg:grid-cols-[1.6fr_1fr]">
        <div className="space-y-5">
          {/* stream */}
          <Card className="overflow-hidden">
            <div className="relative grid aspect-video place-items-center bg-[color-mix(in_oklab,var(--bg)_70%,transparent)]">
              <div className="absolute inset-0 grid-bg opacity-50" />
              <button className="group relative grid h-16 w-16 place-items-center rounded-full bg-[linear-gradient(135deg,var(--accent),var(--accent-2))] text-[var(--accent-fg)] shadow-[0_18px_50px_-18px_var(--glow)] transition-transform duration-[var(--dur)] ease-[var(--ease-out)] hover:scale-110">
                <Play size={22} className="translate-x-0.5" fill="currentColor" />
                <span className="absolute inset-0 animate-ping rounded-full border border-[var(--accent)] opacity-40" />
              </button>
              <span className="absolute bottom-3 left-3 rounded-md border border-line bg-[color-mix(in_oklab,var(--bg)_80%,transparent)] px-2 py-1 text-[11px] text-fg-subtle">
                YouTube Live · connected by organizer
              </span>
            </div>
          </Card>

          {/* scorecard */}
          <Card className="overflow-hidden">
            <p className="border-b border-line px-5 py-3 text-[13px] font-semibold">
              Batting · {A.name}
            </p>
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
                {BATTERS.map((b) => (
                  <Tr key={b.name}>
                    <Td>
                      {b.name}
                      {b.strike ? <span className="ml-1 text-[var(--accent)]">*</span> : null}
                    </Td>
                    <Td align="right" className="font-mono font-semibold">{b.runs}</Td>
                    <Td align="right" className="font-mono text-fg-muted">{b.balls}</Td>
                    <Td align="right" className="font-mono text-fg-muted">{b.fours}</Td>
                    <Td align="right" className="font-mono text-fg-muted">{b.sixes}</Td>
                    <Td align="right" className="font-mono text-fg-muted">
                      {((b.runs / b.balls) * 100).toFixed(1)}
                    </Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>

            <p className="border-y border-line px-5 py-3 text-[13px] font-semibold">
              Bowling · {B.name}
            </p>
            <Table>
              <thead>
                <tr>
                  <Th>Bowler</Th>
                  <Th align="right">O</Th>
                  <Th align="right">M</Th>
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
                    <Td align="right" className="font-mono text-fg-muted">{b.maidens}</Td>
                    <Td align="right" className="font-mono text-fg-muted">{b.runs}</Td>
                    <Td align="right" className="font-mono font-semibold">{b.wickets}</Td>
                    <Td align="right" className="font-mono text-fg-muted">{b.econ}</Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
          </Card>

          {/* commentary */}
          <Card className="p-5">
            <p className="text-[13px] font-semibold">Commentary</p>
            <ul className="mt-4 space-y-3">
              {COMMENTARY.map((c, i) => (
                <motion.li
                  key={c.ball}
                  initial={{ opacity: 0, x: -10 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: i * 0.05 }}
                  className="flex gap-3 text-[13px]"
                >
                  <span className="shrink-0 font-mono text-[11.5px] text-fg-subtle">{c.ball}</span>
                  <span
                    className={cx(
                      c.kind === "wicket"
                        ? "text-[var(--live)]"
                        : c.kind === "six"
                          ? "text-[var(--six)]"
                          : c.kind === "four"
                            ? "text-[var(--info)]"
                            : "text-fg-muted",
                    )}
                  >
                    {c.text}
                  </span>
                </motion.li>
              ))}
            </ul>
          </Card>
        </div>

        {/* ticket box + sponsors */}
        <div className="space-y-5">
          <Card className="p-5">
            <div className="flex items-center justify-between">
              <p className="text-[13px] font-semibold">Tickets</p>
              <Badge tone="info">
                {m.ticketsSold}/{m.capacity} sold
              </Badge>
            </div>
            <div className="mt-3">
              <Progress value={m.ticketsSold ?? 0} max={m.capacity ?? 1} tone="info" />
            </div>

            <ul className="mt-4 space-y-2">
              {TICKET_TYPES.map((tt) => {
                const left = tt.capacity - tt.sold;
                const fee = splitFee(tt.price, { bps: 500, fixed: 500, paidBy: "buyer" });
                return (
                  <li key={tt.id}>
                    <button
                      type="button"
                      onClick={() => setPicked(tt.id)}
                      aria-pressed={picked === tt.id}
                      disabled={left <= 0}
                      className={cx(
                        "flex w-full items-center gap-3 rounded-xl border bg-surface px-3.5 py-3 text-left",
                        "transition-[border-color,transform] duration-[var(--dur)] ease-[var(--ease-out)]",
                        left <= 0
                          ? "cursor-not-allowed border-line opacity-55"
                          : picked === tt.id
                            ? "border-[var(--accent)] bg-[color-mix(in_oklab,var(--accent)_10%,transparent)]"
                            : "border-line hover:-translate-y-0.5 hover:border-[var(--accent)]",
                      )}
                    >
                    <span className="min-w-0 flex-1">
                      <span className="block text-[13px] font-medium">{tt.name}</span>
                      <span className="block text-[11.5px] text-fg-subtle">
                        {left > 0 ? `${left} left` : "Sold out"}
                      </span>
                    </span>
                    <span className="text-right">
                      <span className="block font-mono text-[14px] font-semibold">
                        {tt.price === 0 ? "Free" : formatMoney({ amount: tt.price, currency: "INR" })}
                      </span>
                      {tt.price > 0 ? (
                        <span className="block text-[10.5px] text-fg-subtle">
                          +{formatMoney({ amount: fee.smidigFee, currency: "INR" })} fee
                        </span>
                      ) : null}
                    </span>
                    </button>
                  </li>
                );
              })}
            </ul>

            <Button
              variant="primary"
              className="mt-4 w-full"
              data-testid="get-tickets"
              onClick={() =>
                toast({
                  title: "Ticket reserved",
                  body: `${TICKET_TYPES.find((x) => x.id === picked)?.name} · QR will be emailed to you.`,
                  tone: "ok",
                })
              }
            >
              <Ticket size={15} /> Get tickets
            </Button>
            <p className="mt-2.5 text-center text-[11px] text-fg-subtle">
              QR e-ticket, scanned at the gate
            </p>
          </Card>

          <Card className="p-5">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-fg-subtle">
              Match sponsors
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              {SPONSORS.slice(0, 5).map((s) => (
                <span
                  key={s.name}
                  className="rounded-lg border border-line bg-surface px-3 py-2 text-[12px] text-fg-subtle grayscale transition-[color,filter] duration-[var(--dur)] hover:text-fg hover:grayscale-0"
                >
                  {s.name}
                </span>
              ))}
            </div>
          </Card>

          <Button
            variant="secondary"
            className="w-full"
            onClick={() =>
              toast({ title: "Link copied", body: "Share it on WhatsApp or anywhere else.", tone: "info" })
            }
          >
            <Share2 size={15} /> Share this match
          </Button>
        </div>
      </div>
    </div>
  );
}

function TeamScore({
  team,
  innings,
  align,
  active,
}: {
  team: ReturnType<typeof teamByShort>;
  innings?: { runs: number; wickets: number; overs: string };
  align?: "right";
  active?: boolean;
}) {
  return (
    <div className={cx("flex items-center gap-3", align === "right" && "sm:flex-row-reverse sm:text-right")}>
      <TeamBadge short={team.short} colour={team.colour} size={48} />
      <div className="min-w-0">
        <p className="truncate text-[13px] text-fg-muted">{team.name}</p>
        <p className="font-mono text-[30px] font-semibold leading-tight tabular-nums sm:text-[36px]">
          {innings ? (
            <>
              {innings.runs}
              <span className="text-fg-subtle">/{innings.wickets}</span>
            </>
          ) : (
            "—"
          )}
        </p>
        {innings ? (
          <p className="font-mono text-[12px] text-fg-subtle">
            ({innings.overs} ov){active ? " · batting" : ""}
          </p>
        ) : null}
      </div>
    </div>
  );
}
