/**
 * Every date formatter the app uses, built once.
 *
 * Same reasoning as the money formatters: `d.toLocaleDateString(locale, opts)`
 * constructs a fresh Intl.DateTimeFormat on every call, and constructing it is
 * the expensive half. These run once per card, per fixture row and per match in
 * a list, so the cost lands on render and scroll paths.
 *
 * Dates that carry no time are parsed as UTC and formatted in UTC, so a
 * "14 Nov" tournament start does not slide to the 13th for a reader west of
 * Greenwich.
 */

const DAY_MONTH_UTC = new Intl.DateTimeFormat("en-GB", {
  day: "numeric",
  month: "short",
  timeZone: "UTC",
});

const DAY_MONTH_YEAR_UTC = new Intl.DateTimeFormat("en-GB", {
  day: "numeric",
  month: "short",
  year: "numeric",
  timeZone: "UTC",
});

const DAY_MONTH_LOCAL = new Intl.DateTimeFormat("en-GB", {
  day: "numeric",
  month: "short",
});

const TIME_LOCAL = new Intl.DateTimeFormat("en-GB", {
  hour: "2-digit",
  minute: "2-digit",
});

const MATCH_TIME = new Intl.DateTimeFormat("en-GB", {
  day: "numeric",
  month: "short",
  hour: "2-digit",
  minute: "2-digit",
});

/** "14 Nov" from a plain YYYY-MM-DD date. Returns "—" for an empty value. */
export function formatDay(date: string) {
  if (!date) return "—";
  const d = new Date(date + "T00:00:00Z");
  if (Number.isNaN(d.getTime())) return date;
  return DAY_MONTH_UTC.format(d);
}

/** "14 Nov 2026" from a plain YYYY-MM-DD date. */
export function formatDayYear(date: string) {
  if (!date) return "—";
  const d = new Date(date + "T00:00:00Z");
  if (Number.isNaN(d.getTime())) return date;
  return DAY_MONTH_YEAR_UTC.format(d);
}

/** "14 Nov – 16 Nov". */
export function formatDayRange(from: string, to: string) {
  return `${formatDay(from)} – ${formatDay(to)}`;
}

/** "14 Nov 2026 – 16 Nov 2026". */
export function formatDayYearRange(from: string, to: string) {
  return `${formatDayYear(from)} – ${formatDayYear(to)}`;
}

/** "14 Nov · 14:30" from a full timestamp, in the reader's own zone. */
export function formatDayTime(iso: string) {
  const d = new Date(iso);
  return `${DAY_MONTH_LOCAL.format(d)} · ${TIME_LOCAL.format(d)}`;
}

/** "14 Nov, 14:30" — the fixture-list time format. */
export function formatMatchTime(iso: string) {
  return MATCH_TIME.format(new Date(iso));
}
