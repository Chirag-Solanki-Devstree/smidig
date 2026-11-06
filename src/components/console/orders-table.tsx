"use client";

import { useMemo, useState } from "react";
import { Search, X } from "lucide-react";
import { ActionButton } from "@/components/kit/action-button";
import { Badge, Card, EmptyState, Table, Tbody, Td, Th, Tr } from "@/components/kit";
import { ORDERS, type Order } from "@/lib/data";
import { formatMoney } from "@/lib/money";
import { cx } from "@/lib/cx";

const KIND: Record<Order["kind"], [string, string]> = {
  entry: ["open", "Entry"],
  ticket: ["info", "Ticket"],
  sponsor: ["featured", "Sponsor"],
  stall: ["neutral", "Stall"],
  stream: ["neutral", "Stream"],
};

const FLOWS = ["All flows", "entry", "ticket", "sponsor", "stall"] as const;
const STATUSES = ["All statuses", "paid", "refunded", "pending"] as const;

/**
 * Shared by the organizer and admin order screens. `admin` turns on the
 * refund column; the organizer view is read-only.
 */
export function OrdersTable({ admin = false }: { admin?: boolean }) {
  const [q, setQ] = useState("");
  const [flow, setFlow] = useState<string>(FLOWS[0]);
  const [status, setStatus] = useState<string>(STATUSES[0]);

  const rows = useMemo(
    () =>
      ORDERS.filter((o) => {
        if (flow !== FLOWS[0] && o.kind !== flow) return false;
        if (status !== STATUSES[0] && o.status !== status) return false;
        if (!q.trim()) return true;
        const hay = `${o.id} ${o.buyer} ${o.item} ${o.kind}`.toLowerCase();
        return hay.includes(q.trim().toLowerCase());
      }),
    [q, flow, status],
  );

  return (
    <Card className="overflow-hidden">
      <div className="flex flex-wrap items-center gap-2 border-b border-line px-4 py-3">
        <span className="flex h-9 min-w-0 flex-1 items-center gap-2 rounded-lg border border-line bg-surface px-3 transition-colors duration-[var(--dur)] focus-within:border-[var(--accent)]">
          <Search size={14} className="shrink-0 text-fg-subtle" />
          <input
            data-testid="order-search"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder={admin ? "SMD-10482, buyer email, or pi_…" : "Search order id, buyer or item"}
            className="w-full bg-transparent text-[13px] outline-none placeholder:text-fg-subtle"
          />
          {q ? (
            <button onClick={() => setQ("")} aria-label="Clear search" className="text-fg-subtle hover:text-fg">
              <X size={14} />
            </button>
          ) : null}
        </span>

        <select
          data-testid="order-flow"
          value={flow}
          onChange={(e) => setFlow(e.target.value)}
          className="h-9 rounded-lg border border-line bg-surface px-2.5 text-[12.5px] text-fg-muted outline-none focus:border-[var(--accent)]"
        >
          {FLOWS.map((f) => (
            <option key={f} value={f}>{f === "All flows" ? f : `${f[0].toUpperCase()}${f.slice(1)}`}</option>
          ))}
        </select>

        <select
          data-testid="order-status"
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="h-9 rounded-lg border border-line bg-surface px-2.5 text-[12.5px] text-fg-muted outline-none focus:border-[var(--accent)]"
        >
          {STATUSES.map((s) => (
            <option key={s} value={s}>{s === "All statuses" ? s : `${s[0].toUpperCase()}${s.slice(1)}`}</option>
          ))}
        </select>
      </div>

      {rows.length ? (
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
              {admin ? <Th align="right">Action</Th> : null}
            </tr>
          </thead>
          <Tbody>
            {rows.map((o) => {
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
                  <Td align="right" className={cx("font-mono", admin ? "text-[var(--accent)]" : "text-fg-subtle")}>
                    {formatMoney({ amount: o.fee, currency: "INR" })}
                  </Td>
                  <Td align="right">
                    <Badge tone={o.status === "paid" ? "open" : o.status === "refunded" ? "closed" : "neutral"}>
                      {o.status}
                    </Badge>
                  </Td>
                  {admin ? (
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
                  ) : null}
                </Tr>
              );
            })}
          </Tbody>
        </Table>
      ) : (
        <div className="p-6">
          <EmptyState
            icon={<Search size={18} />}
            title="No orders match"
            body="Try a different search, or widen the flow and status filters."
          />
        </div>
      )}

      <p className="border-t border-line px-4 py-2.5 text-[11.5px] text-fg-subtle" data-testid="order-count">
        Showing {rows.length} of {ORDERS.length} orders
      </p>
    </Card>
  );
}
