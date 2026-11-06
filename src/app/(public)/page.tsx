import Link from "next/link";
import { ArrowRight, Handshake, Search, Store, Ticket } from "lucide-react";
import { MarketHero } from "@/components/site/market-hero";
import { SportChips } from "@/components/site/sport-chips";
import { LiveRail } from "@/components/site/live-rail";
import { Reveal, RevealItem } from "@/components/fx/reveal";
import { TournamentCard } from "@/components/cards/tournament-card";
import { Button, Card, SectionHeading } from "@/components/kit";
import { TOURNAMENTS } from "@/lib/data";

const featured = TOURNAMENTS.filter((t) => t.featured);
const upcoming = TOURNAMENTS.filter((t) => t.status === "registration_open");

const WAYS = [
  {
    icon: Ticket,
    title: "Buy a match ticket",
    body: "Free or paid, one QR per match, scanned at the gate.",
    href: "/live",
    cta: "See live matches",
  },
  {
    icon: Handshake,
    title: "Sponsor a tournament",
    body: "Your logo on the tournament page, every match page and the stream.",
    href: "/t/deccan-premier-league-2026",
    cta: "View packages",
  },
  {
    icon: Store,
    title: "Book a food stall",
    body: "Pick your pitch on the venue map and pay online.",
    href: "/t/deccan-premier-league-2026",
    cta: "See the stall map",
  },
];

export default function HomePage() {
  return (
    <>
      <MarketHero />

      <section className="shell -mt-4 pb-4">
        <SportChips />
      </section>

      <LiveRail />

      <section className="shell py-16 sm:py-20">
        <SectionHeading
          eyebrow="Featured"
          title="Tournaments worth watching"
          sub="Picked by the Smidig team — big prize pools, full draws and live streams."
          action={
            <Button href="/tournaments" variant="secondary" size="sm">
              Browse all <ArrowRight size={14} />
            </Button>
          }
        />
        <Reveal className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3" stagger={0.09} amount={0.15}>
          {featured.map((t) => (
            <RevealItem key={t.id}>
              <TournamentCard t={t} />
            </RevealItem>
          ))}
          <RevealItem>
            <Link
              href="/tournaments"
              className="group flex h-full min-h-[18rem] flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-line-strong bg-surface/30 p-6 text-center transition-[background-color,transform] duration-[var(--dur)] ease-[var(--ease-out)] hover:-translate-y-1 hover:bg-surface"
            >
              <span className="grid h-11 w-11 place-items-center rounded-full border border-line bg-surface text-fg-subtle transition-colors duration-[var(--dur)] group-hover:border-[var(--accent)] group-hover:text-[var(--accent)]">
                <Search size={17} />
              </span>
              <span className="text-[14px] font-semibold">Find a tournament near you</span>
              <span className="max-w-[14rem] text-[12.5px] text-fg-muted">
                Filter by city, date, format and entry fee.
              </span>
            </Link>
          </RevealItem>
        </Reveal>
      </section>

      <section className="shell pb-16 sm:pb-20">
        <SectionHeading
          eyebrow="Entries open"
          title="Register your team this week"
          sub="Registration closes soon on these. Pay the entry fee online and you are in the draw."
        />
        <Reveal className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3" stagger={0.09} amount={0.15}>
          {upcoming.map((t) => (
            <RevealItem key={t.id}>
              <TournamentCard t={t} />
            </RevealItem>
          ))}
        </Reveal>
      </section>

      <section className="shell pb-16 sm:pb-24">
        <SectionHeading
          eyebrow="Three ways in"
          title="You do not have to play to take part."
        />
        <Reveal className="grid gap-4 md:grid-cols-3" stagger={0.1} amount={0.2}>
          {WAYS.map((w) => (
            <RevealItem key={w.title}>
              <Card className="group h-full p-6 transition-[transform,border-color] duration-[var(--dur)] ease-[var(--ease-out)] hover:-translate-y-1 hover:border-line-strong">
                <span className="grid h-10 w-10 place-items-center rounded-xl border border-line bg-surface text-[var(--accent)] transition-transform duration-[var(--dur)] ease-[var(--ease-out)] group-hover:scale-110">
                  <w.icon size={18} />
                </span>
                <h3 className="mt-4 text-[15px] font-semibold tracking-tight">{w.title}</h3>
                <p className="mt-2 text-[13.5px] leading-relaxed text-fg-muted">{w.body}</p>
                <Link
                  href={w.href}
                  className="mt-4 inline-flex items-center gap-1.5 text-[13px] font-semibold text-[var(--accent)]"
                >
                  {w.cta}
                  <ArrowRight
                    size={14}
                    className="transition-transform duration-[var(--dur)] ease-[var(--ease-out)] group-hover:translate-x-1"
                  />
                </Link>
              </Card>
            </RevealItem>
          ))}
        </Reveal>
      </section>

      <section className="shell pb-20">
        <div className="relative overflow-hidden rounded-[28px] border border-line px-6 py-14 text-center sm:px-14">
          <div
            aria-hidden
            className="absolute inset-0 -z-10 bg-[radial-gradient(70%_120%_at_50%_0%,color-mix(in_oklab,var(--accent)_22%,transparent),transparent_70%)]"
          />
          <div aria-hidden className="absolute inset-0 -z-10 turf-bg opacity-60" />
          <h2 className="display mx-auto max-w-2xl text-[clamp(1.8rem,4.6vw,3rem)]">
            Running a tournament? <span className="text-gradient">Put it on Smidig.</span>
          </h2>
          <p className="mx-auto mt-4 max-w-md text-[14.5px] text-fg-muted">
            Entries, tickets, sponsors and stalls collected in one checkout. You
            keep the revenue minus one transparent fee.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Button href="/host" variant="primary">
              How hosting works <ArrowRight size={15} />
            </Button>
            <Button href="/dashboard" variant="secondary">
              Open organizer dashboard
            </Button>
          </div>
        </div>
      </section>
    </>
  );
}
