import { Download, Search } from "lucide-react";
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
import { ORDERS } from "@/lib/data";
import { formatMoney } from "@/lib/money";

export const metadata = { title: "Orders" };

const KIND: Record<string, [string, string]> = {
  entry: ["open", "Entry"],
  ticket: ["info", "Ticket"],
  sponsor: ["featured", "Sponsor"],
  stall: ["neutral", "Stall"],
  stream: ["neutral", "Stream"],
};

const paid = ORDERS.filter((o) => o.status === "paid");
const gross = paid.reduce((s, o) => s + o.subtotal, 0);
const fees = paid.reduce((s, o) => s + o.fee, 0);
const refunded = ORDERS.filter((o) => o.status === "refunded").reduce((s, o) => s + o.subtotal, 0);

export default function Page() {
  return (
    <>
      <PageTitle
        title="Orders"
        sub="Every payment across all five flows, with the Smidig fee shown per order."
        action={
          <ActionButton
            variant="secondary"
            size="sm"
            title="Export queued"
            body="8 orders will be emailed to you as CSV."
          >
            <Download size={14} /> Export CSV
          </ActionButton>
        }
      />

      <div className="mb-5 grid gap-3 sm:grid-cols-4">
        <StatCard label="Gross" value={formatMoney({ amount: gross, currency: "INR" }, { compact: true })} />
        <StatCard label="Smidig fees" value={formatMoney({ amount: fees, currency: "INR" }, { compact: true })} />
        <StatCard label="Refunded" value={formatMoney({ amount: refunded, currency: "INR" }, { compact: true })} />
        <StatCard
          label="Net to you"
          value={formatMoney({ amount: gross - fees, currency: "INR" }, { compact: true })}
        />
      </div>

      <Card className="overflow-hidden">
        <div className="flex flex-wrap items-center gap-2 border-b border-line px-4 py-3">
          <span className="flex h-9 min-w-0 flex-1 items-center gap-2 rounded-lg border border-line bg-surface px-3">
            <Search size={14} className="text-fg-subtle" />
            <input
              placeholder="Search order id, buyer or email"
              className="w-full bg-transparent text-[13px] outline-none placeholder:text-fg-subtle"
            />
          </span>
          {["All flows", "All statuses", "Last 30 days"].map((f) => (
            <span
              key={f}
              className="hidden rounded-lg border border-line bg-surface px-3 py-2 text-[12.5px] text-fg-muted sm:block"
            >
              {f}
            </span>
          ))}
        </div>
        <Table>
          <thead>
            <tr>
              <Th>Order</Th>
              <Th>Date</Th>
              <Th>Buyer</Th>
              <Th>Flow</Th>
              <Th>Item</Th>
              <Th align="right">Subtotal</Th>
              <Th align="right">Fee</Th>
              <Th align="right">Status</Th>
            </tr>
          </thead>
          <Tbody>
            {ORDERS.map((o) => {
              const [tone, label] = KIND[o.kind];
              return (
                <Tr key={o.id}>
                  <Td className="font-mono text-[12px]">{o.id}</Td>
                  <Td className="text-fg-muted">{o.date}</Td>
                  <Td className="font-medium">{o.buyer}</Td>
                  <Td>
                    <Badge tone={tone as "open"}>{label}</Badge>
                  </Td>
                  <Td className="max-w-[16rem] truncate text-fg-muted">{o.item}</Td>
                  <Td align="right" className="font-mono">
                    {formatMoney({ amount: o.subtotal, currency: "INR" })}
                  </Td>
                  <Td align="right" className="font-mono text-fg-subtle">
                    {formatMoney({ amount: o.fee, currency: "INR" })}
                  </Td>
                  <Td align="right">
                    <Badge tone={o.status === "paid" ? "open" : o.status === "refunded" ? "closed" : "neutral"}>
                      {o.status}
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
