"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { AlertTriangle, Check, Eye } from "lucide-react";
import { PageTitle } from "@/components/layouts/console-shell";
import { Badge, Button, Card, Progress } from "@/components/kit";
import { LIVE_SPORTS, SPORTS, SPORT_BY_ID, type SportId } from "@/lib/sports";
import { useToast } from "@/components/kit/toast";
import { Confetti } from "@/components/fx/confetti";
import { cx } from "@/lib/cx";

const STEPS = [
  "Basics",
  "Format",
  "Registration",
  "Tickets",
  "Sponsors & stalls",
  "Rules",
  "Review",
] as const;

export function CreateWizard() {
  const toast = useToast();
  const [step, setStep] = useState(0);
  const [dir, setDir] = useState(1);
  const [sport, setSport] = useState<SportId>("cricket");
  const [published, setPublished] = useState(false);

  const go = (n: number) => {
    setDir(n > step ? 1 : -1);
    setStep(Math.max(0, Math.min(STEPS.length - 1, n)));
  };

  return (
    <>
      <PageTitle
        title="New tournament"
        sub="Saved as a draft after every step — you can leave and come back."
        badge={`Step ${step + 1} of ${STEPS.length}`}
        action={
          <Button
            variant="secondary"
            size="sm"
            onClick={() => toast({ title: "Preview", body: "Opens the public listing exactly as it will appear.", tone: "info" })}
          >
            <Eye size={14} /> Preview
          </Button>
        }
      />

      <div className="mb-5">
        <Progress value={step + 1} max={STEPS.length} />
      </div>

      <div className="grid gap-5 lg:grid-cols-[13rem_1fr]">
        {/* step rail */}
        <ol className="flex gap-2 overflow-x-auto scroll-thin lg:flex-col lg:overflow-visible">
          {STEPS.map((s, i) => {
            const done = i < step;
            const on = i === step;
            return (
              <li key={s} className="shrink-0 lg:shrink">
                <button
                  onClick={() => go(i)}
                  className={cx(
                    "flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-[13px] transition-colors duration-[var(--dur)]",
                    on
                      ? "bg-surface-strong font-medium text-fg"
                      : "text-fg-muted hover:bg-surface hover:text-fg",
                  )}
                >
                  <span
                    className={cx(
                      "grid h-5 w-5 shrink-0 place-items-center rounded-full font-mono text-[10px]",
                      done
                        ? "bg-[var(--accent)] text-[var(--accent-fg)]"
                        : on
                          ? "border border-[var(--accent)] text-[var(--accent)]"
                          : "border border-line text-fg-subtle",
                    )}
                  >
                    {done ? <Check size={11} /> : i + 1}
                  </span>
                  <span className="whitespace-nowrap">{s}</span>
                </button>
              </li>
            );
          })}
        </ol>

        <div className="min-w-0">
          <div className="relative overflow-hidden">
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={step}
                initial={{ opacity: 0, y: dir * 22 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: dir * -22 }}
                transition={{ duration: 0.34, ease: [0.22, 1, 0.36, 1] }}
              >
                {step === 0 ? <Basics sport={sport} setSport={setSport} /> : null}
                {step === 1 ? <Format sport={sport} /> : null}
                {step === 2 ? <Registration /> : null}
                {step === 3 ? <Tickets /> : null}
                {step === 4 ? <Extras /> : null}
                {step === 5 ? <Rules /> : null}
                {step === 6 ? <Review sport={sport} /> : null}
              </motion.div>
            </AnimatePresence>
          </div>

          <div className="mt-6 flex items-center justify-between gap-3">
            <Button variant="ghost" onClick={() => go(step - 1)} disabled={step === 0}>
              Back
            </Button>
            {step < STEPS.length - 1 ? (
              <Button variant="primary" onClick={() => go(step + 1)}>
                Save and continue
              </Button>
            ) : (
              <span className="relative">
                {published ? <Confetti /> : null}
                <Button
                  variant="primary"
                  data-testid="publish"
                  onClick={() => {
                    setPublished(true);
                    toast({
                      title: "Tournament published",
                      body: "It is live on the marketplace and entries are open.",
                      tone: "ok",
                    });
                  }}
                >
                  {published ? "Published ✓" : "Publish to marketplace"}
                </Button>
              </span>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

/* ------------------------------------------------------------------- steps */

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

function Choice({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: { id: string; label: string; disabled?: boolean }[];
  value: string;
  onChange?: (v: string) => void;
}) {
  return (
    <div>
      <p className="mb-2 text-[12px] font-medium text-fg-muted">{label}</p>
      <div className="flex flex-wrap gap-2">
        {options.map((o) => (
          <button
            key={o.id}
            disabled={o.disabled}
            onClick={() => onChange?.(o.id)}
            className={cx(
              "rounded-xl border px-3.5 py-2.5 text-[13px] font-medium transition-[border-color,background-color,transform] duration-[var(--dur)] ease-[var(--ease-out)]",
              o.disabled
                ? "cursor-not-allowed border-line text-fg-subtle opacity-55"
                : value === o.id
                  ? "border-[var(--accent)] bg-[color-mix(in_oklab,var(--accent)_12%,transparent)] text-[var(--accent)]"
                  : "border-line bg-surface text-fg-muted hover:-translate-y-0.5 hover:border-line-strong hover:text-fg",
            )}
          >
            {o.label}
          </button>
        ))}
      </div>
    </div>
  );
}

function Basics({ sport, setSport }: { sport: SportId; setSport: (s: SportId) => void }) {
  return (
    <Card className="space-y-5 p-6">
      <h2 className="text-[15px] font-semibold">Basics</h2>

      <Choice
        label="Sport"
        value={sport}
        onChange={(v) => setSport(v as SportId)}
        options={SPORTS.map((s) => ({
          id: s.id,
          label: s.status === "planned" ? `${s.name} (soon)` : s.name,
          disabled: s.status === "planned",
        }))}
      />
      <p className="-mt-2 text-[11.5px] text-fg-subtle">
        Cricket is live in phase 1. The other sports are wired through the same
        data model and switch on without a redesign.
      </p>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Tournament name" placeholder="Deccan Premier League 2026" />
        <Field label="Short description" placeholder="Eight franchises, 22 nights" />
        <Field label="City" placeholder="Mumbai" />
        <Field label="Venue" placeholder="Wankhede Ground B" />
        <Field label="Starts" placeholder="2 Nov 2026" />
        <Field label="Ends" placeholder="24 Nov 2026" />
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        {["Banner (16:9)", "Logo (1:1)"].map((x) => (
          <div key={x} className="rounded-xl border border-dashed border-line-strong p-5 text-center">
            <p className="text-[13px] font-medium">{x}</p>
            <p className="mt-1 text-[11.5px] text-fg-subtle">Drop a file or click to upload</p>
          </div>
        ))}
      </div>
    </Card>
  );
}

function Format({ sport }: { sport: SportId }) {
  const s = SPORT_BY_ID[sport];
  return (
    <Card className="space-y-5 p-6">
      <h2 className="text-[15px] font-semibold">{s.name} format</h2>
      <Choice label="Match type" value="t20" options={s.matchTypes} />
      <Choice label="Tournament format" value="groups" options={s.formats} />
      <Choice
        label="Ball type"
        value="leather"
        options={[
          { id: "tennis", label: "Tennis" },
          { id: "leather", label: "Leather" },
          { id: "other", label: "Other" },
        ]}
      />
      <div className="grid gap-4 sm:grid-cols-3">
        <Field label="Points for a win" placeholder="2" />
        <Field label="Points for a tie" placeholder="1" />
        <Field label="Points for no result" placeholder="1" />
      </div>
      <div className="grid gap-4 sm:grid-cols-3">
        <Field label="Squad minimum" placeholder="11" />
        <Field label="Squad maximum" placeholder="15" />
        <Field label={`Max ${s.entrant.many.toLowerCase()}`} placeholder="8" />
      </div>
    </Card>
  );
}

function Registration() {
  return (
    <Card className="space-y-5 p-6">
      <h2 className="text-[15px] font-semibold">Registration</h2>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Entry fee" placeholder="₹12,000" hint="Set 0 for a free tournament." />
        <Field label="Currency" placeholder="INR" />
        <Field label="Registration opens" placeholder="10 Oct 2026" />
        <Field label="Registration closes" placeholder="28 Oct 2026" />
      </div>
      <Choice
        label="Approval"
        value="manual"
        options={[
          { id: "manual", label: "I approve each team" },
          { id: "auto", label: "Auto-approve on payment" },
        ]}
      />
      <Card className="flex items-start gap-3 bg-[color-mix(in_oklab,var(--accent)_7%,transparent)] p-4">
        <AlertTriangle size={16} className="mt-0.5 shrink-0 text-[var(--accent)]" />
        <p className="text-[12.5px] leading-relaxed text-fg-muted">
          Smidig keeps 5% of each entry fee. On a ₹12,000 entry you receive
          ₹11,400 and Smidig earns ₹600.
        </p>
      </Card>
    </Card>
  );
}

function Tickets() {
  return (
    <Card className="space-y-5 p-6">
      <h2 className="text-[15px] font-semibold">Ticket defaults</h2>
      <p className="-mt-3 text-[12.5px] text-fg-muted">
        These apply to every match and can be overridden per match later.
      </p>
      <Choice
        label="Sell tickets?"
        value="yes"
        options={[
          { id: "yes", label: "Yes" },
          { id: "no", label: "No tickets" },
        ]}
      />
      <div className="space-y-3">
        {[
          ["General", "₹0", "400"],
          ["Premium", "₹200", "180"],
        ].map(([n, p, c]) => (
          <div key={n} className="grid gap-3 rounded-xl border border-line bg-surface p-4 sm:grid-cols-3">
            <Field label="Name" placeholder={n} />
            <Field label="Price" placeholder={p} />
            <Field label="Capacity" placeholder={c} />
          </div>
        ))}
      </div>
      <AddButton label="Add ticket type" />
    </Card>
  );
}

function Extras() {
  return (
    <div className="space-y-4">
      <Card className="space-y-5 p-6">
        <h2 className="text-[15px] font-semibold">Sponsors</h2>
        <Choice
          label="Sell sponsorships?"
          value="yes"
          options={[
            { id: "yes", label: "Yes" },
            { id: "no", label: "Not this time" },
          ]}
        />
        <div className="space-y-3">
          {[
            ["Title", "₹2,50,000", "1"],
            ["Gold", "₹1,20,000", "4"],
            ["Silver", "₹50,000", "8"],
          ].map(([n, p, s]) => (
            <div key={n} className="grid gap-3 rounded-xl border border-line bg-surface p-4 sm:grid-cols-3">
              <Field label="Tier" placeholder={n} />
              <Field label="Price" placeholder={p} />
              <Field label="Slots" placeholder={s} />
            </div>
          ))}
        </div>
      </Card>
      <Card className="space-y-5 p-6">
        <h2 className="text-[15px] font-semibold">Food stalls</h2>
        <div className="grid gap-4 sm:grid-cols-3">
          <Field label="Total stalls" placeholder="12" />
          <Field label="Zones" placeholder="A, B, C" />
          <Field label="Base price" placeholder="₹9,000" />
        </div>
      </Card>
    </div>
  );
}

function Rules() {
  return (
    <Card className="space-y-5 p-6">
      <h2 className="text-[15px] font-semibold">Rules & policies</h2>
      <label className="block">
        <span className="mb-1.5 block text-[12px] font-medium text-fg-muted">Tournament rules</span>
        <textarea
          rows={7}
          placeholder="Squad of 11–15. Minimum 11 present at toss…"
          className="w-full rounded-xl border border-line bg-surface px-3.5 py-3 text-[14px] outline-none transition-colors duration-[var(--dur)] placeholder:text-fg-subtle focus:border-[var(--accent)]"
        />
      </label>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Refund policy" placeholder="Full refund if cancelled before the first ball" />
        <Field label="Contact" placeholder="organizer@deccansports.in" />
      </div>
    </Card>
  );
}

function Review({ sport }: { sport: SportId }) {
  const s = SPORT_BY_ID[sport];
  const checks = [
    { ok: true, text: "Basics complete" },
    { ok: true, text: `${s.name} format set — T20, Groups + Knockout` },
    { ok: true, text: "Entry fee ₹12,000, 8 teams max" },
    { ok: true, text: "Two ticket types configured" },
    { ok: false, text: "Payouts not connected — paid flows stay disabled until you do" },
  ];
  return (
    <div className="space-y-4">
      <Card className="p-6">
        <h2 className="text-[15px] font-semibold">Before you publish</h2>
        <ul className="mt-4 space-y-2.5">
          {checks.map((c) => (
            <li key={c.text} className="flex items-start gap-2.5 text-[13.5px]">
              <span
                className={cx(
                  "mt-0.5 grid h-4.5 w-4.5 shrink-0 place-items-center rounded-full",
                  c.ok
                    ? "bg-[color-mix(in_oklab,var(--ok)_18%,transparent)] text-[var(--ok)]"
                    : "bg-[color-mix(in_oklab,var(--warn)_18%,transparent)] text-[var(--warn)]",
                )}
                style={{ width: 18, height: 18 }}
              >
                {c.ok ? <Check size={11} /> : <AlertTriangle size={11} />}
              </span>
              <span className={c.ok ? "text-fg-muted" : "text-fg"}>{c.text}</span>
            </li>
          ))}
        </ul>
        <AddButton label="Connect payouts" className="mt-5" />
      </Card>

      <Card className="p-6">
        <div className="flex items-center justify-between">
          <h2 className="text-[15px] font-semibold">Listing preview</h2>
          <Badge tone="neutral">Draft</Badge>
        </div>
        <p className="mt-2 text-[12.5px] text-fg-muted">
          This is exactly how the tournament appears on the marketplace once
          published.
        </p>
      </Card>
    </div>
  );
}

export { LIVE_SPORTS };

function AddButton({ label, className }: { label: string; className?: string }) {
  const toast = useToast();
  return (
    <Button
      variant="secondary"
      size="sm"
      className={className}
      onClick={() => toast({ title: label, body: "Wired to the real flow in the next phase.", tone: "info" })}
    >
      {label}
    </Button>
  );
}
