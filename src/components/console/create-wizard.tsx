"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "motion/react";
import { AlertTriangle, CalendarDays, Check, Eye, MapPin, Plus, Trash2, Upload, Users, X } from "lucide-react";
import { PageTitle } from "@/components/layouts/console-shell";
import { Badge, Button, Card, Progress } from "@/components/kit";
import { useToast } from "@/components/kit/toast";
import { Confetti } from "@/components/fx/confetti";
import { SPORTS, SPORT_BY_ID, type SportId } from "@/lib/sports";
import { BANNER_PRESETS, LOGO_PRESETS, bannerById, logoById } from "@/lib/presets";
import { addDraft, slugify } from "@/lib/drafts";
import { formatNumber } from "@/lib/money";
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

type TicketType = { id: string; name: string; price: string; capacity: string };
type SponsorTier = { id: string; tier: string; price: string; slots: string };

type Form = {
  sport: SportId;
  name: string;
  blurb: string;
  city: string;
  venue: string;
  start: string;
  end: string;
  bannerId: string;
  logoId: string;
  customBanner: string | null;
  customLogo: string | null;

  matchType: string;
  format: string;
  ballType: string;
  winPoints: string;
  tiePoints: string;
  nrPoints: string;
  squadMin: string;
  squadMax: string;
  maxTeams: string;

  entryFee: string;
  currency: string;
  regOpen: string;
  regClose: string;
  approval: "manual" | "auto";

  sellTickets: "yes" | "no";
  tickets: TicketType[];

  sellSponsors: "yes" | "no";
  sponsors: SponsorTier[];
  stallCount: string;
  stallZones: string;
  stallPrice: string;

  rules: string;
  refundPolicy: string;
  contact: string;
};

const BLANK: Form = {
  sport: "cricket",
  name: "",
  blurb: "",
  city: "",
  venue: "",
  start: "",
  end: "",
  bannerId: "turf",
  logoId: "ball",
  customBanner: null,
  customLogo: null,

  matchType: "t20",
  format: "league",
  ballType: "leather",
  winPoints: "2",
  tiePoints: "1",
  nrPoints: "1",
  squadMin: "11",
  squadMax: "15",
  maxTeams: "8",

  entryFee: "0",
  currency: "INR",
  regOpen: "",
  regClose: "",
  approval: "manual",

  sellTickets: "yes",
  tickets: [
    { id: "t1", name: "General", price: "0", capacity: "400" },
    { id: "t2", name: "Premium", price: "200", capacity: "180" },
  ],

  sellSponsors: "yes",
  sponsors: [
    { id: "s1", tier: "Gold", price: "120000", slots: "4" },
    { id: "s2", tier: "Silver", price: "50000", slots: "8" },
  ],
  stallCount: "12",
  stallZones: "A, B, C",
  stallPrice: "9000",

  rules: "",
  refundPolicy: "",
  contact: "",
};

let seq = 0;
const uid = (p: string) => `${p}${++seq}-${Date.now().toString(36)}`;

/* ------------------------------------------------------------- validation */

type Errors = Partial<Record<keyof Form, string>>;

function validateStep(step: number, f: Form): Errors {
  const e: Errors = {};

  if (step === 0) {
    if (!f.name.trim()) e.name = "Give the tournament a name.";
    if (!f.city.trim()) e.city = "Which city is it in?";
    if (!f.start) e.start = "Pick a start date.";
    if (!f.end) e.end = "Pick an end date.";
    if (f.start && f.end && f.end < f.start)
      e.end = "The end date cannot be before the start date.";
  }

  if (step === 1) {
    const max = Number(f.maxTeams);
    if (!Number.isFinite(max) || max < 2) e.maxTeams = "At least two teams.";
    if (Number(f.squadMin) > Number(f.squadMax))
      e.squadMax = "Maximum squad cannot be smaller than the minimum.";
  }

  if (step === 2) {
    if (f.entryFee === "" || Number(f.entryFee) < 0)
      e.entryFee = "Enter 0 for a free tournament.";
    if (!f.regOpen) e.regOpen = "Pick a date registration opens.";
    if (!f.regClose) e.regClose = "Pick a date registration closes.";
    if (f.regOpen && f.regClose && f.regClose < f.regOpen)
      e.regClose = "Registration cannot close before it opens.";
    if (f.regClose && f.start && f.regClose > f.start)
      e.regClose = "Registration should close on or before the first match.";
  }

  if (step === 3 && f.sellTickets === "yes") {
    if (f.tickets.length === 0) e.tickets = "Add at least one ticket type.";
    else if (f.tickets.some((t) => !t.name.trim()))
      e.tickets = "Every ticket type needs a name.";
  }

  return e;
}

