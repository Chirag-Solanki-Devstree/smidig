"use client";

import { Trophy } from "lucide-react";
import {
  Badge,
  BallChip,
  Button,
  Card,
  EmptyState,
  OverStrip,
  Progress,
  SectionHeading,
  Skeleton,
  StatCard,
  TeamBadge,
} from "@/components/kit";
import { TournamentCard } from "@/components/cards/tournament-card";
import { MatchCard } from "@/components/cards/match-card";
import { MATCHES, TOURNAMENTS } from "@/lib/data";

/** Single source of truth for the UI, as the design-system task specifies. */
export function Styleguide() {
  return (
    <div className="shell pt-28 pb-20 sm:pt-32">
      <h1 className="display text-[clamp(1.9rem,4.4vw,2.9rem)]">Styleguide</h1>
      <p className="mt-2 max-w-xl text-[14px] text-fg-muted">
        Every shared component in one place. Toggle light/dark in the nav to
        check both themes.
      </p>

      <Block title="Colour tokens">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-6">
          {[
            ["bg", "var(--bg)"],
            ["bg-elev", "var(--bg-elev)"],
            ["accent", "var(--accent)"],
            ["accent-2", "var(--accent-2)"],
            ["live", "var(--live)"],
            ["info", "var(--info)"],
            ["six", "var(--six)"],
            ["warn", "var(--warn)"],
            ["ok", "var(--ok)"],
            ["fg", "var(--fg)"],
            ["fg-muted", "var(--fg-muted)"],
            ["border", "var(--border)"],
          ].map(([n, v]) => (
            <div key={n}>
              <span
                className="block h-14 rounded-xl border border-line"
                style={{ background: v }}
              />
              <span className="mt-1.5 block font-mono text-[11px] text-fg-subtle">{n}</span>
            </div>
          ))}
        </div>
      </Block>

      <Block title="Buttons">
        <div className="flex flex-wrap items-center gap-3">
          <Button variant="primary">Primary</Button>
          <Button variant="secondary">Secondary</Button>
          <Button variant="ghost">Ghost</Button>
          <Button variant="gold">Gold</Button>
          <Button variant="danger">Danger</Button>
          <Button variant="primary" disabled>Disabled</Button>
          <Button variant="secondary" size="sm">Small</Button>
        </div>
      </Block>

      <Block title="Badges">
        <div className="flex flex-wrap items-center gap-2">
          <Badge tone="live" pulse>Live</Badge>
          <Badge tone="open">Registration open</Badge>
          <Badge tone="closed">Sold out</Badge>
          <Badge tone="upcoming">Upcoming</Badge>
          <Badge tone="completed">Completed</Badge>
          <Badge tone="featured">Featured</Badge>
          <Badge tone="info">Info</Badge>
        </div>
      </Block>

      <Block title="Ball chips & over strip">
        <div className="flex flex-wrap items-center gap-2">
          {["0", "1", "2", "3", "4", "6", "W", "wd", "nb"].map((v) => (
            <BallChip key={v} v={v} size={34} />
          ))}
        </div>
        <div className="mt-4">
          <OverStrip balls={["1", "4", "W", "2", "6", "•"]} />
        </div>
      </Block>

      <Block title="Team badges">
        <div className="flex flex-wrap items-center gap-3">
          <TeamBadge short="MUM" colour="#c8ff2e" size={48} />
          <TeamBadge short="PUN" colour="#ff9f3d" size={42} />
          <TeamBadge short="DEL" colour="#4aa3ff" size={36} />
          <TeamBadge short="KOC" colour="#b06bff" size={30} />
        </div>
      </Block>

      <Block title="Stat cards">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard label="Gross revenue" value="₹48.2L" trend={{ dir: "up", text: "18% this week" }} />
          <StatCard label="Smidig fees" value="₹2.4L" sub="5% blended" />
          <StatCard label="Tickets sold" value="418" sub="of 600" icon={<Trophy size={15} />} />
          <StatCard label="Refunds" value="₹200" trend={{ dir: "down", text: "1 order" }} />
        </div>
      </Block>

      <Block title="Progress">
        <div className="max-w-sm space-y-4">
          <Progress value={8} max={8} />
          <Progress value={418} max={600} tone="info" />
          <Progress value={11} max={16} tone="warn" />
        </div>
      </Block>

      <Block title="Cards">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <TournamentCard t={TOURNAMENTS[0]} />
          <TournamentCard t={TOURNAMENTS[2]} />
          <MatchCard m={MATCHES[0]} />
        </div>
      </Block>

      <Block title="Loading & empty states">
        <div className="grid gap-4 lg:grid-cols-2">
          <Card className="space-y-3 p-5">
            <Skeleton className="h-4 w-1/3" />
            <Skeleton className="h-3 w-2/3" />
            <Skeleton className="h-28 w-full" />
            <div className="flex gap-2">
              <Skeleton className="h-8 w-24" />
              <Skeleton className="h-8 w-20" />
            </div>
          </Card>
          <EmptyState
            icon={<Trophy size={18} />}
            title="No tournaments in Ahmedabad yet"
            body="Be the first to host one — setup takes about ten minutes."
            action={<Button variant="primary" size="sm" href="/dashboard/tournaments/new">Host one</Button>}
          />
        </div>
      </Block>
    </div>
  );
}

function Block({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mt-12">
      <SectionHeading title={title} />
      {children}
    </section>
  );
}
