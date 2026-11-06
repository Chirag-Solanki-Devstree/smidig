/** Money is held in minor units (paise/cents) as integers — never floats. */
export type Money = { amount: number; currency: "INR" | "SEK" | "EUR" };

const SYMBOL: Record<Money["currency"], string> = { INR: "₹", SEK: "kr ", EUR: "€" };

/* Building the Intl formatter is the expensive half of `toLocaleString`, and
   `n.toLocaleString(...)` builds a fresh one on every single call. These
   screens format money in table cells, stat cards and chart tooltips, so that
   cost lands squarely on scroll and keystroke paths. Formatting four tooltip
   series as the revenue chart slid under the cursor measured 32ms of script
   on a 4x-throttled machine — one dropped frame, every time the pointer
   crossed the chart. Build each formatter once here and reuse it. */
const GROUPED = new Intl.NumberFormat("en-IN");
const WHOLE = new Intl.NumberFormat("en-IN", {
  minimumFractionDigits: 0,
  maximumFractionDigits: 2,
});
const DECIMAL = new Intl.NumberFormat("en-IN", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

/** Group-separated number, no currency symbol. */
export function formatNumber(n: number) {
  return GROUPED.format(n);
}

export function money(amount: number, currency: Money["currency"] = "INR") {
  return { amount, currency };
}

export function formatMoney(m: Money, opts?: { compact?: boolean }) {
  const major = m.amount / 100;
  if (opts?.compact && major >= 100000)
    return `${SYMBOL[m.currency]}${(major / 100000).toFixed(1)}L`;
  if (opts?.compact && major >= 1000)
    return `${SYMBOL[m.currency]}${(major / 1000).toFixed(1)}k`;
  return `${SYMBOL[m.currency]}${(major % 1 ? DECIMAL : WHOLE).format(major)}`;
}

/** Fee preview used by the admin fee-settings screen and every checkout. */
export function splitFee(
  gross: number,
  rule: { bps: number; fixed: number; paidBy: "buyer" | "organizer" },
) {
  const fee = Math.round((gross * rule.bps) / 10000) + rule.fixed;
  return rule.paidBy === "buyer"
    ? { buyerPays: gross + fee, organizerGets: gross, smidigFee: fee }
    : { buyerPays: gross, organizerGets: gross - fee, smidigFee: fee };
}

/* Same reasoning as the number formatters above: this one is called once per
   fixture row, so it is built once rather than per cell. */
const MATCH_TIME = new Intl.DateTimeFormat("en-GB", {
  day: "numeric",
  month: "short",
  hour: "2-digit",
  minute: "2-digit",
});

/** "12 Apr, 14:30" — the fixture-list time format. */
export function formatMatchTime(iso: string) {
  return MATCH_TIME.format(new Date(iso));
}