/* ------------------------------------------------------------------ main */

export function CreateWizard() {
  const router = useRouter();
  const toast = useToast();
  const [step, setStep] = useState(0);
  const [dir, setDir] = useState(1);
  const [form, setForm] = useState<Form>(BLANK);
  const [errors, setErrors] = useState<Errors>({});
  const [published, setPublished] = useState(false);
  const [preview, setPreview] = useState(false);

  const set = <K extends keyof Form>(key: K, value: Form[K]) => {
    setForm((f) => ({ ...f, [key]: value }));
    setErrors((e) => (key in e ? { ...e, [key]: undefined } : e));
  };

  const go = (next: number) => {
    // Going forward validates; going back never traps you.
    if (next > step) {
      const e = validateStep(step, form);
      if (Object.keys(e).length) {
        setErrors(e);
        toast({
          title: "Check this step",
          body: Object.values(e)[0] as string,
          tone: "warn",
        });
        return;
      }
    }
    setErrors({});
    setDir(next > step ? 1 : -1);
    setStep(Math.max(0, Math.min(STEPS.length - 1, next)));
  };

  const publish = () => {
    // Re-check every step, not just the last one.
    for (let i = 0; i < STEPS.length; i++) {
      const e = validateStep(i, form);
      if (Object.keys(e).length) {
        setErrors(e);
        setStep(i);
        toast({
          title: "Something is missing",
          body: Object.values(e)[0] as string,
          tone: "warn",
        });
        return;
      }
    }

    const slug = slugify(form.name);
    addDraft({
      id: uid("tr"),
      slug,
      name: form.name.trim(),
      sport: form.sport,
      city: form.city.trim(),
      venue: form.venue.trim(),
      start: form.start,
      end: form.end,
      format: SPORT_BY_ID[form.sport].formats.find((x) => x.id === form.format)?.label ?? form.format,
      matchType:
        SPORT_BY_ID[form.sport].matchTypes.find((x) => x.id === form.matchType)?.label ??
        form.matchType,
      ballType: form.ballType,
      entryFee: Math.round(Number(form.entryFee || 0) * 100),
      maxTeams: Number(form.maxTeams || 0),
      bannerId: form.bannerId,
      logoId: form.logoId,
      createdAt: new Date().toISOString(),
    });

    setPublished(true);
    toast({
      title: "Tournament published",
      body: `${form.name.trim()} is live on the marketplace.`,
      tone: "ok",
    });
    // Let the confetti land, then show it in the list.
    setTimeout(() => router.push("/dashboard/tournaments"), 900);
  };

  const sport = SPORT_BY_ID[form.sport];

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
            data-testid="preview"
            onClick={() => setPreview(true)}
          >
            <Eye size={14} /> Preview
          </Button>
        }
      />

      <div className="mb-5">
        <Progress value={step + 1} max={STEPS.length} />
      </div>

      <div className="grid gap-5 lg:grid-cols-[13rem_1fr]">
        <ol className="flex gap-2 overflow-x-auto scroll-thin lg:flex-col lg:overflow-visible">
          {STEPS.map((s, i) => {
            const done = i < step;
            const on = i === step;
            return (
              <li key={s} className="shrink-0 lg:shrink">
                <button
                  data-testid={`step-${i}`}
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
                {step === 0 ? <Basics form={form} set={set} errors={errors} /> : null}
                {step === 1 ? <Format form={form} set={set} errors={errors} sport={sport} /> : null}
                {step === 2 ? <Registration form={form} set={set} errors={errors} /> : null}
                {step === 3 ? <Tickets form={form} set={set} errors={errors} /> : null}
                {step === 4 ? <Extras form={form} set={set} /> : null}
                {step === 5 ? <Rules form={form} set={set} /> : null}
                {step === 6 ? <Review form={form} sport={sport} /> : null}
              </motion.div>
            </AnimatePresence>
          </div>

          <div className="mt-6 flex items-center justify-between gap-3">
            <Button variant="ghost" onClick={() => go(step - 1)} disabled={step === 0}>
              Back
            </Button>
            {step < STEPS.length - 1 ? (
              <Button variant="primary" onClick={() => go(step + 1)} data-testid="continue">
                Save and continue
              </Button>
            ) : (
              <span className="relative">
                {published ? <Confetti /> : null}
                <Button variant="primary" onClick={publish} data-testid="publish">
                  {published ? "Published ✓" : "Publish to marketplace"}
                </Button>
              </span>
            )}
          </div>
        </div>
      </div>

      <AnimatePresence>
        {preview ? <PreviewDialog form={form} onClose={() => setPreview(false)} /> : null}
      </AnimatePresence>
    </>
  );
}

/* -------------------------------------------------------------- preview --
   Shows the marketplace listing built from what has been filled in so far,
   so "Preview" means something rather than describing itself. */

function PreviewDialog({ form, onClose }: { form: Form; onClose: () => void }) {
  const sport = SPORT_BY_ID[form.sport];
  const banner = bannerById(form.bannerId);
  const logo = logoById(form.logoId);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  const fmt = (d: string) =>
    d
      ? new Date(d + "T00:00:00Z").toLocaleDateString("en-GB", {
          day: "numeric",
          month: "short",
          timeZone: "UTC",
        })
      : "—";

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      className="fixed inset-0 z-[80] grid place-items-center bg-black/60 p-4 backdrop-blur-sm"
      onClick={onClose}
      data-testid="preview-dialog"
    >
      <motion.div
        role="dialog"
        aria-label="Listing preview"
        initial={{ opacity: 0, y: 18, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 12, scale: 0.98 }}
        transition={{ type: "spring", stiffness: 320, damping: 30, mass: 0.6 }}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-sm overflow-hidden rounded-2xl border border-line bg-bg-elev shadow-[var(--shadow-lift)]"
      >
        <div className="flex items-center justify-between border-b border-line px-4 py-2.5">
          <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-fg-subtle">
            Marketplace listing
          </span>
          <button
            onClick={onClose}
            aria-label="Close preview"
            data-testid="preview-close"
            className="grid h-7 w-7 place-items-center rounded-lg text-fg-subtle transition-colors duration-[var(--dur)] hover:bg-surface hover:text-fg"
          >
            <X size={15} />
          </button>
        </div>

        {/* the card exactly as browse renders it */}
        <div className={cx("relative h-32 bg-gradient-to-br", banner.className)}>
          <div className="absolute inset-0 turf-bg opacity-50" />
          {form.customBanner ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={form.customBanner} alt="" className="absolute inset-0 h-full w-full object-cover" />
          ) : null}
          <div className="absolute inset-0 bg-[linear-gradient(to_top,var(--bg-elev),transparent_70%)]" />
          <span className="absolute left-3 top-3">
            <Badge tone="open">Registration open</Badge>
          </span>
          <span className="absolute bottom-3 left-3 inline-flex items-center gap-1.5 rounded-full border border-line bg-[color-mix(in_oklab,var(--bg)_70%,transparent)] px-2.5 py-1 text-[11px] font-medium text-fg-muted">
            {form.customLogo ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={form.customLogo} alt="" className="h-3.5 w-3.5 rounded object-cover" />
            ) : (
              <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke={logo.colour} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d={logo.glyph} />
              </svg>
            )}
            {sport.name}
            <span className="text-fg-subtle">·</span>
            {sport.matchTypes.find((m) => m.id === form.matchType)?.label ?? form.matchType}
          </span>
        </div>

        <div className="p-4">
          <h3 className="text-[15px] font-semibold leading-snug tracking-tight" data-testid="preview-name">
            {form.name.trim() || "Untitled tournament"}
          </h3>
          <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-[12px] text-fg-muted">
            <span className="inline-flex items-center gap-1.5">
              <MapPin size={12} /> {form.city.trim() || "City not set"}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <CalendarDays size={12} /> {fmt(form.start)} – {fmt(form.end)}
            </span>
          </div>

          <div className="mt-4">
            <div className="mb-1.5 flex items-center justify-between text-[11.5px]">
              <span className="inline-flex items-center gap-1.5 text-fg-muted">
                <Users size={12} /> 0/{form.maxTeams || "—"} {sport.entrant.many.toLowerCase()}
              </span>
              <span className="font-semibold">
                {Number(form.entryFee) > 0
                  ? `${form.currency} ${formatNumber(Number(form.entryFee))} entry`
                  : "Free entry"}
              </span>
            </div>
            <Progress value={0} max={Number(form.maxTeams) || 1} />
          </div>
        </div>

        <p className="border-t border-line px-4 py-2.5 text-[11px] text-fg-subtle">
          Updates as you fill the form. Nothing is published yet.
        </p>
      </motion.div>
    </motion.div>
  );
}

