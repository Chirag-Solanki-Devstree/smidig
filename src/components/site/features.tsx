"use client";

import { Reveal, RevealItem } from "@/components/fx/reveal";
import { TiltCard } from "@/components/fx/tilt-card";
import { SectionLabel } from "@/components/ui";
import { FEATURES } from "@/lib/content";

export function Features() {
  return (
    <section id="features" className="relative py-24 sm:py-32">
      <div className="shell">
        <Reveal className="mx-auto max-w-2xl text-center">
          <RevealItem>
            <SectionLabel>Everything in one place</SectionLabel>
          </RevealItem>
          <RevealItem>
            <h2 className="display mt-5 text-[clamp(2rem,4.6vw,3.2rem)]">
              From first toss to the trophy.
            </h2>
          </RevealItem>
          <RevealItem>
            <p className="mt-4 text-[15px] leading-relaxed text-fg-muted">
              Stop stitching together a spreadsheet, a WhatsApp group and a paper
              scorebook. One platform does the whole season.
            </p>
          </RevealItem>
        </Reveal>

        <Reveal
          className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
          stagger={0.09}
          amount={0.12}
        >
          {FEATURES.map((c) => (
            <RevealItem key={c.title} className={c.span}>
              <TiltCard className="h-full p-6" max={7}>
                <div className="mb-5 h-32 overflow-hidden rounded-xl border border-line bg-[color-mix(in_oklab,var(--bg)_55%,transparent)]">
                  <Art name={c.art} />
                </div>
                <h3 className="text-[15.5px] font-semibold tracking-tight">{c.title}</h3>
                <p className="mt-2 text-[13.5px] leading-relaxed text-fg-muted">{c.body}</p>
              </TiltCard>
            </RevealItem>
          ))}
        </Reveal>
      </div>
    </section>
  );
}

function Art({ name }: { name: string }) {
  switch (name) {
    case "fixtures":
      return <FixturesArt />;
    case "scoring":
      return <ScoringArt />;
    case "table":
      return <TableArt />;
    case "auction":
      return <AuctionArt />;
    case "stats":
      return <StatsArt />;
    default:
      return <BroadcastArt />;
  }
}

/* Bracket that draws itself in on hover. */
function FixturesArt() {
  return (
    <svg viewBox="0 0 320 128" className="h-full w-full">
      <g stroke="var(--border-strong)" strokeWidth="1.4" fill="none">
        <path d="M24 24h46v40h46M24 64h46M24 104h46V64" />
        <path d="M116 64h50" />
      </g>
      {[
        [24, 24],
        [24, 64],
        [24, 104],
      ].map(([x, y], i) => (
        <rect
          key={i}
          x={x - 14}
          y={y - 8}
          width="40"
          height="16"
          rx="4"
          fill="var(--surface-strong)"
          stroke="var(--border)"
        />
      ))}
      <rect
        x="166"
        y="54"
        width="58"
        height="20"
        rx="6"
        fill="color-mix(in oklab, var(--accent) 22%, transparent)"
        stroke="var(--accent)"
        className="origin-center [transform:scale(0.88)] transition-transform duration-[600ms] ease-[var(--ease-out)] group-hover:[transform:scale(1)]"
      />
      <text x="195" y="68" textAnchor="middle" fontSize="9" fill="var(--accent)" fontFamily="monospace">
        FINAL
      </text>
    </svg>
  );
}

/* Scoring keypad — keys lift in sequence on hover. */
function ScoringArt() {
  const keys = ["0", "1", "2", "3", "4", "6", "W", "WD", "NB"];
  return (
    <div className="grid h-full grid-cols-3 gap-1.5 p-3">
      {keys.map((k, i) => (
        <span
          key={k}
          style={{ transitionDelay: `${i * 28}ms` }}
          className={`grid place-items-center rounded-md border border-line text-[11px] font-mono font-semibold transition-all duration-[var(--dur)] ease-[var(--ease-out)] group-hover:-translate-y-0.5 ${
            k === "W"
              ? "bg-[color-mix(in_oklab,var(--accent-3)_22%,transparent)] text-[var(--accent-3)] group-hover:bg-[var(--accent-3)] group-hover:text-white"
              : k === "4" || k === "6"
                ? "bg-[color-mix(in_oklab,var(--accent)_18%,transparent)] text-[var(--accent)]"
                : "bg-surface text-fg-muted"
          }`}
        >
          {k}
        </span>
      ))}
    </div>
  );
}

