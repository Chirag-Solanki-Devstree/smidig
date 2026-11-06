"use client";

import { useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion, useScroll, useTransform } from "motion/react";
import {
  CalendarDays,
  Handshake,
  MapPin,
  Share2,
  Store,
  Ticket,
  Trophy,
  Users,
} from "lucide-react";
import { MatchCard } from "@/components/cards/match-card";
import {
  Badge,
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
import { SPORT_BY_ID } from "@/lib/sports";
import { formatMoney } from "@/lib/money";
import {
  matchesFor,
  SPONSORS,
  SPONSOR_TIERS,
  STALLS,
  TEAMS,
  tournamentBySlug,
} from "@/lib/data";
import { useToast } from "@/components/kit/toast";
import { Rise } from "@/components/fx/reveal-on-scroll";
import { cx } from "@/lib/cx";

const TABS = [
  "Overview",
  "Fixtures",
  "Points table",
  "Teams",
  "Sponsors",
  "Food & stalls",
  "Venue",
] as const;

export function TournamentView({ slug }: { slug: string }) {
  const t = tournamentBySlug(slug)!;
  // Banner drifts slower than the page, so the header has depth as you scroll.
  const { scrollY } = useScroll();
  const bannerY = useTransform(scrollY, [0, 400], [0, 70]);
  const bannerScale = useTransform(scrollY, [0, 400], [1, 1.08]);
  const sport = SPORT_BY_ID[t.sport];
  const [tab, setTab] = useState<(typeof TABS)[number]>("Overview");
  const matches = matchesFor(slug);

  return (
    <>
      {/* banner */}
      <header className="relative pt-14">
        <motion.div
          style={{ y: bannerY, scale: bannerScale }}
          className={cx("absolute inset-x-0 top-0 h-72 origin-top bg-gradient-to-br", t.banner)}
        >
          <div className="absolute inset-0 turf-bg opacity-50" />
          <div className="absolute inset-0 bg-[linear-gradient(to_top,var(--bg),transparent_75%)]" />
        </motion.div>

        <div className="shell relative pt-24">
          <motion.div
            initial={{ opacity: 0, y: 22 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1], delay: 0.1 }}
          >
            <div className="flex flex-wrap items-center gap-2">
              <Badge tone={t.status === "ongoing" ? "live" : "open"} pulse={t.status === "ongoing"}>
                {t.status === "ongoing" ? "Ongoing" : "Registration open"}
              </Badge>
              <Badge tone="neutral">
                <sport.icon size={11} /> {sport.name}
              </Badge>
              <Badge tone="neutral">{t.matchType}</Badge>
              <Badge tone="neutral">{t.ballType} ball</Badge>
              {t.featured ? <Badge tone="featured">Featured</Badge> : null}
            </div>

            <h1 className="display mt-4 max-w-3xl text-[clamp(1.9rem,5vw,3.2rem)]">{t.name}</h1>

            <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 text-[13px] text-fg-muted">
              <span className="inline-flex items-center gap-1.5">
                <MapPin size={13} /> {t.venue}, {t.city}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <CalendarDays size={13} /> {fmtRange(t.start, t.end)}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Users size={13} /> {t.teamsJoined}/{t.maxTeams} {sport.entrant.many.toLowerCase()}
              </span>
              {t.prize > 0 ? (
                <span className="inline-flex items-center gap-1.5 text-[var(--accent-2)]">
                  <Trophy size={13} />{" "}
                  {formatMoney({ amount: t.prize, currency: "INR" }, { compact: true })} prize pool
                </span>
              ) : null}
            </div>

            <p className="mt-4 max-w-2xl text-[14px] leading-relaxed text-fg-muted">{t.blurb}</p>

            <div className="mt-7 flex flex-wrap gap-2.5">
              <Button href={`/t/${slug}/register`} variant="primary">
                <Users size={15} /> Register a team
                <span className="ml-1 rounded-full bg-black/15 px-2 py-0.5 text-[11px]">
                  {t.entryFee === 0 ? "Free" : formatMoney({ amount: t.entryFee, currency: "INR" })}
                </span>
              </Button>
              <Button href={`/t/${slug}/m/14`} variant="secondary">
                <Ticket size={15} /> Buy tickets
              </Button>
              <Button onClick={() => setTab("Sponsors")} variant="gold">
                <Handshake size={15} /> Become a sponsor
              </Button>
              <Button onClick={() => setTab("Food & stalls")} variant="secondary">
                <Store size={15} /> Book a stall
              </Button>
              <Button variant="ghost" aria-label="Share">
                <Share2 size={15} />
              </Button>
            </div>

            <p className="mt-4 text-[12px] text-fg-subtle">
              Organized by <span className="text-fg-muted">{t.organizer}</span>
            </p>
          </motion.div>
        </div>
      </header>

      {/* tabs */}
      <div className="sticky top-[4.5rem] z-20 mt-10 border-y border-line bg-[color-mix(in_oklab,var(--bg)_88%,transparent)] backdrop-blur">
        <div className="shell mask-fade-x overflow-x-auto scroll-thin">
          <div className="flex min-w-max gap-1 py-2">
            {TABS.map((x) => (
              <button
                key={x}
                onClick={() => setTab(x)}
                className={cx(
                  "relative rounded-full px-3.5 py-2 text-[13px] font-medium transition-colors duration-[var(--dur)]",
                  tab === x ? "text-[var(--accent-fg)]" : "text-fg-muted hover:text-fg",
                )}
              >
                {tab === x ? (
                  <motion.span
                    layoutId="t-tab"
                    transition={{ type: "spring", stiffness: 380, damping: 32, mass: 0.6 }}
                    className="absolute inset-0 rounded-full bg-[linear-gradient(110deg,var(--accent),var(--accent-2))]"
                  />
                ) : null}
                <span className="relative">{x}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* panels — each swaps with a short cross-slide so the tab change reads */}
      <div className="shell py-10">
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={tab}
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
          >
            {tab === "Overview" ? <Overview t={t} /> : null}
            {tab === "Fixtures" ? (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {matches.map((m) => (
                  <MatchCard key={m.id} m={m} />
                ))}
              </div>
            ) : null}
            {tab === "Points table" ? <PointsTable /> : null}
            {tab === "Teams" ? <Teams /> : null}
            {tab === "Sponsors" ? <Sponsors /> : null}
            {tab === "Food & stalls" ? <Stalls /> : null}
            {tab === "Venue" ? <Venue t={t} /> : null}
          </motion.div>
        </AnimatePresence>
      </div>
    </>
  );
}

/* ------------------------------------------------------------------ panels */

function Overview({ t }: { t: ReturnType<typeof tournamentBySlug> }) {
  if (!t) return null;
  return (
    <div className="grid gap-4 lg:grid-cols-3">
      <Rise className="lg:col-span-2">
      <Card className="h-full p-6">
        <h3 className="text-[15px] font-semibold">Rules & format</h3>
        <ul className="mt-4 space-y-2.5 text-[13.5px] text-fg-muted">
          {[
            `${t.format} — group stage followed by semi-finals and a final.`,
            `${t.matchType} matches with a ${t.ballType.toLowerCase()} ball.`,
            "Squad of 11–15. Minimum 11 present at toss or the match is forfeited.",
            "2 points for a win, 1 for a tie or no result. Net run rate separates level teams.",
            "Umpires appointed by the organizer. Their decision is final.",
            "Full refund if the tournament is cancelled before the first ball.",
          ].map((r) => (
            <li key={r} className="flex gap-2.5">
              <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--accent)]" />
              {r}
            </li>
          ))}
        </ul>
      </Card>
      </Rise>

      <div className="space-y-4">
        <Card className="p-5">
          <p className="text-[12px] text-fg-muted">Entries</p>
          <p className="mt-1.5 font-mono text-2xl font-semibold">
            {t.teamsJoined}
            <span className="text-fg-subtle">/{t.maxTeams}</span>
          </p>
          <div className="mt-3">
            <Progress value={t.teamsJoined} max={t.maxTeams} />
          </div>
          <p className="mt-3 text-[12px] text-fg-subtle">
            {t.maxTeams - t.teamsJoined > 0
              ? `${t.maxTeams - t.teamsJoined} spots left`
              : "Draw is full"}
          </p>
        </Card>
        <Card className="p-5">
          <p className="text-[12px] text-fg-muted">Prize pool</p>
          <p className="mt-1.5 font-mono text-2xl font-semibold text-[var(--accent-2)]">
            {t.prize ? formatMoney({ amount: t.prize, currency: "INR" }, { compact: true }) : "—"}
          </p>
          <p className="mt-3 text-[12px] text-fg-subtle">
            Winner 60% · Runner-up 25% · Individual awards 15%
          </p>
        </Card>
      </div>
    </div>
  );
}

