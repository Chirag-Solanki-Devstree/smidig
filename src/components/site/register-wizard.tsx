"use client";

import { useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { AlertTriangle, Check, CreditCard, Plus, Shield, Trash2, Users } from "lucide-react";
import { Badge, Button, Card, TeamBadge } from "@/components/kit";
import { formatMoney, splitFee } from "@/lib/money";
import { tournamentBySlug } from "@/lib/data";
import { useToast } from "@/components/kit/toast";
import { Confetti } from "@/components/fx/confetti";
import { cx } from "@/lib/cx";

const STEPS = ["Team", "Squad", "Review", "Pay"] as const;

type Player = { id: string; name: string; role: string };

type TeamForm = {
  name: string;
  short: string;
  city: string;
  phone: string;
  email: string;
  squad: Player[];
};

type TeamErrors = Partial<Record<"name" | "short" | "city" | "phone" | "email" | "squad", string>>;

// Seeded rows get stable ids: this runs during prerender, and anything
// time- or random-based there differs between server and client.
let seq = 0;
const uid = () => `p-${++seq}`;

function validateTeam(step: number, f: TeamForm): TeamErrors {
  const e: TeamErrors = {};
  if (step === 0) {
    if (!f.name.trim()) e.name = "Your team needs a name.";
    if (!/^[A-Za-z]{3}$/.test(f.short.trim()))
      e.short = "Exactly three letters, e.g. THA.";
    if (!f.city.trim()) e.city = "Which city do you play out of?";
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(f.email.trim()))
      e.email = "Enter a valid email — confirmations go here.";
  }
  if (step === 1 && f.squad.filter((p) => p.name.trim()).length < 11)
    e.squad = "A squad needs at least 11 named players.";
  return e;
}

