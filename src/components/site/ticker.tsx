"use client";

import { TICKER } from "@/lib/content";
import { LiveDot } from "@/components/ui";

/** Live-score strip. Two copies translate -50% for a seamless loop. */
export function Ticker() {
  return (
    <div className="marquee-pause relative border-y border-line bg-[color-mix(in_oklab,var(--bg-elev)_92%,transparent)]">
      <div className="mask-fade-x overflow-hidden py-2.5">
        <div
          className="marquee-track flex w-max items-center gap-8"
          style={{ ["--marquee-duration" as string]: "48s" }}
        >
          {[0, 1].map((dup) => (
            <div key={dup} className="flex shrink-0 items-center gap-8" aria-hidden={dup === 1}>
              {TICKER.map((m) => (
                <span
                  key={m.a}
                  className="group flex items-center gap-2.5 whitespace-nowrap text-[12.5px]"
                >
                  <LiveDot />
                  <span className="font-medium text-fg">
                    {abbr(m.a)} v {abbr(m.b)}
                  </span>
                  <span className="font-mono text-[var(--accent)]">{m.score}</span>
                  <span className="text-fg-subtle">({m.ov} ov)</span>
                  <span className="text-fg-muted transition-colors duration-[var(--dur)] group-hover:text-[var(--accent-2)]">
                    {m.note}
                  </span>
                  <span className="ml-5 h-3 w-px bg-line-strong" />
                </span>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function abbr(team: string) {
  return team
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase();
}
