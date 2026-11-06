"use client";

import Link from "next/link";
import { motion } from "motion/react";
import {
  AlertTriangle,
  Banknote,
  Handshake,
  Radio,
  Store,
  Ticket,
  TrendingUp,
  Users,
} from "lucide-react";
import { PageTitle } from "@/components/layouts/console-shell";
import { RevenueChart } from "@/components/console/revenue-chart";
import { Badge, Button, Card, Progress, StatCard, TeamBadge } from "@/components/kit";
import { MATCHES, ORDERS, PENDING_TEAMS, SPARKS, teamByShort } from "@/lib/data";
import { Rise, RiseStagger } from "@/components/fx/reveal-on-scroll";
import { formatMoney } from "@/lib/money";

const gross = ORDERS.filter((o) => o.status === "paid").reduce((s, o) => s + o.subtotal, 0);
const fees = ORDERS.filter((o) => o.status === "paid").reduce((s, o) => s + o.fee, 0);

const TODO = [
  { icon: Users, text: "3 teams waiting for approval", href: "/dashboard/teams", tone: "open" as const },
  { icon: Radio, text: "Match 16 has no scorer assigned", href: "/dashboard/fixtures", tone: "closed" as const },
  { icon: Handshake, text: "2 sponsor logos need review", href: "/dashboard/sponsors", tone: "open" as const },
  { icon: Banknote, text: "Payouts connected — next on 12 Nov", href: "/dashboard/payouts", tone: "neutral" as const },
];