function PointsTable() {
  const rows = [...TEAMS].sort((a, b) => b.pts - a.pts || b.nrr - a.nrr);
  return (
    <Card className="overflow-hidden">
      <Table>
        <thead>
          <tr>
            <Th>#</Th>
            <Th>Team</Th>
            <Th align="right">P</Th>
            <Th align="right">W</Th>
            <Th align="right">L</Th>
            <Th align="right">Pts</Th>
            <Th align="right">NRR</Th>
          </tr>
        </thead>
        <Tbody>
          {rows.map((t, i) => (
            <Tr key={t.id}>
              <Td className={cx("font-mono text-[12px]", i < 4 ? "text-[var(--accent)]" : "text-fg-subtle")}>
                {String(i + 1).padStart(2, "0")}
              </Td>
              <Td>
                <span className="flex items-center gap-2.5">
                  <TeamBadge short={t.short} colour={t.colour} size={26} />
                  <span className="font-medium transition-transform duration-[var(--dur)] ease-[var(--ease-out)] group-hover:translate-x-0.5">
                    {t.name}
                  </span>
                  {i < 4 ? <Badge tone="open">Q</Badge> : null}
                </span>
              </Td>
              <Td align="right" className="font-mono text-fg-muted">{t.played}</Td>
              <Td align="right" className="font-mono text-fg-muted">{t.won}</Td>
              <Td align="right" className="font-mono text-fg-muted">{t.lost}</Td>
              <Td align="right" className="font-mono font-semibold">{t.pts}</Td>
              <Td align="right" className={cx("font-mono", t.nrr >= 0 ? "text-[var(--ok)]" : "text-[var(--live)]")}>
                {t.nrr > 0 ? "+" : ""}
                {t.nrr.toFixed(2)}
              </Td>
            </Tr>
          ))}
        </Tbody>
      </Table>
      <p className="border-t border-line px-4 py-3 text-[11.5px] text-fg-subtle">
        Top four qualify for the semi-finals. NRR recalculates the moment a match is marked complete.
      </p>
    </Card>
  );
}