const SEED_SQUAD = [
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
  const [errors, setErrors] = useState<TeamErrors>({});
  const [form, setForm] = useState<TeamForm>({
    name: "",
    short: "",
    city: "",
    phone: "",
    email: "",
    squad: SEED_SQUAD.map((p, i) => ({ ...p, id: `seed-${i}` })),
  });
  const fee = splitFee(t.entryFee, { bps: 500, fixed: 0, paidBy: "organizer" });

  const set = <K extends keyof TeamForm>(key: K, value: TeamForm[K]) => {
    setForm((f) => ({ ...f, [key]: value }));
    setErrors((e) => (key in e ? { ...e, [key]: undefined } : e));
  };

  const go = (next: number) => {
    if (next > step) {
      const e = validateTeam(step, form);
      if (Object.keys(e).length) {
        setErrors(e);
        toast({ title: "Check this step", body: Object.values(e)[0] as string, tone: "warn" });
        return;
      }
    }
    setErrors({});
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
            {step === 0 ? <TeamStep form={form} set={set} errors={errors} /> : null}
            {step === 1 ? <SquadStep form={form} set={set} errors={errors} /> : null}
            {step === 2 ? <ReviewStep t={t} form={form} /> : null}
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

function Field({
  label,
  value,
  onChange,
  placeholder,
  hint,
  error,
  testId,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  hint?: string;
  error?: string;
  testId?: string;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-[12px] font-medium text-fg-muted">{label}</span>
      <input
        data-testid={testId}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={cx(
          "h-11 w-full rounded-xl border bg-surface px-3.5 text-[14px] outline-none transition-colors duration-[var(--dur)] placeholder:text-fg-subtle",
          error ? "border-[var(--live)]" : "border-line focus:border-[var(--accent)]",
        )}
      />
      {error ? (
        <span data-testid={testId ? `${testId}-error` : undefined} className="mt-1.5 flex items-center gap-1.5 text-[11.5px] text-[var(--live)]">
          <AlertTriangle size={11} /> {error}
        </span>
      ) : hint ? (
        <span className="mt-1.5 block text-[11.5px] text-fg-subtle">{hint}</span>
      ) : null}
    </label>
  );
}

type Setter = <K extends keyof TeamForm>(key: K, value: TeamForm[K]) => void;

function TeamStep({ form, set, errors }: { form: TeamForm; set: Setter; errors: TeamErrors }) {
  return (
    <Card className="p-6">
      <h2 className="text-[15px] font-semibold">Team details</h2>
      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        <Field label="Team name" testId="team-name" value={form.name} onChange={(v) => set("name", v)} placeholder="Thane Titans" error={errors.name} />
        <Field label="Short code" testId="team-short" value={form.short} onChange={(v) => set("short", v.toUpperCase().slice(0, 3))} placeholder="THA" hint="Three letters, shown on scorecards." error={errors.short} />
        <Field label="Home city" testId="team-city" value={form.city} onChange={(v) => set("city", v)} placeholder="Thane" error={errors.city} />
        <Field label="Captain's phone" testId="team-phone" value={form.phone} onChange={(v) => set("phone", v)} placeholder="+91 98765 43210" />
        <div className="sm:col-span-2">
          <Field label="Captain's email" testId="team-email" value={form.email} onChange={(v) => set("email", v)} placeholder="captain@team.com" hint="Tickets and confirmations go here." error={errors.email} />
        </div>
      </div>
      <div className="mt-5 rounded-xl border border-dashed border-line-strong p-5 text-center">
        <p className="text-[13px] font-medium">Team logo</p>
        <p className="mt-1 text-[12px] text-fg-subtle">PNG or SVG, square, up to 2 MB</p>
        <LogoUpload />
      </div>
    </Card>
  );
}

function LogoUpload() {
  const [picked, setPicked] = useState<string | null>(null);
  const ref = useRef<HTMLInputElement>(null);
  return (
    <>
      <input
        ref={ref}
        type="file"
        accept="image/*"
        data-testid="team-logo-file"
        className="hidden"
        onChange={(e) => setPicked(e.target.files?.[0]?.name ?? null)}
      />
      <Button variant="secondary" size="sm" className="mt-3" onClick={() => ref.current?.click()}>
        {picked ? "Change" : "Upload"}
      </Button>
      {picked ? (
        <p className="mt-2 truncate text-[11.5px] text-[var(--accent)]">{picked}</p>
      ) : null}
    </>
  );
}

function SquadStep({ form, set, errors }: { form: TeamForm; set: Setter; errors: TeamErrors }) {
  const named = form.squad.filter((p) => p.name.trim()).length;
  const update = (id: string, patch: Partial<Player>) =>
    set("squad", form.squad.map((p) => (p.id === id ? { ...p, ...patch } : p)));

  return (
    <Card className="overflow-hidden">
      <div className="flex items-center justify-between border-b border-line px-5 py-4">
        <div>
          <h2 className="text-[15px] font-semibold">Squad</h2>
          <p className="mt-0.5 text-[12px] text-fg-subtle" data-testid="squad-count">
            {named} of {form.squad.length} named · minimum 11
          </p>
        </div>
        <Button
          variant="secondary"
          size="sm"
          data-testid="add-player"
          onClick={() => set("squad", [...form.squad, { id: uid(), name: "", role: "Batter" }])}
        >
          <Plus size={14} /> Add player
        </Button>
      </div>

      {errors.squad ? (
        <p className="flex items-center gap-1.5 border-b border-line px-5 py-2.5 text-[11.5px] text-[var(--live)]">
          <AlertTriangle size={11} /> {errors.squad}
        </p>
      ) : null}

      <ul className="divide-y divide-[color:var(--border)]" data-testid="squad-rows">
        <AnimatePresence initial={false}>
          {form.squad.map((p, i) => (
            <motion.li
              key={p.id}
              layout
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.26, ease: [0.22, 1, 0.36, 1] }}
              className="group flex items-center gap-3 px-5 py-2.5 transition-colors duration-[var(--dur)] hover:bg-surface"
            >
              <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full border border-line bg-surface font-mono text-[11px] text-fg-subtle">
                {i + 1}
              </span>
              <input
                value={p.name}
                onChange={(e) => update(p.id, { name: e.target.value })}
                placeholder="Player name"
                className="h-9 min-w-0 flex-1 rounded-lg border border-transparent bg-transparent px-2 text-[13.5px] outline-none transition-colors duration-[var(--dur)] placeholder:text-fg-subtle focus:border-line focus:bg-surface"
              />
              <select
                value={p.role}
                onChange={(e) => update(p.id, { role: e.target.value })}
                className="h-9 shrink-0 rounded-lg border border-line bg-surface px-2 text-[12px] text-fg-muted outline-none focus:border-[var(--accent)]"
              >
                {["Batter", "Bowler", "All-rounder", "Wicketkeeper", "Captain · Batter", "Fast bowler", "Spinner"].map((r) => (
                  <option key={r} value={r}>{r}</option>
                ))}
              </select>
              <button
                type="button"
                aria-label={`Remove player ${i + 1}`}
                onClick={() => set("squad", form.squad.filter((x) => x.id !== p.id))}
                className="shrink-0 text-fg-subtle opacity-0 transition-opacity duration-[var(--dur)] hover:text-[var(--live)] group-hover:opacity-100"
              >
                <Trash2 size={15} />
              </button>
            </motion.li>
          ))}
        </AnimatePresence>
      </ul>
    </Card>
  );
}

function ReviewStep({ t, form }: { t: NonNullable<ReturnType<typeof tournamentBySlug>>; form: TeamForm }) {
  return (
    <div className="space-y-4">
      <Card className="p-6">
        <h2 className="text-[15px] font-semibold">Check before you pay</h2>
        <dl className="mt-5 grid gap-x-6 gap-y-4 sm:grid-cols-2">
          {[
            ["Tournament", t.name],
            ["Format", `${t.format} · ${t.matchType}`],
            ["Team", `${form.name} (${form.short})`],
            ["Captain", form.email || "—"],
            ["Squad", `${form.squad.filter((p) => p.name.trim()).length} players`],
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
