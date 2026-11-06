import Link from "next/link";
import { Plus } from "lucide-react";
import { PageTitle } from "@/components/layouts/console-shell";
import {
  Badge,
  Button,
  Card,
  Progress,
  Table,
  Tbody,
  Td,
  Th,
  Tr,
} from "@/components/kit";
import { TOURNAMENTS } from "@/lib/data";
import { formatMoney } from "@/lib/money";

export const metadata = { title: "Tournaments" };

const LABEL = {
  draft: ["neutral", "Draft"],
  registration_open: ["open", "Entries open"],
  registration_closed: ["closed", "Entries closed"],
  ongoing: ["live", "Ongoing"],
  completed: ["completed", "Completed"],
} as const;

export default function Page() {
  return (
    <>
      <PageTitle
        title="Tournaments"
        sub="Everything you have created on Smidig, across every sport."
        action={
          <Button href="/dashboard/tournaments/new" variant="primary" size="sm">
            <Plus size={14} /> New tournament
          </Button>
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
            {TOURNAMENTS.map((t) => {
              const [tone, label] = LABEL[t.status];
              return (
                <Tr key={t.id}>
                  <Td>
                    <span className="block font-medium transition-transform duration-[var(--dur)] ease-[var(--ease-out)] group-hover:translate-x-0.5">
                      {t.name}
                    </span>
                    <span className="block text-[11.5px] text-fg-subtle">
                      {t.city} · {t.format} · {t.matchType}
                    </span>
                  </Td>
                  <Td>
                    <Badge tone={tone} pulse={t.status === "ongoing"}>
                      {label}
                    </Badge>
                  </Td>
                  <Td className="text-fg-muted">{fmt(t.start)} – {fmt(t.end)}</Td>
                  <Td align="right">
                    <span className="inline-flex w-24 flex-col items-end gap-1.5">
                      <span className="font-mono text-[12px]">
                        {t.teamsJoined}/{t.maxTeams}
                      </span>
                      <Progress value={t.teamsJoined} max={t.maxTeams} />
                    </span>
                  </Td>
                  <Td align="right" className="font-mono">
                    {t.entryFee === 0 ? "Free" : formatMoney({ amount: t.entryFee, currency: "INR" })}
                  </Td>
                  <Td align="right">
                    <Link
                      href={`/t/${t.slug}`}
                      className="text-[12.5px] font-semibold text-[var(--accent)]"
                    >
                      View →
                    </Link>
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

function fmt(d: string) {
  return new Date(d + "T00:00:00Z").toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    timeZone: "UTC",
  });
}