function Teams() {
  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
      {TEAMS.map((t) => (
        <Card
          key={t.id}
          className="group p-5 transition-[transform,border-color] duration-[var(--dur)] ease-[var(--ease-out)] hover:-translate-y-1 hover:border-line-strong"
        >
          <TeamBadge short={t.short} colour={t.colour} size={44} />
          <p className="mt-3 text-[14px] font-semibold">{t.name}</p>
          <p className="mt-0.5 text-[12px] text-fg-subtle">{t.city}</p>
          <p className="mt-3 font-mono text-[12px] text-fg-muted">
            {t.won}W · {t.lost}L · {t.pts} pts
          </p>
        </Card>
      ))}
    </div>
  );
}

function Sponsors() {
  const toast = useToast();
  return (
    <div className="space-y-6">
      <div className="grid gap-4 lg:grid-cols-3">
        {SPONSOR_TIERS.map((s) => {
          const left = s.slots - s.taken;
          return (
            <Card
              key={s.id}
              className={cx(
                "group flex flex-col p-6 transition-[transform,border-color] duration-[var(--dur)] ease-[var(--ease-out)] hover:-translate-y-1",
                s.tier === "Title"
                  ? "border-[color-mix(in_oklab,var(--accent-2)_45%,transparent)]"
                  : "hover:border-line-strong",
              )}
            >
              <div className="flex items-center justify-between">
                <h3 className="text-[15px] font-semibold">{s.tier}</h3>
                <Badge tone={left ? "open" : "closed"}>
                  {left ? `${left} left` : "Sold out"}
                </Badge>
              </div>
              <p className="mt-4 font-mono text-3xl font-semibold">
                {formatMoney({ amount: s.price, currency: "INR" }, { compact: true })}
              </p>
              <ul className="mt-5 flex-1 space-y-2 text-[13px] text-fg-muted">
                {s.perks.map((p) => (
                  <li key={p} className="flex gap-2.5">
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--accent-2)]" />
                    {p}
                  </li>
                ))}
              </ul>
              <Button
                variant={s.tier === "Title" ? "gold" : "secondary"}
                className="mt-6 w-full"
                disabled={!left}
                onClick={() =>
                  toast({
                    title: `${s.tier} package reserved`,
                    body: "Held for 10 minutes while you complete checkout.",
                    tone: "ok",
                  })
                }
              >
                {left ? "Buy this package" : "Sold out"}
              </Button>
            </Card>
          );
        })}
      </div>

      <Card className="p-6">
        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-fg-subtle">
          Current sponsors
        </p>
        <div className="mt-4 flex flex-wrap gap-3">
          {SPONSORS.map((s) => (
            <span
              key={s.name}
              className="rounded-xl border border-line bg-surface px-4 py-2.5 text-[13px] text-fg-subtle grayscale transition-[color,filter,transform] duration-[var(--dur)] ease-[var(--ease-out)] hover:-translate-y-0.5 hover:text-fg hover:grayscale-0"
            >
              {s.name}
            </span>
          ))}
        </div>
      </Card>
    </div>
  );
}

