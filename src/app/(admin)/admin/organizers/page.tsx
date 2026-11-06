import { PageTitle } from "@/components/layouts/console-shell";
import {
  Badge,
  Button,
  Card,
  Table,
  Tbody,
  Td,
  Th,
  Tr,
} from "@/components/kit";
import { ActionButton } from "@/components/kit/action-button";
import { ORGANIZERS } from "@/lib/data";
import { formatMoney } from "@/lib/money";

export const metadata = { title: "Organizers" };

export default function Page() {
  const pending = ORGANIZERS.filter((o) => o.status === "pending");
  return (
    <>
      <PageTitle
        title="Organizers"
        sub="Approve who can list on the marketplace and take payments."
        badge={`${pending.length} pending`}
      />

      <Card className="overflow-hidden">
        <Table>
          <thead>
            <tr>
              <Th>Organization</Th>
              <Th>City</Th>
              <Th align="right">Tournaments</Th>
              <Th align="right">GMV</Th>
              <Th>Payouts</Th>
              <Th>Status</Th>
              <Th align="right">Action</Th>
            </tr>
          </thead>
          <Tbody>
            {ORGANIZERS.map((o) => (
              <Tr key={o.id}>
                <Td className="font-medium">{o.name}</Td>
                <Td className="text-fg-muted">{o.city}</Td>
                <Td align="right" className="font-mono">{o.tournaments}</Td>
                <Td align="right" className="font-mono">
                  {o.gmv ? formatMoney({ amount: o.gmv, currency: "INR" }, { compact: true }) : "—"}
                </Td>
                <Td>
                  <Badge tone={o.payouts === "connected" ? "open" : "closed"}>{o.payouts}</Badge>
                </Td>
                <Td>
                  <Badge tone={o.status === "approved" ? "open" : "closed"}>{o.status}</Badge>
                </Td>
                <Td align="right">
                  {o.status === "pending" ? (
                    <span className="inline-flex gap-2">
                      <ActionButton
                        size="sm"
                        variant="primary"
                        title={`${o.name} approved`}
                        body="They can publish tournaments and take payments."
                      >
                        Approve
                      </ActionButton>
                      <ActionButton
                        size="sm"
                        variant="danger"
                        tone="warn"
                        title={`${o.name} rejected`}
                        body="They have been emailed the reason."
                      >
                        Reject
                      </ActionButton>
                    </span>
                  ) : (
                    <ActionButton size="sm" variant="ghost" tone="warn" title={`${o.name} suspended`} body="Their tournaments stop selling immediately.">
                      Suspend
                    </ActionButton>
                  )}
                </Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
      </Card>
    </>
  );
}
