"use client";

import Link from "next/link";
import { CalendarDays, MapPin, Trophy, Users } from "lucide-react";
import { Badge, Progress, TeamBadge } from "@/components/kit";
import { formatMoney } from "@/lib/money";
import { formatDayRange } from "@/lib/dates";
import { SPORT_BY_ID } from "@/lib/sports";
import type { Tournament } from "@/lib/data";
import { cx } from "@/lib/cx";

const STATUS: Record<Tournament["status"], { tone: Parameters<typeof Badge>[0]["tone"]; label: string }> = {
  draft: { tone: "neutral", label: "Draft" },
  registration_open: { tone: "open", label: "Registration open" },
  registration_closed: { tone: "closed", label: "Entries closed" },
  ongoing: { tone: "live", label: "Ongoing" },
  completed: { tone: "completed", label: "Completed" },
};

export function TournamentCard({ t }: { t: Tournament }) {
  const sport = SPORT_BY_ID[t.sport];
  const s = STATUS[t.status];
  const full = t.teamsJoined >= t.maxTeams;

  return (
    <Link
      href={`/t/${t.slug}`}
      // h-full matters: the card is a grid item's child, not the item itself,
      // so without it the card shrinks to its content and a tournament with no
      // prize pool ends up visibly shorter than its neighbours. With it, every
      // card fills its row and the mt-auto footer below lines up across them.
      className="group relative flex h-full flex-col overflow-hidden rounded-2xl border border-line bg-[color-mix(in_oklab,var(--bg-elev)_82%,transparent)] transition-[transform,border-color,box-shadow] duration-[var(--dur)] ease-[var(--ease-out)] hover:-translate-y-1 hover:border-line-strong hover:shadow-[0_24px_60px_-30px_var(--glow)]"
    >
      {/* banner */}
      {/* The card clips, so the banner can push past its own box on hover.
          Transform only, and only on this 128px strip — a scale on a large
          gradient layer forces a re-raster, which is why the page backdrop
          is left alone. */}
      <div
        className={cx(
          "relative h-32 origin-center transition-transform duration-[var(--dur-slow)] ease-[var(--ease-out)] group-hover:scale-[1.06]",
          t.banner,
        )}
      >
        <div className="absolute inset-0 turf-bg opacity-50" />
        <div className="absolute inset-0 bg-[linear-gradient(to_top,var(--bg-elev),transparent_70%)]" />
        <div className="absolute inset-x-3 top-3 flex items-start justify-between gap-2">
          <Badge tone={s.tone} pulse={t.status === "ongoing"}>
            {s.label}
          </Badge>
          {t.featured ? <Badge tone="featured">Featured</Badge> : null}
        </div>
        <span className="absolute bottom-3 left-3 inline-flex items-center gap-1.5 rounded-full border border-line bg-[color-mix(in_oklab,var(--bg)_70%,transparent)] px-2.5 py-1 text-[11px] font-medium text-fg-muted">
          <sport.icon size={12} />
          {sport.name}
          <span className="text-fg-subtle">·</span>
          {t.matchType}
        </span>
      </div>

      <div className="flex flex-1 flex-col p-4">
        <h3 className="text-[15px] font-semibold leading-snug tracking-tight transition-colors duration-[var(--dur)] group-hover:text-[var(--accent)]">
          {t.name}
        </h3>

        <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-[12px] text-fg-muted">
          <span className="inline-flex items-center gap-1.5">
            <MapPin size={12} /> {t.city}
          </span>
          <span className="inline-flex items-center gap-1.5">
            <CalendarDays size={12} /> {formatDayRange(t.start, t.end)}
          </span>
        </div>

        {t.prize > 0 ? (
          <p className="mt-2 inline-flex items-center gap-1.5 text-[12px] text-[var(--accent-2)]">
            <Trophy size={12} /> {formatMoney({ amount: t.prize, currency: "INR" }, { compact: true })} prize pool
          </p>
        ) : null}

        <div className="mt-auto pt-4">
          <div className="mb-1.5 flex items-center justify-between text-[11.5px]">
            <span className="inline-flex items-center gap-1.5 text-fg-muted">
              <Users size={12} />
              {t.teamsJoined}/{t.maxTeams} {sport.entrant.many.toLowerCase()}
            </span>
            <span className={cx("font-semibold", full ? "text-[var(--warn)]" : "text-fg")}>
              {t.entryFee === 0
                ? "Free entry"
                : `${formatMoney({ amount: t.entryFee, currency: "INR" }, { compact: true })} entry`}
            </span>
          </div>
          <Progress value={t.teamsJoined} max={t.maxTeams} tone={full ? "warn" : "accent"} />
        </div>
      </div>
    </Link>
  );
}


export { TeamBadge };
