"use client";

import { Magnetic } from "@/components/fx/magnetic";
import { Reveal, RevealItem } from "@/components/fx/reveal";
import { Parallax } from "@/components/fx/parallax";
import { PrimaryButton, Swap } from "@/components/ui";
import { useToast } from "@/components/kit/toast";

export function Cta() {
  const toast = useToast();
  return (
    <section id="cta" className="relative py-24 sm:py-32">
      <div className="shell">
        <div className="relative overflow-hidden rounded-[28px] border border-line px-6 py-20 text-center sm:px-16">
          <div
            aria-hidden
            className="absolute inset-0 -z-10 bg-[radial-gradient(70%_120%_at_50%_0%,color-mix(in_oklab,var(--accent)_24%,transparent),transparent_70%)]"
          />
          <div aria-hidden className="absolute inset-0 -z-10 turf-bg opacity-70" />
          <div aria-hidden className="absolute inset-0 -z-10 grid-bg opacity-50" />

          <Parallax distance={28} className="pointer-events-none absolute inset-x-0 top-6 -z-10">
            <p className="select-none text-center font-mono text-[11px] uppercase tracking-[0.5em] text-[color-mix(in_oklab,var(--fg)_14%,transparent)]">
              toss · fixtures · live · trophy
            </p>
          </Parallax>

          <Reveal amount={0.3}>
            <RevealItem>
              <h2 className="display mx-auto max-w-2xl text-[clamp(2.2rem,6vw,4rem)]">
                Your season deserves a
                <span className="text-gradient"> proper scoreboard</span>.
              </h2>
            </RevealItem>
            <RevealItem>
              <p className="mx-auto mt-5 max-w-md text-[15px] text-fg-muted">
                Set up your first tournament free. Twelve teams, full live scoring,
                no card.
              </p>
            </RevealItem>
            <RevealItem>
              <form
                className="mx-auto mt-9 flex max-w-md flex-col gap-2.5 sm:flex-row"
                onSubmit={(e) => {
                  e.preventDefault();
                  toast({ title: "You are on the list", body: "We onboard a handful of organizers each week.", tone: "ok" });
                }}
              >
                <input
                  type="email"
                  required
                  placeholder="you@yourleague.com"
                  className="h-12 flex-1 rounded-full border border-line bg-surface px-5 text-sm outline-none transition-colors duration-[var(--dur)] placeholder:text-fg-subtle focus:border-[var(--accent)]"
                />
                <Magnetic strength={0.25}>
                  <PrimaryButton type="submit" className="w-full sm:w-auto">
                    <Swap>Start free</Swap>
                  </PrimaryButton>
                </Magnetic>
              </form>
            </RevealItem>
            <RevealItem>
              <div className="mt-6 flex items-center justify-center gap-3 text-[12px] text-fg-subtle">
                <span>Set up in minutes.</span>
                <span className="h-3 w-px bg-line-strong" />
                <span>Cancel anytime.</span>
              </div>
            </RevealItem>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
