import { Banknote, CheckCircle2, ExternalLink } from "lucide-react";
import { PageTitle } from "@/components/layouts/console-shell";
import {
  Badge,
  Button,
  Card,
  StatCard,
  Table,
  Tbody,
  Td,
  Th,
  Tr,
} from "@/components/kit";
import { ActionButton } from "@/components/kit/action-button";
import { formatMoney } from "@/lib/money";

export const metadata = { title: "Payouts" };

const PAYOUTS = [
  { id: "po_8812", date: "2026-11-01", gross: 2840000, fee: 142000, net: 2698000, status: "paid" },
  { id: "po_8740", date: "2026-10-25", gross: 1960000, fee: 98000, net: 1862000, status: "paid" },
  { id: "po_8669", date: "2026-10-18", gross: 1240000, fee: 62000, net: 1178000, status: "paid" },
  { id: "po_8901", date: "2026-11-12", gross: 3120000, fee: 156000, net: 2964000, status: "scheduled" },
];

export default function Page() {
  return (
    <>
      <PageTitle
        title="Payouts"
        sub="Smidig collects every payment, keeps its fee and sends you the rest on a weekly schedule."
      />

      <Card className="mb-5 flex flex-wrap items-center gap-4 p-5">
        <span className="grid h-11 w-11 place-items-center rounded-xl bg-[color-mix(in_oklab,var(--ok)_16%,transparent)] text-[var(--ok)]">
          <CheckCircle2 size={20} />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-[14px] font-semibold">Payouts connected</p>
          <p className="mt-0.5 text-[12.5px] text-fg-muted">
            Stripe Connect Express · account ending 4417 · next payout 12 Nov
          </p>
        </div>
        <ActionButton
          variant="secondary"
          size="sm"
          tone="info"
          title="Stripe Express login"
          body="Opens the organizer's Stripe dashboard in a new tab."
        >
          Open Stripe <ExternalLink size={13} />
        </ActionButton>
      </Card>

      <div className="mb-5 grid gap-3 sm:grid-cols-4">
        <StatCard label="Lifetime gross" value={formatMoney({ amount: 9160000, currency: "INR" }, { compact: true })} />
        <StatCard label="Fees kept by Smidig" value={formatMoney({ amount: 458000, currency: "INR" }, { compact: true })} />
        <StatCard label="Paid out" value={formatMoney({ amount: 5738000, currency: "INR" }, { compact: true })} />
        <StatCard
          label="In transit"
          value={formatMoney({ amount: 2964000, currency: "INR" }, { compact: true })}
          icon={<Banknote size={15} />}
        />
      </div>

      <Card className="overflow-hidden">
        <div className="border-b border-line px-5 py-3.5">
          <h2 className="text-[14px] font-semibold">Payout history</h2>
        </div>
        <Table>
          <thead>
            <tr>
              <Th>Payout</Th>
              <Th>Date</Th>
              <Th align="right">Gross</Th>
              <Th align="right">Smidig fee</Th>
              <Th align="right">Net</Th>
              <Th align="right">Status</Th>
            </tr>
          </thead>
          <Tbody>
            {PAYOUTS.map((p) => (
              <Tr key={p.id}>
                <Td className="font-mono text-[12px]">{p.id}</Td>
                <Td className="text-fg-muted">{p.date}</Td>
                <Td align="right" className="font-mono">{formatMoney({ amount: p.gross, currency: "INR" })}</Td>
                <Td align="right" className="font-mono text-fg-subtle">
                  −{formatMoney({ amount: p.fee, currency: "INR" })}
                </Td>
                <Td align="right" className="font-mono font-semibold">
                  {formatMoney({ amount: p.net, currency: "INR" })}
                </Td>
                <Td align="right">
                  <Badge tone={p.status === "paid" ? "open" : "info"}>{p.status}</Badge>
                </Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
      </Card>
    </>
  );
}
