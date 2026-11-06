/** Money is held in minor units (paise/cents) as integers — never floats. */
export type Money = { amount: number; currency: "INR" | "SEK" | "EUR" };

const SYMBOL: Record<Money["currency"], string> = { INR: "₹", SEK: "kr ", EUR: "€" };

export function money(amount: number, currency: Money["currency"] = "INR") {
  return { amount, currency };
}

export function formatMoney(m: Money, opts?: { compact?: boolean }) {
  const major = m.amount / 100;
  if (opts?.compact && major >= 100000)
    return `${SYMBOL[m.currency]}${(major / 100000).toFixed(1)}L`;
  if (opts?.compact && major >= 1000)
    return `${SYMBOL[m.currency]}${(major / 1000).toFixed(1)}k`;
  return `${SYMBOL[m.currency]}${major.toLocaleString("en-IN", {
    minimumFractionDigits: major % 1 ? 2 : 0,
    maximumFractionDigits: 2,
  })}`;
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
