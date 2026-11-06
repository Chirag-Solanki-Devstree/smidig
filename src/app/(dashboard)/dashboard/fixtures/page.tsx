import { CalendarRange, Radio, Wand2 } from "lucide-react";
import { PageTitle } from "@/components/layouts/console-shell";
import {
  Badge,
  Button,
  Card,
  Table,
  Tbody,
  Td,
  TeamBadge,
  Th,
  Tr,
} from "@/components/kit";
import { ActionButton } from "@/components/kit/action-button";
import { MATCHES, teamByShort } from "@/lib/data";

export const metadata = { title: "Fixtures" };

export default function Page() {
  return (
    <>
      <PageTitle
        title="Fixtures"
        sub="Generated from the format you chose. Drag to reschedule, assign a scorer and link a stream per match."
        badge="Groups + Knockout"
        action={
          <ActionButton
            variant="secondary"
            size="sm"
            tone="warn"
            title="Fixtures regenerated"
            body="18 matches rescheduled across 1 venue. Played matches kept."
          >
            <Wand2 size={14} /> Regenerate
          </ActionButton>
        }
      />

      <div className="mb-4 grid gap-3 sm:grid-cols-3">
        {[
          { k: "Matches scheduled", v: "18", s: "6 played · 2 live" },
          { k: "Venues in use", v: "1", s: "Wankhede Ground B" },
          { k: "Scorers assigned", v: "16/18", s: "2 still open" },
        ].map((x) => (
          <Card key={x.k} className="p-4">
            <p className="text-[12px] text-fg-muted">{x.k}</p>
            <p className="mt-1.5 font-mono text-xl font-semibold">{x.v}</p>
            <p className="mt-1 text-[11.5px] text-fg-subtle">{x.s}</p>
          </Card>
        ))}
      </div>

      <Card className="overflow-hidden">
        <div className="flex items-center gap-2 border-b border-line px-5 py-3.5">
          <CalendarRange size={15} className="text-[var(--accent)]" />
          <h2 className="text-[14px] font-semibold">Schedule</h2>
        </div>
        <Table>
          <thead>
            <tr>
              <Th>#</Th>
              <Th>Fixture</Th>
              <Th>Stage</Th>
              <Th>Start</Th>
              <Th>Scorer</Th>
              <Th>Stream</Th>
              <Th align="right">Status</Th>
            </tr>
          </thead>
          <Tbody>
            {MATCHES.map((m) => {
              const A = teamByShort(m.teamA);
              const B = teamByShort(m.teamB);
              return (
                <Tr key={m.id}>
                  <Td className="font-mono text-[12px] text-fg-subtle">{m.no}</Td>
                  <Td>
                    <span className="flex items-center gap-2">
                      <TeamBadge short={A.short} colour={A.colour} size={24} />
                      <span className="text-fg-subtle">v</span>
                      <TeamBadge short={B.short} colour={B.colour} size={24} />
                    </span>
                  </Td>
                  <Td className="text-fg-muted">{m.stage}</Td>
                  <Td className="font-mono text-[12px] text-fg-muted">
                    {new Date(m.startsAt).toLocaleString("en-GB", {
                      day: "numeric",
                      month: "short",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </Td>
                  <Td className="text-fg-muted">
                    {m.no === 16 ? (
                      <Badge tone="closed">Unassigned</Badge>
                    ) : (
                      "K. Menon"
                    )}
                  </Td>
                  <Td>
                    {m.streamUrl ? (
                      <span className="inline-flex items-center gap-1.5 text-[12px] text-[var(--live)]">
                        <Radio size={11} /> Linked
                      </span>
                    ) : (
                      <span className="text-[12px] text-fg-subtle">—</span>
                    )}
                  </Td>
                  <Td align="right">
                    {m.status === "live" ? (
                      <Badge tone="live" pulse>Live</Badge>
                    ) : m.status === "upcoming" ? (
                      <Badge tone="upcoming">Scheduled</Badge>
                    ) : (
                      <Badge tone="completed">Done</Badge>
                    )}
                  </Td>
                </Tr>
              );
            })}
          </Tbody>
        </Table>
      </Card>
    </>
  );
}
