"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Check, CreditCard, Shield, Users } from "lucide-react";
import { Badge, Button, Card, TeamBadge } from "@/components/kit";
import { formatMoney, splitFee } from "@/lib/money";
import { tournamentBySlug } from "@/lib/data";
import { useToast } from "@/components/kit/toast";
import { Confetti } from "@/components/fx/confetti";
import { cx } from "@/lib/cx";

const STEPS = ["Team", "Squad", "Review", "Pay"] as const;

const SQUAD = [
  { name: "A. Deshmukh", role: "Captain · Batter" },
  { name: "V. Pillai", role: "Wicketkeeper" },
  { name: "S. Iyer", role: "All-rounder" },
  { name: "R. Gupta", role: "Fast bowler" },
  { name: "M. Khan", role: "Spinner" },
  { name: "T. Joseph", role: "Batter" },
  { name: "N. Bose", role: "All-rounder" },
  { name: "P. Rane", role: "Fast bowler" },
  { name: "K. Sodhi", role: "Batter" },
  { name: "D. Mehta", role: "Spinner" },
  { name: "G. Patel", role: "Batter" },
];

export function RegisterWizard({ slug }: { slug: string }) {
  const t = tournamentBySlug(slug)!;
  const toast = useToast();
  const [step, setStep] = useState(0);
  const [dir, setDir] = useState(1);
  const [paid, setPaid] = useState(false);
  const fee = splitFee(t.entryFee, { bps: 500, fixed: 0, paidBy: "organizer" });

  const go = (next: number) => {
    setDir(next > step ? 1 : -1);
    setStep(Math.max(0, Math.min(STEPS.length - 1, next)));
  };

  return (
    <div className="shell max-w-3xl pt-28 pb-20 sm:pt-32">
      <p className="text-[12.5px] text-fg-muted">{t.name}</p>
      <h1 className="display mt-2 text-[clamp(1.7rem,4vw,2.5rem)]">Register your team</h1>

      {/* stepper */}
      <ol className="mt-8 flex items-center gap-2">
        {STEPS.map((s, i) => {
          const done = i < step;
          const on = i === step;
          return (
            <li key={s} className="flex flex-1 items-center gap-2">
              <button
                onClick={() => go(i)}
                className={cx(
                  "flex items-center gap-2 rounded-full border px-3 py-1.5 text-[12.5px] font-medium transition-colors duration-[var(--dur)]",
                  on
                    ? "border-[var(--accent)] bg-[color-mix(in_oklab,var(--accent)_14%,transparent)] text-[var(--accent)]"
                    : done
                      ? "border-line bg-surface text-fg"
                      : "border-line text-fg-subtle",
                )}
              >
                <span
                  className={cx(
                    "grid h-5 w-5 place-items-center rounded-full font-mono text-[10px]",
                    done ? "bg-[var(--accent)] text-[var(--accent-fg)]" : "bg-surface-strong",
                  )}
                >
                  {done ? <Check size={11} /> : i + 1}
                </span>
                <span className="hidden sm:inline">{s}</span>
              </button>
              {i < STEPS.length - 1 ? (
                <span className="h-px flex-1 bg-line">
                  <span
                    className={cx(
                      "block h-px origin-left bg-[var(--accent)] transition-transform duration-[600ms] ease-[var(--ease-out)]",
                      i < step ? "scale-x-100" : "scale-x-0",
                    )}
                  />
                </span>
              ) : null}
            </li>
          );
        })}
      </ol>

      {/* panels slide in the direction of travel */}
      <div className="relative mt-8 overflow-hidden">
        <AnimatePresence mode="wait" initial={false} custom={dir}>
          <motion.div
            key={step}
            custom={dir}
            initial={{ opacity: 0, x: dir * 40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: dir * -40 }}
            transition={{ duration: 0.36, ease: [0.22, 1, 0.36, 1] }}
          >
            {step === 0 ? <TeamStep /> : null}
            {step === 1 ? <SquadStep /> : null}
            {step === 2 ? <ReviewStep t={t} /> : null}
            {step === 3 ? <PayStep t={t} fee={fee} /> : null}
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="mt-8 flex items-center justify-between gap-3">
        <Button variant="ghost" onClick={() => go(step - 1)} disabled={step === 0}>
          Back
        </Button>
        {step < STEPS.length - 1 ? (
          <Button variant="primary" onClick={() => go(step + 1)}>
            Continue
          </Button>
        ) : (
          <span className="relative">
            {paid ? <Confetti /> : null}
            <Button
              variant="primary"
              data-testid="pay"
              onClick={() => {
                setPaid(true);
                toast({
                  title: "Entry confirmed",
                  body: "Your spot is held. The organizer reviews the squad within 24 hours.",
                  tone: "ok",
                });
              }}
            >
              <CreditCard size={15} />{" "}
              {paid
                ? "Paid — spot held"
                : t.entryFee === 0
                  ? "Confirm free entry"
                  : `Pay ${formatMoney({ amount: t.entryFee, currency: "INR" })}`}
            </Button>
          </span>
        )}
      </div>
    </div>
  );
}

function Field({ label, placeholder, hint }: { label: string; placeholder: string; hint?: string }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-[12px] font-medium text-fg-muted">{label}</span>
      <input
        placeholder={placeholder}
        className="h-11 w-full rounded-xl border border-line bg-surface px-3.5 text-[14px] outline-none transition-colors duration-[var(--dur)] placeholder:text-fg-subtle focus:border-[var(--accent)]"
      />
      {hint ? <span className="mt-1.5 block text-[11.5px] text-fg-subtle">{hint}</span> : null}
    </label>
  );
}

