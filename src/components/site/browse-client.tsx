"use client";

import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Search, SlidersHorizontal, X } from "lucide-react";
import { TournamentCard } from "@/components/cards/tournament-card";
import { SportChips } from "@/components/site/sport-chips";
import { Badge, Button, EmptyState } from "@/components/kit";
import { TOURNAMENTS } from "@/lib/data";
import { cx } from "@/lib/cx";

const CITIES = ["All cities", "Mumbai", "Ahmedabad", "Kochi", "Jaipur", "Surat", "Nagpur"];
const FORMATS = ["All formats", "T10", "T20", "ODI (50)"];
const FEES = ["Any entry", "Free", "Paid"];
const STATUSES = ["Any status", "Registration open", "Ongoing", "Completed"];

export function BrowseClient() {
  const [q, setQ] = useState("");
  const [city, setCity] = useState(CITIES[0]);
  const [format, setFormat] = useState(FORMATS[0]);
  const [fee, setFee] = useState(FEES[0]);
  const [status, setStatus] = useState(STATUSES[0]);
  const [panel, setPanel] = useState(false);

  const results = useMemo(() => {
    return TOURNAMENTS.filter((t) => {
      if (q && !(`${t.name} ${t.city} ${t.organizer}`.toLowerCase().includes(q.toLowerCase())))
        return false;
      if (city !== CITIES[0] && t.city !== city) return false;
      if (format !== FORMATS[0] && t.matchType !== format) return false;
      if (fee === "Free" && t.entryFee !== 0) return false;
      if (fee === "Paid" && t.entryFee === 0) return false;
      if (status === "Registration open" && t.status !== "registration_open") return false;
      if (status === "Ongoing" && t.status !== "ongoing") return false;
      if (status === "Completed" && t.status !== "completed") return false;
      return true;
    });
  }, [q, city, format, fee, status]);

  const active = [
    city !== CITIES[0] && { k: "city", v: city, reset: () => setCity(CITIES[0]) },
    format !== FORMATS[0] && { k: "format", v: format, reset: () => setFormat(FORMATS[0]) },
    fee !== FEES[0] && { k: "fee", v: fee, reset: () => setFee(FEES[0]) },
    status !== STATUSES[0] && { k: "status", v: status, reset: () => setStatus(STATUSES[0]) },
  ].filter(Boolean) as { k: string; v: string; reset: () => void }[];

  const clearAll = () => {
    setCity(CITIES[0]);
    setFormat(FORMATS[0]);
    setFee(FEES[0]);
    setStatus(STATUSES[0]);
    setQ("");
  };

  return (
    <>
      <h1 className="display text-[clamp(1.9rem,4.4vw,2.9rem)]">Browse tournaments</h1>
      <p className="mt-2 max-w-xl text-[14px] text-fg-muted">
        {TOURNAMENTS.length} tournaments listed. Filters stay in the URL in the
        real build, so a filtered view is shareable.
      </p>

      <div className="mt-6">
        <SportChips />
      </div>

      {/* search + filter row */}
      <div className="mt-5 flex flex-wrap items-center gap-2">
        <label className="flex h-11 min-w-0 flex-1 items-center gap-2.5 rounded-xl border border-line bg-surface px-3.5 transition-colors duration-[var(--dur)] focus-within:border-[var(--accent)]">
          <Search size={16} className="shrink-0 text-fg-subtle" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search by name, city or organizer"
            className="w-full bg-transparent text-[14px] outline-none placeholder:text-fg-subtle"
          />
          {q ? (
            <button onClick={() => setQ("")} aria-label="Clear search" className="text-fg-subtle hover:text-fg">
              <X size={15} />
            </button>
          ) : null}
        </label>
        <button
          onClick={() => setPanel((v) => !v)}
          className={cx(
            "inline-flex h-11 items-center gap-2 rounded-xl border px-4 text-[13.5px] font-medium transition-colors duration-[var(--dur)]",
            panel || active.length
              ? "border-[var(--accent)] bg-[color-mix(in_oklab,var(--accent)_12%,transparent)] text-[var(--accent)]"
              : "border-line bg-surface text-fg-muted hover:text-fg",
          )}
        >
          <SlidersHorizontal size={15} />
          Filters
          {active.length ? (
            <span className="rounded-full bg-[var(--accent)] px-1.5 text-[10px] font-bold text-[var(--accent-fg)]">
              {active.length}
            </span>
          ) : null}
        </button>
      </div>

      {/* filter panel — height animates open so the grid slides rather than jumps */}
      <AnimatePresence initial={false}>
        {panel ? (
          <motion.div
            key="panel"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.38, ease: [0.22, 1, 0.36, 1] }}
            style={{ overflow: "hidden" }}
          >
            <div className="mt-3 grid gap-3 rounded-2xl border border-line bg-surface/50 p-4 sm:grid-cols-2 lg:grid-cols-4">
              <Select label="City" value={city} onChange={setCity} options={CITIES} />
              <Select label="Format" value={format} onChange={setFormat} options={FORMATS} />
              <Select label="Entry fee" value={fee} onChange={setFee} options={FEES} />
              <Select label="Status" value={status} onChange={setStatus} options={STATUSES} />
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>

      {active.length ? (
        <div className="mt-4 flex flex-wrap items-center gap-2">
          {active.map((a) => (
            <button key={a.k} onClick={a.reset} className="group">
              <Badge tone="open" className="gap-1.5 normal-case">
                {a.v}
                <X size={11} className="transition-transform duration-[var(--dur)] group-hover:rotate-90" />
              </Badge>
            </button>
          ))}
          <button onClick={clearAll} className="text-[12px] text-fg-subtle underline-offset-4 hover:text-fg hover:underline">
            Clear all
          </button>
        </div>
      ) : null}

      <p className="mt-6 text-[12.5px] text-fg-subtle">
        {results.length} result{results.length === 1 ? "" : "s"}
      </p>

      {results.length ? (
        <motion.div layout className="mt-3 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <AnimatePresence mode="popLayout">
            {results.map((t, i) => (
              <motion.div
                key={t.id}
                layout
                initial={{ opacity: 0, y: 22, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, scale: 0.96 }}
                transition={{ duration: 0.45, delay: i * 0.04, ease: [0.22, 1, 0.36, 1] }}
              >
                <TournamentCard t={t} />
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      ) : (
        <div className="mt-3">
          <EmptyState
            icon={<Search size={18} />}
            title="No tournaments match those filters"
            body="Try a wider date range or a different city — or host one yourself and be the first in town."
            action={
              <div className="flex flex-wrap justify-center gap-2">
                <Button onClick={clearAll} variant="secondary" size="sm">
                  Clear filters
                </Button>
                <Button href="/host" variant="primary" size="sm">
                  Host a tournament
                </Button>
              </div>
            }
          />
        </div>
      )}
    </>
  );
}

function Select({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: string[];
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wider text-fg-subtle">
        {label}
      </span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-10 w-full rounded-lg border border-line bg-bg px-3 text-[13.5px] outline-none transition-colors duration-[var(--dur)] focus:border-[var(--accent)]"
      >
        {options.map((o) => (
          <option key={o} value={o}>
            {o}
          </option>
        ))}
      </select>
    </label>
  );
}