export function DashboardOverview() {
  const today = MATCHES.filter((m) => m.status !== "completed").slice(0, 3);

  return (
    <>
      <PageTitle
        title="Overview"
        sub="Everything happening in Deccan Premier League 2026, and where the money is."
        action={
          <Button href="/dashboard/tournaments/new" variant="primary" size="sm">
            New tournament
          </Button>
        }
      />

      <RiseStagger className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Gross revenue"
          value={formatMoney({ amount: gross, currency: "INR" }, { compact: true })}
          trend={{ dir: "up", text: "18% vs last week" }}
          icon={<TrendingUp size={15} />}
          spark={[...SPARKS.revenue]}
        />
        <StatCard
          label="Smidig fees"
          value={formatMoney({ amount: fees, currency: "INR" }, { compact: true })}
          sub="5% on paid flows"
          icon={<Banknote size={15} />}
          spark={[...SPARKS.fees]}
        />
        <StatCard
          label="Net payout"
          value={formatMoney({ amount: gross - fees, currency: "INR" }, { compact: true })}
          sub="Next payout 12 Nov"
          spark={[...SPARKS.payout]}
        />
        <StatCard label="Teams registered" value="8/8" sub="Draw is full" icon={<Users size={15} />} spark={[...SPARKS.teams]} />
      </RiseStagger>

      <RiseStagger className="mt-3 grid gap-3 sm:grid-cols-3">
        <StatCard label="Tickets sold" value="418" countTo={418} sub="of 600 capacity" icon={<Ticket size={15} />} spark={[...SPARKS.tickets]} />
        <StatCard label="Sponsors active" value="7" countTo={7} sub="1 Title · 3 Gold · 3 Silver" icon={<Handshake size={15} />} spark={[...SPARKS.sponsors]} />
        <StatCard label="Stalls booked" value="5/12" countTo={5} countSuffix="/12" sub="2 held in checkout" icon={<Store size={15} />} spark={[...SPARKS.stalls]} />
      </RiseStagger>

      <RiseStagger className="mt-5 grid gap-4 lg:grid-cols-[1.5fr_1fr]">
        <Card className="p-5">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="text-[14px] font-semibold">Revenue by flow</h2>
              <p className="mt-0.5 text-[12px] text-fg-subtle">Last 7 days, stacked</p>
            </div>
            <Badge tone="info">All flows</Badge>
          </div>
          <RevenueChart />
        </Card>

        <Card className="p-5">
          <h2 className="text-[14px] font-semibold">Needs you</h2>
          <ul className="mt-4 space-y-2">
            {TODO.map((t, i) => (
              <motion.li
                key={t.text}
                initial={{ opacity: 0, x: 14 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 + i * 0.06, duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
              >
                <Link
                  href={t.href}
                  className="group flex items-center gap-3 rounded-xl border border-line bg-surface px-3.5 py-3 transition-[border-color,transform] duration-[var(--dur)] ease-[var(--ease-out)] hover:-translate-y-0.5 hover:border-line-strong"
                >
                  <t.icon size={15} className="shrink-0 text-[var(--accent)]" />
                  <span className="min-w-0 flex-1 text-[13px]">{t.text}</span>
                  <span className="text-fg-subtle transition-transform duration-[var(--dur)] ease-[var(--ease-out)] group-hover:translate-x-1">
                    →
                  </span>
                </Link>
              </motion.li>
            ))}
          </ul>
        </Card>
      </RiseStagger>

      <RiseStagger className="mt-5 grid gap-4 lg:grid-cols-2">
        <Card className="overflow-hidden">
          <div className="flex items-center justify-between border-b border-line px-5 py-3.5">
            <h2 className="text-[14px] font-semibold">Today</h2>
            <Button href="/dashboard/fixtures" variant="ghost" size="sm">
              All fixtures
            </Button>
          </div>
          <ul className="divide-y divide-[color:var(--border)]">
            {today.map((m) => {
              const A = teamByShort(m.teamA);
              const B = teamByShort(m.teamB);
              return (
                <li key={m.id} className="flex items-center gap-3 px-5 py-3.5 transition-colors duration-[var(--dur)] hover:bg-surface">
                  <span className="flex shrink-0 -space-x-2">
                    <TeamBadge short={A.short} colour={A.colour} size={28} />
                    <TeamBadge short={B.short} colour={B.colour} size={28} />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-[13px] font-medium">
                      Match {m.no} · {m.stage}
                    </span>
                    <span className="block text-[11.5px] text-fg-subtle">
                      {m.ticketsSold}/{m.capacity} tickets · {m.streamUrl ? "stream linked" : "no stream"}
                    </span>
                  </span>
                  {m.status === "live" ? (
                    <Badge tone="live" pulse>Live</Badge>
                  ) : (
                    <Badge tone="upcoming">Soon</Badge>
                  )}
                </li>
              );
            })}
          </ul>
        </Card>

        <Card className="overflow-hidden">
          <div className="flex items-center justify-between border-b border-line px-5 py-3.5">
            <h2 className="text-[14px] font-semibold">Teams awaiting approval</h2>
            <Badge tone="open">{PENDING_TEAMS.length}</Badge>
          </div>
          <ul className="divide-y divide-[color:var(--border)]">
            {PENDING_TEAMS.map((p) => (
              <li key={p.id} className="flex items-center gap-3 px-5 py-3.5">
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-[13px] font-medium">{p.team}</span>
                  <span className="block text-[11.5px] text-fg-subtle">
                    {p.captain} · {p.squad} players · {p.submitted}
                  </span>
                </span>
                {p.paid ? (
                  <Badge tone="open">Paid</Badge>
                ) : (
                  <Badge tone="closed">
                    <AlertTriangle size={10} /> Unpaid
                  </Badge>
                )}
                <Button size="sm" variant={p.paid ? "primary" : "secondary"} disabled={!p.paid}>
                  Approve
                </Button>
              </li>
            ))}
          </ul>
        </Card>
      </RiseStagger>

      <Rise className="mt-5">
      <Card className="p-5">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-[14px] font-semibold">Ticket sales · Match 14</h2>
          <span className="font-mono text-[12px] text-fg-subtle">418 / 600</span>
        </div>
        <Progress value={418} max={600} tone="info" />
      </Card>
      </Rise>
    </>
  );
}
