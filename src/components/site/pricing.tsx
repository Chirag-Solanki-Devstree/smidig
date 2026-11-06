"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Reveal, RevealItem } from "@/components/fx/reveal";
import { TiltCard } from "@/components/fx/tilt-card";
import { GhostButton, PrimaryButton, SectionLabel, Swap } from "@/components/ui";
import { PLANS } from "@/lib/content";
import { cx } from "@/lib/cx";

export function Pricing() {
  const [yearly, setYearly] = useState(true);

  return (
    <section id="pricing" className="relative py-24 sm:py-32">
      <div className="shell">
        <Reveal className="mx-auto max-w-2xl text-center">
          <RevealItem>
            <SectionLabel>Pricing</SectionLabel>
          </RevealItem>
          <RevealItem>
            <h2 className="display mt-5 text-[clamp(2rem,4.4vw,3rem)]">
              Priced per season, not per headache.
            </h2>
          </RevealItem>
          <RevealItem>
            <div className="mt-8 inline-flex items-center rounded-full border border-line bg-surface p-1">
              {(["Monthly", "Yearly"] as const).map((l, i) => {
                const on = (i === 1) === yearly;
                return (
                  <button
                    key={l}
                    onClick={() => setYearly(i === 1)}
                    className="relative rounded-full px-4 py-1.5 text-[13px] font-medium"
                  >
                    {on ? (
                      <motion.span
                        layoutId="billing-pill"
                        transition={{ type: "spring", stiffness: 340, damping: 30, mass: 0.6 }}
                        className="absolute inset-0 rounded-full bg-[linear-gradient(110deg,var(--accent),var(--accent-2))]"
                      />
                    ) : null}
                    <span className={cx("relative", on ? "text-[var(--accent-fg)]" : "text-fg-muted")}>
                      {l}
                      {i === 1 ? <span className="ml-1.5 opacity-80">−20%</span> : null}
                    </span>
                  </button>
                );
              })}
            </div>
          </RevealItem>
        </Reveal>

        <Reveal className="mt-12 grid gap-4 lg:grid-cols-3" stagger={0.1} amount={0.12}>
          {PLANS.map((p) => {
            const price = yearly ? Math.round(p.monthly * 0.8) : p.monthly;
            return (
              <RevealItem key={p.name}>
                <TiltCard
                  max={6}
                  className={cx(
                    "flex h-full flex-col p-7",
                    p.featured &&
                      "border-[color-mix(in_oklab,var(--accent)_45%,transparent)] shadow-[0_0_0_1px_color-mix(in_oklab,var(--accent)_28%,transparent),0_34px_90px_-46px_var(--glow)]",
                  )}
                >
                  {p.featured ? (
                    <span className="mb-4 w-fit rounded-full bg-[color-mix(in_oklab,var(--accent)_18%,transparent)] px-2.5 py-1 text-[11px] font-semibold text-[var(--accent)]">
                      Most leagues pick this
                    </span>
                  ) : null}
                  <h3 className="text-base font-semibold tracking-tight">{p.name}</h3>
                  <p className="mt-1 text-[13px] text-fg-muted">{p.blurb}</p>

                  <p className="mt-6 flex items-end gap-1 overflow-hidden">
                    <AnimatePresence mode="popLayout" initial={false}>
                      <motion.span
                        key={price}
                        initial={{ y: 26, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: -26, opacity: 0 }}
                        transition={{ duration: 0.38, ease: [0.22, 1, 0.36, 1] }}
                        className="display text-5xl"
                      >
                        ${price}
                      </motion.span>
                    </AnimatePresence>
                    <span className="pb-1.5 text-[12.5px] text-fg-subtle">/month</span>
                  </p>

                  <ul className="mt-6 flex-1 space-y-2.5">
                    {p.features.map((f) => (
                      <li key={f} className="flex items-start gap-2.5 text-[13.5px] text-fg-muted">
                        <svg viewBox="0 0 24 24" width="15" height="15" className="mt-0.5 shrink-0 text-[var(--accent)]" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M5 12.5l4.5 4.5L19 7.5" />
                        </svg>
                        {f}
                      </li>
                    ))}
                  </ul>

                  <div className="mt-7">
                    {p.featured ? (
                      <PrimaryButton className="w-full">
                        <Swap>{p.cta}</Swap>
                      </PrimaryButton>
                    ) : (
                      <GhostButton className="w-full">
                        <Swap>{p.cta}</Swap>
                      </GhostButton>
                    )}
                  </div>
                </TiltCard>
              </RevealItem>
            );
          })}
        </Reveal>
      </div>
    </section>
  );
}
