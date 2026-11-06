import type { Metadata } from "next";
import { Hero } from "@/components/site/hero";
import { Ticker } from "@/components/site/ticker";
import { Clubs } from "@/components/site/clubs";
import { Features } from "@/components/site/features";
import { Formats } from "@/components/site/formats";
import { How } from "@/components/site/how";
import { Leaderboard } from "@/components/site/leaderboard";
import { Voices } from "@/components/site/voices";
import { Pricing } from "@/components/site/pricing";
import { Cta } from "@/components/site/cta";

export const metadata: Metadata = {
  title: "Host a tournament",
  description:
    "Run your cricket tournament on Smidig: fixtures, entries, tickets, sponsors, stalls, live scoring and payouts.",
};

export default function HostPage() {
  return (
    <>
      <Hero />
      <Ticker />
      <Clubs />
      <Features />
      <Formats />
      <How />
      <Leaderboard />
      <Voices />
      <Pricing />
      <Cta />
    </>
  );
}
