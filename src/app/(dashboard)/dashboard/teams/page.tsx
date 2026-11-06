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
import { PENDING_TEAMS, TEAMS } from "@/lib/data";

export const metadata = { title: "Teams" };

export default function Page() {
  return (
    <>
      <PageTitle
        title="Teams"
        sub="Approve entries, check squads and see who has paid."
        badge={`${PENDING_TEAMS.length} waiting`}
      />

      <Card className="mb-5 overflow-hidden">
        <div className="flex items-center justify-between border-b border-line px-5 py-3.5">
          <h2 className="text-[14px] font-semibold">Awaiting approval</h2>
          <Badge tone="open">{PENDING_TEAMS.length}</Badge>
        </div>
        <Table>
          <thead>
            <tr>
              <Th>Team</Th>
              <Th>Captain</Th>
              <Th align="right">Squad</Th>
              <Th>Payment</Th>
              <Th>Submitted</Th>
              <Th align="right">Action</Th>
            </tr>
          </thead>
          <Tbody>
            {PENDING_TEAMS.map((p) => (
              <Tr key={p.id}>
                <Td className="font-medium">{p.team}</Td>
                <Td className="text-fg-muted">{p.captain}</Td>
                <Td align="right" className="font-mono">
                  {p.squad}
                </Td>
                <Td>
                  {p.paid ? <Badge tone="open">Paid</Badge> : <Badge tone="closed">Unpaid</Badge>}
                </Td>
                <Td className="text-fg-subtle">{p.submitted}</Td>
                <Td align="right">
                  <span className="inline-flex gap-2">
                    <ActionButton
                      size="sm"
                      variant="primary"
                      disabled={!p.paid}
                      title={`${p.team} approved`}
                      body="They are in the draw and the captain has been emailed."
                    >
                      Approve
                    </ActionButton>
                    <ActionButton
                      size="sm"
                      variant="danger"
                      tone="warn"
                      title={`${p.team} rejected`}
                      body="Entry fee refunded in full, automatically."
                    >
                      Reject
                    </ActionButton>
                  </span>
                </Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
      </Card>

      <Card className="overflow-hidden">
        <div className="border-b border-line px-5 py-3.5">
          <h2 className="text-[14px] font-semibold">Confirmed teams</h2>
        </div>
        <Table>
          <thead>
            <tr>
              <Th>Team</Th>
              <Th>City</Th>
              <Th align="right">P</Th>
              <Th align="right">W</Th>
              <Th align="right">Pts</Th>
            </tr>
          </thead>
          <Tbody>
            {TEAMS.map((t) => (
              <Tr key={t.id}>
                <Td>
                  <span className="flex items-center gap-2.5">
                    <TeamBadge short={t.short} colour={t.colour} size={26} />
                    <span className="font-medium">{t.name}</span>
                  </span>
                </Td>
                <Td className="text-fg-muted">{t.city}</Td>
                <Td align="right" className="font-mono text-fg-muted">{t.played}</Td>
                <Td align="right" className="font-mono text-fg-muted">{t.won}</Td>
                <Td align="right" className="font-mono font-semibold">{t.pts}</Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
      </Card>
    </>
  );
}