/* ------------------------------------------------------------ form pieces */

type Setter = <K extends keyof Form>(key: K, value: Form[K]) => void;

function Field({
  label,
  value,
  onChange,
  placeholder,
  hint,
  error,
  type = "text",
  testId,
  min,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  hint?: string;
  error?: string;
  type?: "text" | "date" | "number";
  testId?: string;
  min?: string;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-[12px] font-medium text-fg-muted">{label}</span>
      <input
        data-testid={testId}
        type={type}
        value={value}
        min={min}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={cx(
          "h-11 w-full rounded-xl border bg-surface px-3.5 text-[14px] outline-none transition-colors duration-[var(--dur)] placeholder:text-fg-subtle",
          error ? "border-[var(--live)]" : "border-line focus:border-[var(--accent)]",
        )}
      />
      {error ? (
        <span
          data-testid={testId ? `${testId}-error` : undefined}
          className="mt-1.5 flex items-center gap-1.5 text-[11.5px] text-[var(--live)]"
        >
          <AlertTriangle size={11} /> {error}
        </span>
      ) : hint ? (
        <span className="mt-1.5 block text-[11.5px] text-fg-subtle">{hint}</span>
      ) : null}
    </label>
  );
}

function Choice({
  label,
  options,
  value,
  onChange,
  name,
}: {
  label: string;
  options: { id: string; label: string; disabled?: boolean }[];
  value: string;
  onChange: (v: string) => void;
  name: string;
}) {
  return (
    <div>
      <p className="mb-2 text-[12px] font-medium text-fg-muted">{label}</p>
      <div className="flex flex-wrap gap-2" role="group" aria-label={label}>
        {options.map((o) => {
          const on = value === o.id;
          return (
            <button
              key={o.id}
              type="button"
              data-testid={`${name}-${o.id}`}
              aria-pressed={on}
              disabled={o.disabled}
              onClick={() => onChange(o.id)}
              className={cx(
                "rounded-xl border px-3.5 py-2.5 text-[13px] font-medium transition-[border-color,background-color,transform] duration-[var(--dur)] ease-[var(--ease-out)]",
                o.disabled
                  ? "cursor-not-allowed border-line text-fg-subtle opacity-55"
                  : on
                    ? "border-[var(--accent)] bg-[color-mix(in_oklab,var(--accent)_12%,transparent)] text-[var(--accent)]"
                    : "border-line bg-surface text-fg-muted hover:-translate-y-0.5 hover:border-line-strong hover:text-fg",
              )}
            >
              {o.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

/* ----------------------------------------------------------------- steps */

function Basics({ form, set, errors }: { form: Form; set: Setter; errors: Errors }) {
  const bannerFile = useRef<HTMLInputElement>(null);
  const logoFile = useRef<HTMLInputElement>(null);

  const pickFile = (input: HTMLInputElement | null, key: "customBanner" | "customLogo") => {
    const file = input?.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    set(key, url);
  };

  return (
    <Card className="space-y-5 p-6">
      <h2 className="text-[15px] font-semibold">Basics</h2>

      <Choice
        label="Sport"
        name="sport"
        value={form.sport}
        onChange={(v) => set("sport", v as SportId)}
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
        <Field label="Tournament name" testId="name" value={form.name} onChange={(v) => set("name", v)} placeholder="Deccan Premier League 2026" error={errors.name} />
        <Field label="Short description" testId="blurb" value={form.blurb} onChange={(v) => set("blurb", v)} placeholder="Eight franchises, 22 nights" />
        <Field label="City" testId="city" value={form.city} onChange={(v) => set("city", v)} placeholder="Mumbai" error={errors.city} />
        <Field label="Venue" testId="venue" value={form.venue} onChange={(v) => set("venue", v)} placeholder="Wankhede Ground B" />
        <Field label="Starts" testId="start" type="date" value={form.start} onChange={(v) => set("start", v)} error={errors.start} />
        <Field
          label="Ends"
          testId="end"
          type="date"
          value={form.end}
          min={form.start || undefined}
          onChange={(v) => set("end", v)}
          error={errors.end}
          hint={form.start ? "Must be on or after the start date." : undefined}
        />
      </div>

      {/* banner presets */}
      <div>
        <p className="mb-2 text-[12px] font-medium text-fg-muted">Banner</p>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          {BANNER_PRESETS.map((b) => {
            const on = !form.customBanner && form.bannerId === b.id;
            return (
              <button
                key={b.id}
                type="button"
                data-testid={`banner-${b.id}`}
                aria-pressed={on}
                onClick={() => {
                  set("customBanner", null);
                  set("bannerId", b.id);
                }}
                className={cx(
                  "group relative h-16 overflow-hidden rounded-xl border bg-gradient-to-br transition-[border-color,transform] duration-[var(--dur)] ease-[var(--ease-out)] hover:-translate-y-0.5",
                  b.className,
                  on ? "border-[var(--accent)]" : "border-line",
                )}
              >
                <span className="absolute inset-0 turf-bg opacity-50" />
                <span className="absolute bottom-1.5 left-2 text-[11px] text-white/80">{b.label}</span>
                {on ? (
                  <span className="absolute right-1.5 top-1.5 grid h-5 w-5 place-items-center rounded-full bg-[var(--accent)] text-[var(--accent-fg)]">
                    <Check size={11} />
                  </span>
                ) : null}
              </button>
            );
          })}
        </div>
        <div className="mt-2 flex items-center gap-2">
          <input ref={bannerFile} type="file" accept="image/*" data-testid="banner-file" className="hidden" onChange={() => pickFile(bannerFile.current, "customBanner")} />
          <Button variant="secondary" size="sm" onClick={() => bannerFile.current?.click()}>
            <Upload size={13} /> Upload your own
          </Button>
          {form.customBanner ? (
            <span className="inline-flex items-center gap-2 text-[12px] text-[var(--accent)]">
              Custom banner selected
              <button type="button" onClick={() => set("customBanner", null)} className="text-fg-subtle hover:text-fg">
                clear
              </button>
            </span>
          ) : null}
        </div>
      </div>

      {/* logo presets */}
      <div>
        <p className="mb-2 text-[12px] font-medium text-fg-muted">Logo</p>
        <div className="flex flex-wrap gap-2">
          {LOGO_PRESETS.map((l) => {
            const on = !form.customLogo && form.logoId === l.id;
            return (
              <button
                key={l.id}
                type="button"
                data-testid={`logo-${l.id}`}
                aria-pressed={on}
                title={l.label}
                onClick={() => {
                  set("customLogo", null);
                  set("logoId", l.id);
                }}
                className={cx(
                  "grid h-12 w-12 place-items-center rounded-xl border transition-[border-color,transform] duration-[var(--dur)] ease-[var(--ease-out)] hover:-translate-y-0.5",
                  on ? "border-[var(--accent)] bg-[color-mix(in_oklab,var(--accent)_12%,transparent)]" : "border-line bg-surface",
                )}
              >
                <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke={l.colour} strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
                  <path d={l.glyph} />
                </svg>
              </button>
            );
          })}
        </div>
        <div className="mt-2 flex items-center gap-2">
          <input ref={logoFile} type="file" accept="image/*" data-testid="logo-file" className="hidden" onChange={() => pickFile(logoFile.current, "customLogo")} />
          <Button variant="secondary" size="sm" onClick={() => logoFile.current?.click()}>
            <Upload size={13} /> Upload your own
          </Button>
          {form.customLogo ? (
            <span className="inline-flex items-center gap-2 text-[12px] text-[var(--accent)]">
              Custom logo selected
              <button type="button" onClick={() => set("customLogo", null)} className="text-fg-subtle hover:text-fg">
                clear
              </button>
            </span>
          ) : null}
        </div>
      </div>
    </Card>
  );
}

function Format({
  form,
  set,
  errors,
  sport,
}: {
  form: Form;
  set: Setter;
  errors: Errors;
  sport: (typeof SPORT_BY_ID)[SportId];
}) {
  return (
    <Card className="space-y-5 p-6">
      <h2 className="text-[15px] font-semibold">{sport.name} format</h2>

      <Choice label="Match type" name="matchtype" value={form.matchType} onChange={(v) => set("matchType", v)} options={sport.matchTypes} />
      <Choice label="Tournament format" name="format" value={form.format} onChange={(v) => set("format", v)} options={sport.formats} />
      <Choice
        label="Ball type"
        name="balltype"
        value={form.ballType}
        onChange={(v) => set("ballType", v)}
        options={[
          { id: "tennis", label: "Tennis" },
          { id: "leather", label: "Leather" },
          { id: "other", label: "Other" },
        ]}
      />

      <div className="grid gap-4 sm:grid-cols-3">
        <Field label="Points for a win" type="number" testId="winpoints" value={form.winPoints} onChange={(v) => set("winPoints", v)} />
        <Field label="Points for a tie" type="number" value={form.tiePoints} onChange={(v) => set("tiePoints", v)} />
        <Field label="Points for no result" type="number" value={form.nrPoints} onChange={(v) => set("nrPoints", v)} />
      </div>
      <div className="grid gap-4 sm:grid-cols-3">
        <Field label="Squad minimum" type="number" value={form.squadMin} onChange={(v) => set("squadMin", v)} />
        <Field label="Squad maximum" type="number" testId="squadmax" value={form.squadMax} onChange={(v) => set("squadMax", v)} error={errors.squadMax} />
        <Field label={`Max ${sport.entrant.many.toLowerCase()}`} type="number" testId="maxteams" value={form.maxTeams} onChange={(v) => set("maxTeams", v)} error={errors.maxTeams} />
      </div>
    </Card>
  );
}

function Registration({ form, set, errors }: { form: Form; set: Setter; errors: Errors }) {
  const fee = Number(form.entryFee || 0);
  const smidigFee = Math.round(fee * 0.05);

  return (
    <Card className="space-y-5 p-6">
      <h2 className="text-[15px] font-semibold">Registration</h2>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Entry fee" type="number" testId="entryfee" value={form.entryFee} onChange={(v) => set("entryFee", v)} placeholder="12000" hint="Set 0 for a free tournament." error={errors.entryFee} />
        <Field label="Currency" testId="currency" value={form.currency} onChange={(v) => set("currency", v)} placeholder="INR" />
        <Field label="Registration opens" type="date" testId="regopen" value={form.regOpen} onChange={(v) => set("regOpen", v)} error={errors.regOpen} />
        <Field
          label="Registration closes"
          type="date"
          testId="regclose"
          value={form.regClose}
          min={form.regOpen || undefined}
          onChange={(v) => set("regClose", v)}
          error={errors.regClose}
          hint={form.regOpen ? "On or after the opening date, and before the first match." : undefined}
        />
      </div>

      <Choice
        label="Approval"
        name="approval"
        value={form.approval}
        onChange={(v) => set("approval", v as Form["approval"])}
        options={[
          { id: "manual", label: "I approve each team" },
          { id: "auto", label: "Auto-approve on payment" },
        ]}
      />

      <Card className="flex items-start gap-3 bg-[color-mix(in_oklab,var(--accent)_7%,transparent)] p-4">
        <AlertTriangle size={16} className="mt-0.5 shrink-0 text-[var(--accent)]" />
        <p className="text-[12.5px] leading-relaxed text-fg-muted" data-testid="fee-preview">
          {fee > 0
            ? `Smidig keeps 5% of each entry fee. On a ${form.currency} ${formatNumber(fee)} entry you receive ${form.currency} ${formatNumber(fee - smidigFee)} and Smidig earns ${form.currency} ${formatNumber(smidigFee)}.`
            : "Free entry — no payment is taken and Smidig charges nothing."}
        </p>
      </Card>
    </Card>
  );
}

function Tickets({ form, set, errors }: { form: Form; set: Setter; errors: Errors }) {
  const update = (id: string, patch: Partial<TicketType>) =>
    set("tickets", form.tickets.map((t) => (t.id === id ? { ...t, ...patch } : t)));

  return (
    <Card className="space-y-5 p-6">
      <h2 className="text-[15px] font-semibold">Ticket defaults</h2>
      <p className="-mt-3 text-[12.5px] text-fg-muted">
        These apply to every match and can be overridden per match later.
      </p>

      <Choice
        label="Sell tickets?"
        name="selltickets"
        value={form.sellTickets}
        onChange={(v) => set("sellTickets", v as Form["sellTickets"])}
        options={[
          { id: "yes", label: "Yes" },
          { id: "no", label: "No tickets" },
        ]}
      />

      {form.sellTickets === "yes" ? (
        <>
          <div className="space-y-3" data-testid="ticket-rows">
            <AnimatePresence initial={false}>
              {form.tickets.map((t) => (
                <motion.div
                  key={t.id}
                  layout
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
                  className="grid gap-3 rounded-xl border border-line bg-surface p-4 sm:grid-cols-[1fr_1fr_1fr_auto]"
                >
                  <Field label="Name" value={t.name} onChange={(v) => update(t.id, { name: v })} placeholder="General" />
                  <Field label="Price" type="number" value={t.price} onChange={(v) => update(t.id, { price: v })} placeholder="0" />
                  <Field label="Capacity" type="number" value={t.capacity} onChange={(v) => update(t.id, { capacity: v })} placeholder="400" />
                  <button
                    type="button"
                    aria-label={`Remove ${t.name || "ticket type"}`}
                    onClick={() => set("tickets", form.tickets.filter((x) => x.id !== t.id))}
                    className="mt-6 grid h-11 w-11 place-items-center rounded-xl border border-line text-fg-subtle transition-colors duration-[var(--dur)] hover:border-[var(--live)] hover:text-[var(--live)]"
                  >
                    <Trash2 size={15} />
                  </button>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {errors.tickets ? (
            <p className="flex items-center gap-1.5 text-[11.5px] text-[var(--live)]">
              <AlertTriangle size={11} /> {errors.tickets}
            </p>
          ) : null}

          <Button
            variant="secondary"
            size="sm"
            data-testid="add-ticket"
            onClick={() =>
              set("tickets", [
                ...form.tickets,
                { id: uid("tt"), name: "", price: "0", capacity: "100" },
              ])
            }
          >
            <Plus size={14} /> Add ticket type
          </Button>
        </>
      ) : (
        <p className="text-[13px] text-fg-muted">
          No tickets will be sold. Spectators can still follow the live scores.
        </p>
      )}
    </Card>
  );
}

function Extras({ form, set }: { form: Form; set: Setter }) {
  const update = (id: string, patch: Partial<SponsorTier>) =>
    set("sponsors", form.sponsors.map((s) => (s.id === id ? { ...s, ...patch } : s)));

  return (
    <div className="space-y-4">
      <Card className="space-y-5 p-6">
        <h2 className="text-[15px] font-semibold">Sponsors</h2>
        <Choice
          label="Sell sponsorships?"
          name="sellsponsors"
          value={form.sellSponsors}
          onChange={(v) => set("sellSponsors", v as Form["sellSponsors"])}
          options={[
            { id: "yes", label: "Yes" },
            { id: "no", label: "Not this time" },
          ]}
        />

        {form.sellSponsors === "yes" ? (
          <>
            <div className="space-y-3" data-testid="sponsor-rows">
              <AnimatePresence initial={false}>
                {form.sponsors.map((s) => (
                  <motion.div
                    key={s.id}
                    layout
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
                    className="grid gap-3 rounded-xl border border-line bg-surface p-4 sm:grid-cols-[1fr_1fr_1fr_auto]"
                  >
                    <Field label="Tier" value={s.tier} onChange={(v) => update(s.id, { tier: v })} placeholder="Gold" />
                    <Field label="Price" type="number" value={s.price} onChange={(v) => update(s.id, { price: v })} />
                    <Field label="Slots" type="number" value={s.slots} onChange={(v) => update(s.id, { slots: v })} />
                    <button
                      type="button"
                      aria-label={`Remove ${s.tier || "tier"}`}
                      onClick={() => set("sponsors", form.sponsors.filter((x) => x.id !== s.id))}
                      className="mt-6 grid h-11 w-11 place-items-center rounded-xl border border-line text-fg-subtle transition-colors duration-[var(--dur)] hover:border-[var(--live)] hover:text-[var(--live)]"
                    >
                      <Trash2 size={15} />
                    </button>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
            <Button
              variant="secondary"
              size="sm"
              data-testid="add-tier"
              onClick={() =>
                set("sponsors", [...form.sponsors, { id: uid("sp"), tier: "", price: "0", slots: "1" }])
              }
            >
              <Plus size={14} /> Add a tier
            </Button>
          </>
        ) : null}
      </Card>

      <Card className="space-y-5 p-6">
        <h2 className="text-[15px] font-semibold">Food stalls</h2>
        <div className="grid gap-4 sm:grid-cols-3">
          <Field label="Total stalls" type="number" testId="stallcount" value={form.stallCount} onChange={(v) => set("stallCount", v)} />
          <Field label="Zones" value={form.stallZones} onChange={(v) => set("stallZones", v)} />
          <Field label="Base price" type="number" value={form.stallPrice} onChange={(v) => set("stallPrice", v)} />
        </div>
      </Card>
    </div>
  );
}

function Rules({ form, set }: { form: Form; set: Setter }) {
  return (
    <Card className="space-y-5 p-6">
      <h2 className="text-[15px] font-semibold">Rules & policies</h2>
      <label className="block">
        <span className="mb-1.5 block text-[12px] font-medium text-fg-muted">Tournament rules</span>
        <textarea
          data-testid="rules"
          rows={7}
          value={form.rules}
          onChange={(e) => set("rules", e.target.value)}
          placeholder="Squad of 11–15. Minimum 11 present at toss…"
          className="w-full rounded-xl border border-line bg-surface px-3.5 py-3 text-[14px] outline-none transition-colors duration-[var(--dur)] placeholder:text-fg-subtle focus:border-[var(--accent)]"
        />
      </label>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Refund policy" value={form.refundPolicy} onChange={(v) => set("refundPolicy", v)} placeholder="Full refund if cancelled before the first ball" />
        <Field label="Contact" testId="contact" value={form.contact} onChange={(v) => set("contact", v)} placeholder="organizer@club.in" />
      </div>
    </Card>
  );
}

function Review({ form, sport }: { form: Form; sport: (typeof SPORT_BY_ID)[SportId] }) {
  const banner = bannerById(form.bannerId);
  const logo = logoById(form.logoId);

  const checks = useMemo(() => {
    const all: { ok: boolean; text: string }[] = [];
    for (let i = 0; i < 6; i++) {
      const e = validateStep(i, form);
      const names = ["Basics", "Format", "Registration", "Tickets", "Sponsors & stalls", "Rules"];
      all.push({
        ok: Object.keys(e).length === 0,
        text:
          Object.keys(e).length === 0
            ? `${names[i]} complete`
            : `${names[i]} — ${Object.values(e)[0]}`,
      });
    }
    all.push({ ok: false, text: "Payouts not connected — paid flows stay disabled until you do" });
    return all;
  }, [form]);

  return (
    <div className="space-y-4">
      <Card className="overflow-hidden">
        <div className={cx("relative h-28 bg-gradient-to-br", banner.className)}>
          <div className="absolute inset-0 turf-bg opacity-50" />
          {form.customBanner ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={form.customBanner} alt="" className="absolute inset-0 h-full w-full object-cover" />
          ) : null}
          <div className="absolute inset-0 bg-[linear-gradient(to_top,var(--bg-elev),transparent_70%)]" />
          <span className="absolute bottom-3 left-4 grid h-10 w-10 place-items-center rounded-xl border border-line bg-bg-elev">
            {form.customLogo ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={form.customLogo} alt="" className="h-7 w-7 rounded object-cover" />
            ) : (
              <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke={logo.colour} strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
                <path d={logo.glyph} />
              </svg>
            )}
          </span>
        </div>
        <div className="p-5">
          <h3 className="text-[15px] font-semibold" data-testid="review-name">
            {form.name || "Untitled tournament"}
          </h3>
          <p className="mt-1 text-[12.5px] text-fg-muted">
            {[form.city, form.venue].filter(Boolean).join(" · ") || "No venue yet"}
          </p>
          <dl className="mt-4 grid gap-x-6 gap-y-3 sm:grid-cols-2">
            {[
              ["Sport", sport.name],
              ["Match type", sport.matchTypes.find((m) => m.id === form.matchType)?.label ?? "—"],
              ["Format", sport.formats.find((f) => f.id === form.format)?.label ?? "—"],
              ["Ball", form.ballType],
              ["Dates", form.start && form.end ? `${form.start} → ${form.end}` : "—"],
              ["Registration", form.regOpen && form.regClose ? `${form.regOpen} → ${form.regClose}` : "—"],
              ["Entry fee", Number(form.entryFee) > 0 ? `${form.currency} ${formatNumber(Number(form.entryFee))}` : "Free"],
              ["Approval", form.approval === "manual" ? "Manual" : "Automatic"],
              ["Max teams", form.maxTeams],
              ["Tickets", form.sellTickets === "yes" ? `${form.tickets.length} type(s)` : "Not selling"],
            ].map(([k, v]) => (
              <div key={k}>
                <dt className="text-[11px] uppercase tracking-wider text-fg-subtle">{k}</dt>
                <dd className="mt-0.5 text-[13.5px]">{v}</dd>
              </div>
            ))}
          </dl>
        </div>
      </Card>

      <Card className="p-6">
        <div className="flex items-center justify-between">
          <h2 className="text-[15px] font-semibold">Before you publish</h2>
          <Badge tone="neutral">Draft</Badge>
        </div>
        <ul className="mt-4 space-y-2.5">
          {checks.map((c) => (
            <li key={c.text} className="flex items-start gap-2.5 text-[13.5px]">
              <span
                className={cx(
                  "mt-0.5 grid shrink-0 place-items-center rounded-full",
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
      </Card>
    </div>
  );
}
