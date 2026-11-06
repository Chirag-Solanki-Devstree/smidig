"use client";

import { Reveal, RevealItem } from "@/components/fx/reveal";
import { TiltCard } from "@/components/fx/tilt-card";
import { SectionLabel } from "@/components/ui";
import { QUOTES } from "@/lib/content";

export function Voices() {
  return (
    <section className="relative pb-24 sm:pb-32">
      <div className="shell">
        <Reveal className="text-center" amount={0.4}>
          <RevealItem>
            <SectionLabel>From the organisers</SectionLabel>
          </RevealItem>
          <RevealItem>
            <h2 className="display mt-5 text-[clamp(1.9rem,4vw,2.8rem)]">
              Built with leagues, not for them.
            </h2>
          </RevealItem>
        </Reveal>

        <Reveal className="mt-12 grid gap-4 md:grid-cols-3" stagger={0.1} amount={0.2}>
          {QUOTES.map((q) => (
            <RevealItem key={q.name}>
              <TiltCard className="flex h-full flex-col p-6" max={6}>
                <svg viewBox="0 0 24 24" width="22" height="22" className="text-[var(--accent)]" fill="currentColor" opacity="0.65">
                  <path d="M9.5 5C6.5 6.6 5 9 5 12h3.2V19H3v-7.6C3 7.6 5 5.4 9.5 4zM20 5c-3 1.6-4.5 4-4.5 7h3.2V19h-5.2v-7.6C13.5 7.6 15.5 5.4 20 4z" />
                </svg>
                <p className="mt-4 flex-1 text-[14.5px] leading-relaxed">{q.quote}</p>
                <div className="mt-6 flex items-center gap-3 border-t border-line pt-4">
                  <span className="grid h-9 w-9 place-items-center rounded-full bg-[linear-gradient(135deg,var(--accent),var(--accent-2))] text-[11px] font-bold text-[var(--accent-fg)]">
                    {q.name.split(" ").map((n) => n[0]).join("")}
                  </span>
                  <span className="text-[12.5px] leading-tight">
                    <span className="block font-medium">{q.name}</span>
                    <span className="block text-fg-subtle">{q.role}</span>
                  </span>
                </div>
              </TiltCard>
            </RevealItem>
          ))}
        </Reveal>
      </div>
    </section>
  );
}
