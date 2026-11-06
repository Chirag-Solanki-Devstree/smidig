import type { Metadata } from "next";
import { MatchCard } from "@/components/cards/match-card";
import { Reveal, RevealItem } from "@/components/fx/reveal";
import { EmptyState, SectionHeading } from "@/components/kit";
import { MATCHES } from "@/lib/data";
import { Radio } from "lucide-react";

export const metadata: Metadata = {
  title: "Live now",
  description: "Every match being played on Smidig right now.",
};

const live = MATCHES.filter((m) => m.status === "live");
const next = MATCHES.filter((m) => m.status === "upcoming");
const done = MATCHES.filter((m) => m.status === "completed");

export default function LivePage() {
  return (
    <div className="shell pt-28 pb-16 sm:pt-32">
      <SectionHeading
        eyebrow="Across Smidig"
        title="Live right now"
        sub="Every match currently being scored, across every tournament on the platform."
      />

      {live.length ? (
        <Reveal className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3" stagger={0.09} amount={0.15}>
          {live.map((m) => (
            <RevealItem key={m.id}>
              <MatchCard m={m} />
            </RevealItem>
          ))}
        </Reveal>
      ) : (
        <EmptyState
          icon={<Radio size={18} />}
          title="Nothing live at the moment"
          body="Matches appear here the second a scorer starts an innings."
        />
      )}

      <div className="mt-16">
        <SectionHeading eyebrow="Next up" title="Starting soon" />
        <Reveal className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3" stagger={0.08} amount={0.15}>
          {next.map((m) => (
            <RevealItem key={m.id}>
              <MatchCard m={m} />
            </RevealItem>
          ))}
        </Reveal>
      </div>

      <div className="mt-16">
        <SectionHeading eyebrow="Just finished" title="Latest results" />
        <Reveal className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3" stagger={0.08} amount={0.15}>
          {done.map((m) => (
            <RevealItem key={m.id}>
              <MatchCard m={m} />
            </RevealItem>
          ))}
        </Reveal>
      </div>
    </div>
  );
}
