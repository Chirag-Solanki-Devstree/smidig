import { PageTitle } from "@/components/layouts/console-shell";
import { Rise, RiseStagger } from "@/components/fx/reveal-on-scroll";
import {
  Badge,
  Button,
  Card,
  Progress,
  StatCard,
  Table,
  Tbody,
  Td,
  TeamBadge,
  Th,
  Tr,
} from "@/components/kit";
import { ActionButton } from "@/components/kit/action-button";
import { MATCHES, TICKET_TYPES, teamByShort, SPARKS } from "@/lib/data";
import { formatMoney, splitFee } from "@/lib/money";

export const metadata = { title: "Tickets" };

export default function Page() {
  return (
    <>
      <PageTitle
        title="Tickets"
        sub="Set types and capacity per match. Free tickets carry no Smidig fee."
        action={
          <ActionButton variant="primary" size="sm" title="New ticket type" body="Name it, price it, cap it — applies to every match.">
            New ticket type
          </ActionButton>
        }
      />

      <RiseStagger className="mb-5 grid gap-3 sm:grid-cols-3">
        <StatCard label="Tickets sold" value="418" sub="across 2 live matches" />
        <StatCard label="Ticket revenue" value={formatMoney({ amount: 486000, currency: "INR" }, { compact: true })} />
        <StatCard label="Scanned at gate" value="286" sub="68% of sold" spark={[...SPARKS.scanned]} />
      </RiseStagger>

      <Card className="mb-5 overflow-hidden">
        <div className="border-b border-line px-5 py-3.5">
          <h2 className="text-[14px] font-semibold">Ticket types · Match 14</h2>
        </div>
        <Table>
          <thead>
            <tr>
              <Th>Type</Th>
              <Th align="right">Price</Th>
              <Th align="right">Buyer pays</Th>
              <Th align="right">You receive</Th>
              <Th align="right">Sold</Th>
              <Th>Capacity</Th>
            </tr>
          </thead>
          <Tbody>
            {TICKET_TYPES.map((t) => {
              const f = splitFee(t.price, { bps: 500, fixed: 500, paidBy: "buyer" });
              return (
                <Tr key={t.id}>
                  <Td className="font-medium">{t.name}</Td>
                  <Td align="right" className="font-mono">
                    {t.price === 0 ? "Free" : formatMoney({ amount: t.price, currency: "INR" })}
                  </Td>
                  <Td align="right" className="font-mono text-fg-muted">
                    {t.price === 0 ? "Free" : formatMoney({ amount: f.buyerPays, currency: "INR" })}
                  </Td>
                  <Td align="right" className="font-mono">
                    {t.price === 0 ? "—" : formatMoney({ amount: f.organizerGets, currency: "INR" })}
                  </Td>
                  <Td align="right" className="font-mono font-semibold">{t.sold}</Td>
                  <Td>
                    <span className="inline-flex w-28 flex-col gap-1.5">
                      <span className="font-mono text-[11.5px] text-fg-subtle">
                        {t.sold}/{t.capacity}
                      </span>
                      <Progress value={t.sold} max={t.capacity} tone="info" />
                    </span>
                  </Td>
                </Tr>
              );
            })}
          </Tbody>
        </Table>
      </Card>

      <Card className="overflow-hidden">
        <div className="border-b border-line px-5 py-3.5">
          <h2 className="text-[14px] font-semibold">Sales by match</h2>
        </div>
        <Table>
          <thead>
            <tr>
              <Th>Match</Th>
              <Th>Fixture</Th>
              <Th align="right">Sold</Th>
              <Th>Capacity</Th>
              <Th align="right">Status</Th>
            </tr>
          </thead>
          <Tbody>
            {MATCHES.map((m) => {
              const A = teamByShort(m.teamA);
              const B = teamByShort(m.teamB);
              return (
                <Tr key={m.id}>
                  <Td className="font-mono text-[12px] text-fg-subtle">#{m.no}</Td>
                  <Td>
                    <span className="flex items-center gap-2">
                      <TeamBadge short={A.short} colour={A.colour} size={22} />
                      <span className="text-fg-subtle">v</span>
                      <TeamBadge short={B.short} colour={B.colour} size={22} />
                    </span>
                  </Td>
                  <Td align="right" className="font-mono">{m.ticketsSold ?? 0}</Td>
                  <Td>
                    <span className="inline-flex w-28 flex-col gap-1.5">
                      <span className="font-mono text-[11.5px] text-fg-subtle">
                        {m.ticketsSold ?? 0}/{m.capacity ?? 0}
                      </span>
                      <Progress value={m.ticketsSold ?? 0} max={m.capacity ?? 1} tone="info" />
                    </span>
                  </Td>
                  <Td align="right">
                    <Badge tone={m.status === "live" ? "live" : m.status === "upcoming" ? "open" : "completed"}>
                      {m.status === "live" ? "On sale" : m.status === "upcoming" ? "On sale" : "Closed"}
                    </Badge>
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