function TeamStep() {
  return (
    <Card className="p-6">
      <h2 className="text-[15px] font-semibold">Team details</h2>
      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        <Field label="Team name" placeholder="Thane Titans" />
        <Field label="Short code" placeholder="THA" hint="Three letters, shown on scorecards." />
        <Field label="Home city" placeholder="Thane" />
        <Field label="Captain's phone" placeholder="+91 98765 43210" />
        <div className="sm:col-span-2">
          <Field label="Captain's email" placeholder="captain@team.com" hint="Tickets and confirmations go here." />
        </div>
      </div>
      <div className="mt-5 rounded-xl border border-dashed border-line-strong p-5 text-center">
        <p className="text-[13px] font-medium">Team logo</p>
        <p className="mt-1 text-[12px] text-fg-subtle">PNG or SVG, square, up to 2 MB</p>
        <Button variant="secondary" size="sm" className="mt-3">
          Upload
        </Button>
      </div>
    </Card>
  );
}

function SquadStep() {
  return (
    <Card className="overflow-hidden">
      <div className="flex items-center justify-between border-b border-line px-5 py-4">
        <div>
          <h2 className="text-[15px] font-semibold">Squad</h2>
          <p className="mt-0.5 text-[12px] text-fg-subtle">11 of 15 added · minimum 11</p>
        </div>
        <Button variant="secondary" size="sm">
          <Users size={14} /> Add player
        </Button>
      </div>
      <ul className="divide-y divide-[color:var(--border)]">
        {SQUAD.map((p, i) => (
          <motion.li
            key={p.name}
            initial={{ opacity: 0, x: -12 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.03, duration: 0.35 }}
            className="group flex items-center gap-3 px-5 py-3 transition-colors duration-[var(--dur)] hover:bg-surface"
          >
            <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full border border-line bg-surface font-mono text-[11px] text-fg-subtle">
              {i + 1}
            </span>
            <span className="min-w-0 flex-1">
              <span className="block text-[13.5px] font-medium">{p.name}</span>
              <span className="block text-[11.5px] text-fg-subtle">{p.role}</span>
            </span>
            <button className="text-[12px] text-fg-subtle opacity-0 transition-opacity duration-[var(--dur)] hover:text-[var(--live)] group-hover:opacity-100">
              Remove
            </button>
          </motion.li>
        ))}
      </ul>
    </Card>
  );
}

function ReviewStep({ t }: { t: NonNullable<ReturnType<typeof tournamentBySlug>> }) {
  return (
    <div className="space-y-4">
      <Card className="p-6">
        <h2 className="text-[15px] font-semibold">Check before you pay</h2>
        <dl className="mt-5 grid gap-x-6 gap-y-4 sm:grid-cols-2">
          {[
            ["Tournament", t.name],
            ["Format", `${t.format} · ${t.matchType}`],
            ["Team", "Thane Titans (THA)"],
            ["Captain", "A. Deshmukh"],
            ["Squad", "11 players"],
            ["Approval", "Organizer reviews within 24 hours"],
          ].map(([k, v]) => (
            <div key={k}>
              <dt className="text-[11.5px] uppercase tracking-wider text-fg-subtle">{k}</dt>
              <dd className="mt-1 text-[13.5px]">{v}</dd>
            </div>
          ))}
        </dl>
      </Card>
      <Card className="flex items-start gap-3 p-5">
        <Shield size={17} className="mt-0.5 shrink-0 text-[var(--accent)]" />
        <p className="text-[13px] leading-relaxed text-fg-muted">
          Your spot is held as soon as payment clears, then confirmed when the
          organizer approves the squad. If they reject it you are refunded in
          full, automatically.
        </p>
      </Card>
    </div>
  );
}

function PayStep({
  t,
  fee,
}: {
  t: NonNullable<ReturnType<typeof tournamentBySlug>>;
  fee: ReturnType<typeof splitFee>;
}) {
  return (
    <div className="space-y-4">
      <Card className="p-6">
        <h2 className="text-[15px] font-semibold">Payment</h2>
        <ul className="mt-5 space-y-3 text-[13.5px]">
          <li className="flex justify-between">
            <span className="text-fg-muted">Entry fee</span>
            <span className="font-mono">{formatMoney({ amount: t.entryFee, currency: "INR" })}</span>
          </li>
          <li className="flex justify-between">
            <span className="text-fg-muted">Smidig fee (5%, paid by organizer)</span>
            <span className="font-mono text-fg-subtle">
              −{formatMoney({ amount: fee.smidigFee, currency: "INR" })}
            </span>
          </li>
          <li className="flex justify-between border-t border-line pt-3 text-[15px] font-semibold">
            <span>You pay</span>
            <span className="font-mono">{formatMoney({ amount: fee.buyerPays, currency: "INR" })}</span>
          </li>
        </ul>
        <div className="mt-5 grid gap-3 sm:grid-cols-3">
          {["Card", "UPI", "Netbanking"].map((m, i) => (
            <button
              key={m}
              className={cx(
                "rounded-xl border px-4 py-3 text-[13px] font-medium transition-[border-color,transform] duration-[var(--dur)] ease-[var(--ease-out)] hover:-translate-y-0.5",
                i === 0
                  ? "border-[var(--accent)] bg-[color-mix(in_oklab,var(--accent)_12%,transparent)] text-[var(--accent)]"
                  : "border-line bg-surface text-fg-muted hover:border-line-strong",
              )}
            >
              {m}
            </button>
          ))}
        </div>
      </Card>
      <p className="text-center text-[11.5px] text-fg-subtle">
        Prototype — no gateway is connected and nothing is charged.
      </p>
    </div>
  );
}

export { Badge, TeamBadge };
