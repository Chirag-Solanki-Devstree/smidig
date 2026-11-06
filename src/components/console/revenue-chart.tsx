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
import { useInViewOnce } from "@/components/fx/in-view";

const FLOWS = [
  { key: "entry", label: "Entries", colour: "var(--accent)" },
  { key: "tickets", label: "Tickets", colour: "var(--info)" },
  { key: "sponsors", label: "Sponsors", colour: "var(--accent-2)" },
  { key: "stalls", label: "Stalls", colour: "var(--six)" },
];

/** Revenue by day, stacked by money flow — the five flows the client defined. */
export function RevenueChart() {
  // Recharts animates on mount. Holding the data back until the card is in
  // view means the bars grow as you reach them, not while off screen.
  const { ref, seen } = useInViewOnce<HTMLDivElement>({ amount: 0.2 });
  const data = seen ? REVENUE_BY_DAY : REVENUE_BY_DAY.map((d) => ({ ...d, entry: 0, tickets: 0, sponsors: 0, stalls: 0 }));

  return (
    <div ref={ref} className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: -16 }}>
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
            tickFormatter={(v) => `₹${v / 1000}k`}
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
            formatter={(v, n) => [`₹${(Number(v) / 100).toLocaleString("en-IN")}`, String(n)]}
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
              isAnimationActive
              animationDuration={760}
              animationEasing="ease-out"
              radius={f.key === "stalls" ? [4, 4, 0, 0] : 0}
            />
          ))}
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
