"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "motion/react";
import { Plus, Trash2 } from "lucide-react";
import { PageTitle } from "@/components/layouts/console-shell";
import { Badge, Button, Card, Progress, Table, Tbody, Td, Th, Tr } from "@/components/kit";
import { useToast } from "@/components/kit/toast";
import { TOURNAMENTS, type Tournament } from "@/lib/data";
import { DRAFTS_EVENT, clearDrafts, readDrafts, type DraftTournament } from "@/lib/drafts";
import { formatMoney } from "@/lib/money";
import { bannerById } from "@/lib/presets";
import { cx } from "@/lib/cx";
import { formatDay } from "@/lib/dates";

const LABEL = {
  draft: ["neutral", "Draft"],
  registration_open: ["open", "Entries open"],
  registration_closed: ["closed", "Entries closed"],
  ongoing: ["live", "Ongoing"],
  completed: ["completed", "Completed"],
} as const;

/** A tournament published in this browser, shaped like the fixtures. */
function fromDraft(d: DraftTournament): Tournament & { local: true } {
  return {
    id: d.id,
    slug: d.slug,
    name: d.name,
    sport: d.sport,
    organizer: "You",
    city: d.city,
    venue: d.venue,
    start: d.start,
    end: d.end,
    status: "registration_open",
    format: d.format,
    matchType: d.matchType,
    ballType: d.ballType,
    entryFee: d.entryFee,
    teamsJoined: 0,
    maxTeams: d.maxTeams,
    prize: 0,
    banner: bannerById(d.bannerId).className,
    blurb: "",
    local: true,
  };
}

export function TournamentsList() {
  const [drafts, setDrafts] = useState<DraftTournament[]>([]);
  const toast = useToast();

  // Read after mount: localStorage does not exist during prerender, and
  // reading it in render would make server and client markup disagree.
  useEffect(() => {
    const load = () => setDrafts(readDrafts());
    load();
    window.addEventListener(DRAFTS_EVENT, load);
    window.addEventListener("storage", load);
    return () => {
      window.removeEventListener(DRAFTS_EVENT, load);
      window.removeEventListener("storage", load);
    };
  }, []);

  const rows = [...drafts.map(fromDraft), ...TOURNAMENTS];

  return (
    <>
      <PageTitle
        title="Tournaments"
        sub="Everything you have created on Smidig, across every sport."
        badge={drafts.length ? `${drafts.length} new` : undefined}
        action={
          <div className="flex gap-2">
            {drafts.length ? (
              <Button
                variant="ghost"
                size="sm"
                data-testid="clear-drafts"
                onClick={() => {
                  clearDrafts();
                  toast({ title: "Local tournaments cleared", tone: "warn" });
                }}
              >
                <Trash2 size={14} /> Clear mine
              </Button>
            ) : null}
            <Button href="/dashboard/tournaments/new" variant="primary" size="sm">
              <Plus size={14} /> New tournament
            </Button>
          </div>
        }
      />

      <Card className="overflow-hidden">
        <Table>
          <thead>
            <tr>
              <Th>Tournament</Th>
              <Th>Status</Th>
              <Th>Dates</Th>
              <Th align="right">Entries</Th>
              <Th align="right">Entry fee</Th>
              <Th align="right" />
            </tr>
          </thead>
          <Tbody>
            {rows.map((t) => {
              const local = "local" in t;
              const [tone, label] = LABEL[t.status];
              return (
                <Tr key={t.id}>
                  <Td>
                    <span className="block font-medium transition-transform duration-[var(--dur)] ease-[var(--ease-out)] group-hover:translate-x-0.5">
                      {t.name}
                      {local ? (
                        <motion.span
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ type: "spring", stiffness: 380, damping: 26 }}
                          className="ml-2 inline-flex"
                        >
                          <Badge tone="open">Just created</Badge>
                        </motion.span>
                      ) : null}
                    </span>
                    <span className="block text-[11.5px] text-fg-subtle">
                      {[t.city, t.format, t.matchType].filter(Boolean).join(" · ")}
                    </span>
                  </Td>
                  <Td>
                    <Badge tone={tone} pulse={t.status === "ongoing"}>
                      {label}
                    </Badge>
                  </Td>
                  <Td className="text-fg-muted">
                    {formatDay(t.start)} – {formatDay(t.end)}
                  </Td>
                  <Td align="right">
                    <span className="inline-flex w-24 flex-col items-end gap-1.5">
                      <span className="font-mono text-[12px]">
                        {t.teamsJoined}/{t.maxTeams}
                      </span>
                      <Progress value={t.teamsJoined} max={t.maxTeams} />
                    </span>
                  </Td>
                  <Td align="right" className="font-mono">
                    {t.entryFee === 0
                      ? "Free"
                      : formatMoney({ amount: t.entryFee, currency: "INR" })}
                  </Td>
                  <Td align="right">
                    {local ? (
                      <span className="text-[12px] text-fg-subtle" title="Stored in this browser only">
                        local
                      </span>
                    ) : (
                      <Link
                        href={`/t/${t.slug}`}
                        className="text-[12.5px] font-semibold text-[var(--accent)]"
                      >
                        View →
                      </Link>
                    )}
                  </Td>
                </Tr>
              );
            })}
          </Tbody>
        </Table>

        {drafts.length ? (
          <p className={cx("border-t border-line px-4 py-3 text-[11.5px] text-fg-subtle")}>
            Tournaments you create are kept in this browser only, so they survive
            a refresh but not a different device. The real build saves them to the
            database.
          </p>
        ) : null}
      </Card>
    </>
  );
}