function Stalls() {
  const toast = useToast();
  const [picked, setPicked] = useState<string | null>(null);
  const zones = ["A", "B", "C"] as const;
  return (
    <div className="grid gap-4 lg:grid-cols-[1.4fr_1fr]">
      <Card className="p-6">
        <h3 className="text-[15px] font-semibold">Stall map</h3>
        <p className="mt-1 text-[13px] text-fg-muted">
          Pick a pitch. Booked stalls are locked; held ones are in someone's
          checkout for the next 10 minutes.
        </p>
        <div className="mt-6 space-y-5">
          {zones.map((z) => (
            <div key={z}>
              <p className="mb-2 font-mono text-[11px] uppercase tracking-widest text-fg-subtle">
                Zone {z}
              </p>
              <div className="grid grid-cols-4 gap-2">
                {STALLS.filter((s) => s.zone === z).map((s) => (
                  <button
                    key={s.id}
                    onClick={() => setPicked(s.id)}
                    aria-pressed={picked === s.id}
                    disabled={s.status !== "available"}
                    title={s.vendor ?? s.size}
                    className={cx(
                      "group relative rounded-lg border p-3 text-left transition-[transform,border-color,background-color] duration-[var(--dur)] ease-[var(--ease-out)]",
                      s.status === "available" && picked === s.id
                        ? "border-[var(--accent)] bg-[color-mix(in_oklab,var(--accent)_14%,transparent)]"
                        : s.status === "available"
                        ? "border-line bg-surface hover:-translate-y-0.5 hover:border-[var(--accent)]"
                        : s.status === "held"
                          ? "cursor-not-allowed border-[color-mix(in_oklab,var(--warn)_40%,transparent)] bg-[color-mix(in_oklab,var(--warn)_10%,transparent)]"
                          : "cursor-not-allowed border-line bg-surface-strong opacity-60",
                    )}
                  >
                    <span className="block font-mono text-[12px] font-semibold">{s.id}</span>
                    <span className="mt-0.5 block text-[10.5px] text-fg-subtle">{s.size}</span>
                    <span
                      className={cx(
                        "mt-1.5 block text-[10px] font-semibold uppercase tracking-wide",
                        s.status === "available"
                          ? "text-[var(--accent)]"
                          : s.status === "held"
                            ? "text-[var(--warn)]"
                            : "text-fg-subtle",
                      )}
                    >
                      {s.status === "available" ? formatMoney({ amount: s.price, currency: "INR" }, { compact: true }) : s.status}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </Card>

      <Card className="h-fit p-6">
        <h3 className="text-[15px] font-semibold">Vendor terms</h3>
        <ul className="mt-4 space-y-2.5 text-[13px] text-fg-muted">
          {[
            "Stall price covers the full tournament unless marked weekend.",
            "Power point and one table included; everything else is yours.",
            "FSSAI licence number required at checkout.",
            "Setup from 2 hours before the first match of each day.",
          ].map((x) => (
            <li key={x} className="flex gap-2.5">
              <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--accent)]" />
              {x}
            </li>
          ))}
        </ul>
        <Button
          variant="primary"
          className="mt-6 w-full"
          disabled={!picked}
          onClick={() =>
            toast({
              title: picked ? `Stall ${picked} held` : "Pick a stall first",
              body: "Complete payment within 10 minutes to confirm it.",
              tone: "ok",
            })
          }
        >
          {picked ? `Book stall ${picked}` : "Pick a stall on the map"}
        </Button>
      </Card>
    </div>
  );
}

function Venue({ t }: { t: ReturnType<typeof tournamentBySlug> }) {
  if (!t) return null;
  return (
    <div className="grid gap-4 lg:grid-cols-[1.4fr_1fr]">
      <Card className="relative overflow-hidden">
        <div className="grid h-72 place-items-center bg-[color-mix(in_oklab,var(--bg-elev)_80%,transparent)]">
          <div className="absolute inset-0 grid-bg opacity-60" />
          <div className="relative text-center">
            <MapPin size={26} className="mx-auto text-[var(--accent)]" />
            <p className="mt-3 text-[14px] font-semibold">{t.venue}</p>
            <p className="mt-1 text-[12.5px] text-fg-subtle">{t.city}</p>
            <p className="mt-4 text-[11.5px] text-fg-subtle">Map embed goes here</p>
          </div>
        </div>
      </Card>
      <Card className="p-6">
        <h3 className="text-[15px] font-semibold">Getting there</h3>
        <ul className="mt-4 space-y-3 text-[13px] text-fg-muted">
          <li><span className="text-fg">Parking</span> · 180 spaces, free for ticket holders</li>
          <li><span className="text-fg">Nearest station</span> · 1.2 km, autos at the gate</li>
          <li><span className="text-fg">Gates open</span> · 60 minutes before the first ball</li>
          <li><span className="text-fg">Bag policy</span> · No glass, no outside drinks</li>
        </ul>
        <Link
          href="#"
          className="mt-5 inline-flex items-center gap-1.5 text-[13px] font-semibold text-[var(--accent)]"
        >
          Open in Maps →
        </Link>
      </Card>
    </div>
  );
}

function fmtRange(a: string, b: string) {
  const f = (d: string) =>
    new Date(d + "T00:00:00Z").toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
      timeZone: "UTC",
    });
  return `${f(a)} – ${f(b)}`;
}