/* Points table whose bars fill on hover. */
function TableArt() {
  const rows = [
    { t: "MUM", p: 92 },
    { t: "DEL", p: 74 },
    { t: "PUN", p: 58 },
    { t: "KOC", p: 36 },
  ];
  return (
    <div className="flex h-full flex-col justify-center gap-2 px-4">
      {rows.map((r, i) => (
        <div key={r.t} className="flex items-center gap-2.5">
          <span className="w-8 font-mono text-[10px] text-fg-subtle">{r.t}</span>
          <span className="h-1.5 flex-1 overflow-hidden rounded-full bg-line">
            <span
              style={{ width: `${r.p}%`, transitionDelay: `${i * 60}ms` }}
              className="block h-full origin-left scale-x-0 rounded-full bg-[linear-gradient(90deg,var(--accent),var(--accent-2))] transition-transform duration-[700ms] ease-[var(--ease-out)] group-hover:scale-x-100"
            />
          </span>
        </div>
      ))}
    </div>
  );
}

/* Auction gavel: bid chips rise on hover. */
function AuctionArt() {
  const bids = ["₹20L", "₹45L", "₹80L", "₹1.2Cr", "SOLD"];
  return (
    <div className="flex h-full items-end justify-center gap-2 p-4">
      {bids.map((b, i) => (
        <span
          key={b}
          style={{ transitionDelay: `${i * 55}ms`, height: `${34 + i * 13}px` }}
          className={`flex w-14 items-end justify-center rounded-t-md pb-1.5 text-[9.5px] font-mono font-semibold transition-transform duration-[var(--dur)] ease-[var(--ease-out)] group-hover:-translate-y-1.5 ${
            i === bids.length - 1
              ? "bg-[var(--accent)] text-[var(--accent-fg)]"
              : "bg-surface-strong text-fg-muted"
          }`}
        >
          {b}
        </span>
      ))}
    </div>
  );
}

/* Wagon wheel — spokes draw out on hover. */
/** Rounded so the server and client render byte-identical SVG coordinates. */
const round = (n: number) => Math.round(n * 100) / 100;

function StatsArt() {
  const spokes = [15, 55, 95, 140, 200, 250, 300, 335];
  return (
    <svg viewBox="0 0 320 128" className="h-full w-full">
      <circle cx="160" cy="64" r="48" fill="none" stroke="var(--border)" strokeWidth="1" />
      <circle cx="160" cy="64" r="26" fill="none" stroke="var(--border)" strokeWidth="1" strokeDasharray="3 3" />
      {spokes.map((deg, i) => {
        const r = (deg * Math.PI) / 180;
        return (
          <line
            key={deg}
            x1="160"
            y1="64"
            x2={round(160 + Math.cos(r) * 48)}
            y2={round(64 + Math.sin(r) * 48)}
            stroke={i % 3 === 0 ? "var(--accent)" : "var(--accent-2)"}
            strokeWidth="1.6"
            strokeLinecap="round"
            style={{ transitionDelay: `${i * 45}ms` }}
            className="origin-[160px_64px] [transform:scale(0.1)] transition-transform duration-[600ms] ease-[var(--ease-out)] group-hover:[transform:scale(1)]"
          />
        );
      })}
      <circle cx="160" cy="64" r="3" fill="var(--fg)" />
    </svg>
  );
}

/* Scorebug overlay preview. */
function BroadcastArt() {
  return (
    <div className="grid h-full place-items-center p-4">
      <div className="w-full rounded-lg border border-line bg-[color-mix(in_oklab,var(--bg-elev)_90%,transparent)] p-2 transition-transform duration-[var(--dur)] ease-[var(--ease-out)] group-hover:-translate-y-1 group-hover:shadow-[0_14px_36px_-16px_var(--glow)]">
        <div className="flex items-center gap-2">
          <span className="rounded bg-[var(--accent)] px-1.5 py-0.5 font-mono text-[9px] font-bold text-[var(--accent-fg)]">
            MUM
          </span>
          <span className="font-mono text-[13px] font-semibold">182/4</span>
          <span className="font-mono text-[9px] text-fg-subtle">18.2</span>
          <span className="ml-auto rounded bg-[var(--accent-3)] px-1.5 py-0.5 font-mono text-[8px] font-bold uppercase text-white">
            live
          </span>
        </div>
      </div>
    </div>
  );
}
