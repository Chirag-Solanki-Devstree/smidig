"use client";

import Link from "next/link";
import { MapPin, Radio, Ticket } from "lucide-react";
import { Badge, Button, TeamBadge } from "@/components/kit";
import { teamByShort, type Match } from "@/lib/data";
import { formatMoney } from "@/lib/money";
import { cx } from "@/lib/cx";

export function MatchCard({ m, compact }: { m: Match; compact?: boolean }) {
  const A = teamByShort(m.teamA);
  const B = teamByShort(m.teamB);
  const live = m.status === "live";

  return (
    <div
      className={cx(
        "group relative overflow-hidden rounded-2xl border border-line bg-[color-mix(in_oklab,var(--bg-elev)_82%,transparent)]",
        "transition-[transform,border-color,box-shadow] duration-[var(--dur)] ease-[var(--ease-out)]",
        "hover:-translate-y-1 hover:border-line-strong hover:shadow-[0_22px_56px_-30px_var(--glow)]",
      )}
    >
      {live ? (
        <span className="absolute inset-x-0 top-0 h-[2px] bg-[linear-gradient(90deg,transparent,var(--live),transparent)]" />
      ) : null}

      <div className="flex items-center gap-2 border-b border-line px-4 py-2.5">
        {live ? (
          <Badge tone="live" pulse>
            Live
          </Badge>
        ) : m.status === "upcoming" ? (
          <Badge tone="upcoming">{fmtTime(m.startsAt)}</Badge>
        ) : (
          <Badge tone="completed">Result</Badge>
        )}
        <span className="truncate text-[12px] text-fg-muted">
          Match {m.no} · {m.stage}
        </span>
        {m.streamUrl ? (
          <span className="ml-auto inline-flex items-center gap-1 text-[11px] text-[var(--live)]">
            <Radio size={12} /> Stream
          </span>
        ) : null}
      </div>

      <div className="space-y-2.5 px-4 py-4">
        <Side team={A} innings={m.a} dim={m.status === "completed" && !!m.result && !m.result.startsWith(A.name)} />
        <Side team={B} innings={m.b} dim={m.status === "completed" && !!m.result && !m.result.startsWith(B.name)} />
      </div>

      <div className="flex flex-wrap items-center gap-2 border-t border-line px-4 py-3">
        <p className="min-w-0 flex-1 truncate text-[12px] text-fg-muted">
          {m.result ?? m.target ?? (
            <span className="inline-flex items-center gap-1.5">
              <MapPin size={11} /> {m.venue}
            </span>
          )}
        </p>
        {!compact ? (
          <div className="flex gap-2">
            {live ? (
              <Button
                size="sm"
                variant="primary"
                href={`/t/${m.tournamentSlug}/m/${m.no}`}
              >
                Watch live
              </Button>
            ) : m.status === "upcoming" ? (
              <Button size="sm" variant="secondary" href={`/t/${m.tournamentSlug}/m/${m.no}`}>
                <Ticket size={13} />
                {m.ticketsFrom === 0
                  ? "Free ticket"
                  : `From ${formatMoney({ amount: m.ticketsFrom ?? 0, currency: "INR" })}`}
              </Button>
            ) : (
              <Button size="sm" variant="ghost" href={`/t/${m.tournamentSlug}/m/${m.no}`}>
                Scorecard
              </Button>
            )}
          </div>
        ) : (
          <Link
            href={`/t/${m.tournamentSlug}/m/${m.no}`}
            className="text-[12px] font-semibold text-[var(--accent)]"
          >
            Open →
          </Link>
        )}
      </div>
    </div>
  );
}

function Side({
  team,
  innings,
  dim,
}: {
  team: ReturnType<typeof teamByShort>;
  innings?: { runs: number; wickets: number; overs: string };
  dim?: boolean;
}) {
  return (
    <div className={cx("flex items-center gap-3", dim && "opacity-55")}>
      <TeamBadge short={team.short} colour={team.colour} size={32} />
      <span className="min-w-0 flex-1 truncate text-[13.5px] font-medium">{team.name}</span>
      {innings ? (
        <span className="font-mono text-[15px] font-semibold tabular-nums">
          {innings.runs}
          <span className="text-fg-subtle">/{innings.wickets}</span>
          <span className="ml-1.5 text-[11px] font-normal text-fg-subtle">({innings.overs})</span>
        </span>
      ) : (
        <span className="font-mono text-[12px] text-fg-subtle">—</span>
      )}
    </div>
  );
}

function fmtTime(iso: string) {
  const d = new Date(iso);
  return d.toLocaleDateString("en-GB", { day: "numeric", month: "short" }) +
    " · " +
    d.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });
}
