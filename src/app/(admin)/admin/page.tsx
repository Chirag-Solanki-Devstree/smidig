import { Activity, Building2, Radio, TrendingUp } from "lucide-react";
import { PageTitle } from "@/components/layouts/console-shell";
import { RevenueChart } from "@/components/console/revenue-chart";
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
import { ORDERS, ORGANIZERS, SPARKS } from "@/lib/data";
import { Rise, RiseStagger } from "@/components/fx/reveal-on-scroll";
import { formatMoney } from "@/lib/money";

export const metadata = { title: "Platform admin" };

const gmv = ORGANIZERS.reduce((s, o) => s + o.gmv, 0);
const feeRevenue = Math.round(gmv * 0.05);

export default function Page() {
  return (
    <>
      <PageTitle
        title="Platform overview"
        sub="Every tournament, every payment, and the fee Smidig keeps on each one."
        badge="All sports"
      />

      <RiseStagger className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="GMV"
          value={formatMoney({ amount: gmv, currency: "INR" }, { compact: true })}
          trend={{ dir: "up", text: "22% this month" }}
          icon={<TrendingUp size={15} />}
          spark={[...SPARKS.gmv]}
        />
        <StatCard
          label="Smidig fee revenue"
          value={formatMoney({ amount: feeRevenue, currency: "INR" }, { compact: true })}
          sub="5% blended rate"
          spark={[...SPARKS.fees]}
        />
        <StatCard label="Active tournaments" value="18" countTo={18} sub="6 ongoing" icon={<Activity size={15} />} spark={[...SPARKS.orders]} />
        <StatCard label="Live matches" value="2" countTo={2} sub="right now" icon={<Radio size={15} />} spark={[...SPARKS.live]} />
      </RiseStagger>

      <RiseStagger className="mt-3 grid gap-3 sm:grid-cols-3">
        <StatCard label="Organizers" value={String(ORGANIZERS.length)} countTo={ORGANIZERS.length} sub="2 awaiting approval" icon={<Building2 size={15} />} />
        <StatCard label="Orders today" value="37" countTo={37} sub="₹1.4L processed" spark={[...SPARKS.orders]} />
        <StatCard label="Disputes open" value="0" sub="none this month" />
      </RiseStagger>

      <Rise className="mt-5">
      <Card className="p-5">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="text-[14px] font-semibold">Revenue by flow</h2>
            <p className="mt-0.5 text-[12px] text-fg-subtle">
              Entries · tickets · sponsorships · stalls
            </p>
          </div>
          <Badge tone="info">Last 7 days</Badge>
        </div>
        <RevenueChart />
      </Card>
      </Rise>

      <Rise className="mt-5">
      <Card className="overflow-hidden">
        <div className="flex items-center justify-between border-b border-line px-5 py-3.5">
          <h2 className="text-[14px] font-semibold">Latest orders</h2>
          <Button href="/admin/orders" variant="ghost" size="sm">
            All orders
          </Button>
        </div>
        <Table>
          <thead>
            <tr>
              <Th>Order</Th>
              <Th>Buyer</Th>
              <Th>Flow</Th>
              <Th align="right">Amount</Th>
              <Th align="right">Smidig fee</Th>
              <Th align="right">Status</Th>
            </tr>
          </thead>
          <Tbody>
            {ORDERS.slice(0, 6).map((o) => (
              <Tr key={o.id}>
                <Td className="font-mono text-[12px]">{o.id}</Td>
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
              </Tr>
            ))}
          </Tbody>
        </Table>
      </Card>
      </Rise>
    </>
  );
}
