import { Search } from "lucide-react";
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
import { ORDERS } from "@/lib/data";
import { formatMoney } from "@/lib/money";

export const metadata = { title: "Orders & refunds" };

export default function Page() {
  return (
    <>
      <PageTitle
        title="Orders & refunds"
        sub="Search any order across the platform by id, buyer or gateway reference."
      />
      <Card className="overflow-hidden">
        <div className="flex items-center gap-2 border-b border-line px-4 py-3">
          <span className="flex h-9 min-w-0 flex-1 items-center gap-2 rounded-lg border border-line bg-surface px-3">
            <Search size={14} className="text-fg-subtle" />
            <input
              placeholder="SMD-10482, buyer email, or pi_…"
              className="w-full bg-transparent text-[13px] outline-none placeholder:text-fg-subtle"
            />
          </span>
        </div>
        <Table>
          <thead>
            <tr>
              <Th>Order</Th>
              <Th>Date</Th>
              <Th>Buyer</Th>
              <Th>Flow</Th>
              <Th align="right">Amount</Th>
              <Th align="right">Fee</Th>
              <Th align="right">Status</Th>
              <Th align="right">Action</Th>
            </tr>
          </thead>
          <Tbody>
            {ORDERS.map((o) => (
              <Tr key={o.id}>
                <Td className="font-mono text-[12px]">{o.id}</Td>
                <Td className="text-fg-muted">{o.date}</Td>
                <Td className="font-medium">{o.buyer}</Td>
                <Td className="capitalize text-fg-muted">{o.kind}</Td>
                <Td align="right" className="font-mono">
                  {formatMoney({ amount: o.subtotal, currency: "INR" })}
                </Td>
                <Td align="right" className="font-mono text-[var(--accent)]">
                  {formatMoney({ amount: o.fee, currency: "INR" })}
                </Td>
                <Td align="right">
                  <Badge tone={o.status === "paid" ? "open" : "closed"}>{o.status}</Badge>
                </Td>
                <Td align="right">
                  <ActionButton
                    size="sm"
                    variant="ghost"
                    tone="warn"
                    disabled={o.status !== "paid"}
                    title={`Refunded ${o.id}`}
                    body="The Smidig fee on this order is returned too."
                  >
                    Refund
                  </ActionButton>
                </Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
      </Card>
    </>
  );
}
