import { Download } from "lucide-react";
import { PageTitle } from "@/components/layouts/console-shell";
import { StatCard } from "@/components/kit";
import { OrdersTable } from "@/components/console/orders-table";
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

      <OrdersTable />
    </>
  );
}
