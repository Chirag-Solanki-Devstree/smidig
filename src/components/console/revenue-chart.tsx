"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { REVENUE_BY_DAY } from "@/lib/data";
import { formatMoney, money } from "@/lib/money";


const FLOWS = [
  { key: "entry", label: "Entries", colour: "var(--accent)" },
  { key: "tickets", label: "Tickets", colour: "var(--info)" },
  { key: "sponsors", label: "Sponsors", colour: "var(--accent-2)" },
  { key: "stalls", label: "Stalls", colour: "var(--six)" },
];

/** Revenue by day, stacked by money flow — the five flows the client defined. */
export function RevenueChart() {
  // Mounted once, with Recharts' own animation off.
  //
  // The chart is also deliberately NOT given its own reveal. Its card already
  // arrives with the surrounding group, and transforming a chart this dense
  // forces the whole SVG to re-rasterise: stacking a second transform on it
  // was worth an 83ms frame on a throttled machine. The card moves, the chart
  // rides along.
  return (
    // The tooltip formatter runs while the pointer is over the chart, which
    // on a short page means while the user is still scrolling. It must stay
    // allocation-free: formatMoney reuses a module-scope Intl formatter, and
    // building one per call here cost a dropped frame on every pass.
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={REVENUE_BY_DAY} margin={{ top: 8, right: 8, bottom: 0, left: -16 }}>
          <CartesianGrid stroke="var(--border)" vertical={false} />
          <XAxis
            dataKey="day"
            tick={{ fill: "var(--fg-subtle)", fontSize: 11 }}
            axisLine={{ stroke: "var(--border)" }}
            tickLine={false}
          />
          <YAxis
            tick={{ fill: "var(--fg-subtle)", fontSize: 11 }}
            axisLine={false}
            tickLine={false}
            // Minor units, like every other amount in the app: this axis used
            // to divide by 1000 and label paise as rupees, so it read "₹120k"
            // against a tooltip saying "₹1,200" for the same bar.
            tickFormatter={(v) => formatMoney(money(Number(v)), { compact: true })}
          />
          <Tooltip
            cursor={{ fill: "color-mix(in oklab, var(--fg) 6%, transparent)" }}
            contentStyle={{
              background: "var(--bg-elev)",
              border: "1px solid var(--border)",
              borderRadius: 12,
              fontSize: 12,
              color: "var(--fg)",
            }}
            formatter={(v, n) => [formatMoney(money(Number(v))), String(n)]}
          />
          <Legend
            iconType="circle"
            iconSize={7}
            wrapperStyle={{ fontSize: 11, color: "var(--fg-muted)", paddingTop: 8 }}
          />
          {FLOWS.map((f) => (
            <Bar
              key={f.key}
              dataKey={f.key}
              name={f.label}
              stackId="rev"
              fill={f.colour}
              isAnimationActive={false}
              radius={f.key === "stalls" ? [4, 4, 0, 0] : 0}
            />
          ))}
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
