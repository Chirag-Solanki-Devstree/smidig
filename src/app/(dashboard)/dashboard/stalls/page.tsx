import { PageTitle } from "@/components/layouts/console-shell";
import {
  Badge,
  Card,
  StatCard,
  Table,
  Tbody,
  Td,
  Th,
  Tr,
} from "@/components/kit";
import { STALLS } from "@/lib/data";
import { formatMoney } from "@/lib/money";

export const metadata = { title: "Food stalls" };

const booked = STALLS.filter((s) => s.status === "booked");
const revenue = booked.reduce((s, x) => s + x.price, 0);

export default function Page() {
  return (
    <>
      <PageTitle
        title="Food stalls"
        sub="Vendors pick a pitch on the venue map and pay online. Held slots release after 10 minutes."
      />

      <div className="mb-5 grid gap-3 sm:grid-cols-3">
        <StatCard label="Stall revenue" value={formatMoney({ amount: revenue, currency: "INR" }, { compact: true })} />
        <StatCard label="Booked" value={`${booked.length}/${STALLS.length}`} sub="2 held in checkout" />
        <StatCard label="Vendors" value="3" sub="all documents verified" />
      </div>

      <Card className="mb-5 p-5">
        <h2 className="text-[14px] font-semibold">Venue layout</h2>
        <p className="mt-1 text-[12.5px] text-fg-muted">
          Zone A by the main gate, Zone B behind the stands, Zone C near the nets.
        </p>
        <div className="mt-5 space-y-5">
          {(["A", "B", "C"] as const).map((z) => (
            <div key={z}>
              <p className="mb-2 font-mono text-[11px] uppercase tracking-widest text-fg-subtle">
                Zone {z}
              </p>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                {STALLS.filter((s) => s.zone === z).map((s) => (
                  <div
                    key={s.id}
                    className={
                      s.status === "booked"
                        ? "rounded-lg border border-[color-mix(in_oklab,var(--accent)_40%,transparent)] bg-[color-mix(in_oklab,var(--accent)_10%,transparent)] p-3"
                        : s.status === "held"
                          ? "rounded-lg border border-[color-mix(in_oklab,var(--warn)_40%,transparent)] bg-[color-mix(in_oklab,var(--warn)_10%,transparent)] p-3"
                          : "rounded-lg border border-dashed border-line-strong p-3"
                    }
                  >
                    <p className="font-mono text-[12px] font-semibold">{s.id}</p>
                    <p className="mt-0.5 text-[11px] text-fg-subtle">{s.size}</p>
                    <p className="mt-1.5 truncate text-[11px] text-fg-muted">
                      {s.vendor ?? (s.status === "held" ? "In checkout" : "Available")}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </Card>

      <Card className="overflow-hidden">
        <div className="border-b border-line px-5 py-3.5">
          <h2 className="text-[14px] font-semibold">Bookings</h2>
        </div>
        <Table>
          <thead>
            <tr>
              <Th>Stall</Th>
              <Th>Zone</Th>
              <Th>Size</Th>
              <Th>Vendor</Th>
              <Th align="right">Price</Th>
              <Th align="right">Status</Th>
            </tr>
          </thead>
          <Tbody>
            {STALLS.map((s) => (
              <Tr key={s.id}>
                <Td className="font-mono text-[12px] font-semibold">{s.id}</Td>
                <Td className="text-fg-muted">{s.zone}</Td>
                <Td className="text-fg-muted">{s.size}</Td>
                <Td>{s.vendor ?? <span className="text-fg-subtle">—</span>}</Td>
                <Td align="right" className="font-mono">
                  {formatMoney({ amount: s.price, currency: "INR" })}
                </Td>
                <Td align="right">
                  <Badge tone={s.status === "booked" ? "open" : s.status === "held" ? "closed" : "neutral"}>
                    {s.status}
                  </Badge>
                </Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
      </Card>
    </>
  );
}
