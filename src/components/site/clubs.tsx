import { CLUBS } from "@/lib/content";

/** Two counter-scrolling rows of club names. */
export function Clubs() {
  return (
    <section className="relative py-14">
      <p className="mb-8 text-center text-[11px] font-semibold uppercase tracking-[0.22em] text-fg-subtle">
        Scoring for clubs, academies and district associations
      </p>

      <div className="marquee-pause space-y-4">
        {[false, true].map((reverse) => (
          <div key={String(reverse)} className="mask-fade-x overflow-hidden">
            <div
              className="marquee-track flex w-max items-center gap-10"
              data-reverse={reverse}
              style={{ ["--marquee-duration" as string]: reverse ? "44s" : "38s" }}
            >
              {[0, 1].map((dup) => (
                <div key={dup} className="flex shrink-0 items-center gap-10" aria-hidden={dup === 1}>
                  {CLUBS.map((c) => (
                    <span
                      key={c}
                      className="group flex items-center gap-2.5 whitespace-nowrap text-[17px] font-semibold tracking-tight text-fg-subtle transition-colors duration-[var(--dur)] hover:text-fg"
                    >
                      <span className="h-1.5 w-1.5 rounded-full bg-line-strong transition-colors duration-[var(--dur)] group-hover:bg-[var(--accent)]" />
                      {c}
                    </span>
                  ))}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
