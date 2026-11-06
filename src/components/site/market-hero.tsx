"use client";

import { useRef, useState } from "react";
import { motion, useReducedMotion, useScroll, useSpring, useTransform } from "motion/react";
import { ArrowRight, MapPin, Search } from "lucide-react";
import { TextReveal } from "@/components/fx/text-reveal";
import { Magnetic } from "@/components/fx/magnetic";
import { Button } from "@/components/kit";
import { LiveDot, Pill } from "@/components/ui";
import { useToast } from "@/components/kit/toast";
import { useRouter } from "next/navigation";

const EASE = [0.22, 1, 0.36, 1] as const;

export function MarketHero() {
  const router = useRouter();
  const toast = useToast();
  const [query, setQuery] = useState("");
  const [city, setCity] = useState("");
  // The hero settles back and fades as the page scrolls past it, so the
  // sections below arrive over it instead of sliding up against a wall of
  // text. Driven by MotionValues straight onto transform and opacity: no
  // React state, so nothing re-renders while the page is moving, and both
  // properties stay on the compositor.
  //
  // Measured against the hero's own box rather than pixel constants, because
  // the hero is 715px on this viewport and far shorter on a phone. Progress
  // runs 0 to 1 as the hero scrolls fully past the top of the screen, and the
  // fade is held off until 0.66 of that — the point where the search field has
  // finally passed under the nav. An earlier version faded on absolute scroll
  // and had the hero at 43% opacity while its search box was still sitting in
  // the middle of the screen, which reads as a bug rather than as depth.
  const heroRef = useRef<HTMLElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"],
  });
  const lift = useTransform(scrollYProgress, [0, 1], [0, -70]);
  const dim = useTransform(scrollYProgress, [0.66, 1], [1, 0]);
  const heroY = useSpring(lift, { stiffness: 120, damping: 28, mass: 0.5 });

  return (
    <section ref={heroRef} className="relative pt-32 pb-10 sm:pt-40">
      <div className="shell">
        <motion.div
          style={reduce ? undefined : { y: heroY, opacity: dim }}
          className="mx-auto max-w-3xl text-center"
        >
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: EASE, delay: 0.15 }}
          >
            <Pill>
              <LiveDot />
              2 matches live right now
              <span className="text-fg-subtle">·</span>
              <span className="shimmer font-semibold">18 tournaments open</span>
            </Pill>
          </motion.div>

          <h1 className="display mt-7 text-[clamp(2.3rem,6.6vw,4.4rem)]">
            <TextReveal text="Find a tournament." delay={0.28} />
            <br />
            <TextReveal text="Join it. Watch it." delay={0.44} highlight={["Watch", "it."]} />
          </h1>

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: EASE, delay: 0.78 }}
            className="mx-auto mt-6 max-w-xl text-pretty text-[15px] leading-relaxed text-fg-muted sm:text-base"
          >
            Smidig is the marketplace for tournaments. Anyone can host one, any
            team can enter, and every ticket, sponsorship and stall is booked in
            one place. Cricket today — more sports next.
          </motion.p>

          {/* search bar */}
          <motion.form
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: EASE, delay: 0.9 }}
            onSubmit={(e) => {
              e.preventDefault();
              // Carry the terms through so browse opens already filtered.
              const params = new URLSearchParams();
              if (query.trim()) params.set("q", query.trim());
              if (city.trim()) params.set("city", city.trim());
              const qs = params.toString();
              router.push(qs ? `/tournaments?${qs}` : "/tournaments");
            }}
            className="group mx-auto mt-9 flex max-w-xl flex-col gap-2 rounded-2xl border border-line bg-[color-mix(in_oklab,var(--bg-elev)_78%,transparent)] p-2 transition-[border-color,box-shadow] duration-[var(--dur)] focus-within:border-[var(--accent)] focus-within:shadow-[0_0_0_4px_color-mix(in_oklab,var(--accent)_12%,transparent)] sm:flex-row"
          >
            <label className="flex flex-1 items-center gap-2.5 rounded-xl px-3 py-2.5">
              <Search size={16} className="shrink-0 text-fg-subtle" />
              <input
                data-testid="hero-q"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Tournament, club or sport"
                className="w-full bg-transparent text-[14px] outline-none placeholder:text-fg-subtle"
              />
            </label>
            <span className="hidden w-px bg-line sm:block" />
            <label className="flex items-center gap-2.5 rounded-xl px-3 py-2.5 sm:w-44">
              <MapPin size={16} className="shrink-0 text-fg-subtle" />
              <input
                data-testid="hero-city"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="City"
                className="w-full bg-transparent text-[14px] outline-none placeholder:text-fg-subtle"
              />
            </label>
            <Magnetic strength={0.2}>
              <Button variant="primary" className="h-11 w-full sm:w-auto">
                Search
              </Button>
            </Magnetic>
          </motion.form>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 1.05 }}
            className="mt-5 flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-[12.5px] text-fg-subtle"
          >
            <span>Popular:</span>
            {["Mumbai", "T20", "Free entry", "This weekend"].map((p) => (
              <button
                key={p}
                onClick={() => {
                  const key = ["Mumbai"].includes(p) ? "city" : "q";
                  router.push(`/tournaments?${key}=${encodeURIComponent(p)}`);
                }}
                className="wipe-underline text-fg-muted transition-colors duration-[var(--dur)] hover:text-fg"
              >
                {p}
              </button>
            ))}
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: EASE, delay: 1.15 }}
            className="mt-8 flex flex-wrap items-center justify-center gap-3"
          >
            <Button href="/tournaments" variant="secondary">
              Find a tournament
            </Button>
            <Button href="/host" variant="ghost">
              Host a tournament <ArrowRight size={14} />
            </Button>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
