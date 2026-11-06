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
  Th,
  Tr,
} from "@/components/kit";
import { ActionButton } from "@/components/kit/action-button";
import { SPONSORS, SPONSOR_TIERS } from "@/lib/data";
import { formatMoney } from "@/lib/money";

export const metadata = { title: "Sponsors" };

const booked = SPONSOR_TIERS.reduce((s, t) => s + t.price * t.taken, 0);

export default function Page() {
  return (
    <>
      <PageTitle
        title="Sponsors"
        sub="Sell logo packages. Logos appear on the tournament page, every match page and the stream."
        action={
          <ActionButton variant="gold" size="sm" title="New sponsor tier" body="Set a name, price and number of slots.">
            Add a tier
          </ActionButton>
        }
      />

      <RiseStagger className="mb-5 grid gap-3 sm:grid-cols-3">
        <StatCard label="Sponsorship revenue" value={formatMoney({ amount: booked, currency: "INR" }, { compact: true })} />
        <StatCard label="Packages sold" value="9" sub="of 13 available" />
        <StatCard label="Logos to review" value="2" sub="awaiting your approval" />
      </RiseStagger>

      <Card className="mb-5 overflow-hidden">
        <div className="border-b border-line px-5 py-3.5">
          <h2 className="text-[14px] font-semibold">Packages</h2>
        </div>
        <Table>
          <thead>
            <tr>
              <Th>Tier</Th>
              <Th align="right">Price</Th>
              <Th align="right">Sold</Th>
              <Th>Availability</Th>
              <Th align="right">Revenue</Th>
            </tr>
          </thead>
          <Tbody>
            {SPONSOR_TIERS.map((t) => (
              <Tr key={t.id}>
                <Td className="font-medium">{t.tier}</Td>
                <Td align="right" className="font-mono">
                  {formatMoney({ amount: t.price, currency: "INR" }, { compact: true })}
                </Td>
                <Td align="right" className="font-mono">
                  {t.taken}/{t.slots}
                </Td>
                <Td>
                  <span className="inline-flex w-28 flex-col gap-1.5">
                    <span className="font-mono text-[11.5px] text-fg-subtle">
                      {t.slots - t.taken} left
                    </span>
                    <Progress value={t.taken} max={t.slots} tone="accent" />
                  </span>
                </Td>
                <Td align="right" className="font-mono font-semibold">
                  {formatMoney({ amount: t.price * t.taken, currency: "INR" }, { compact: true })}
                </Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
      </Card>

      <Card className="overflow-hidden">
        <div className="border-b border-line px-5 py-3.5">
          <h2 className="text-[14px] font-semibold">Active sponsors</h2>
        </div>
        <Table>
          <thead>
            <tr>
              <Th>Sponsor</Th>
              <Th>Tier</Th>
              <Th>Logo</Th>
              <Th align="right">Placement</Th>
            </tr>
          </thead>
          <Tbody>
            {SPONSORS.map((s, i) => (
              <Tr key={s.name}>
                <Td className="font-medium">{s.name}</Td>
                <Td>
                  <Badge tone={s.tier === "Title" ? "featured" : s.tier === "Gold" ? "open" : "neutral"}>
                    {s.tier}
                  </Badge>
                </Td>
                <Td>
                  {i < 2 ? <Badge tone="closed">Needs review</Badge> : <Badge tone="open">Approved</Badge>}
                </Td>
                <Td align="right" className="text-fg-muted">
                  {s.tier === "Title" ? "Everywhere" : s.tier === "Gold" ? "Page + stream" : "Page"}
                </Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
      </Card>
    </>
  );
}
