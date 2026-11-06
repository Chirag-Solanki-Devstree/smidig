"use client";

import { useEffect } from "react";
import Lenis from "lenis";

/**
 * Lenis drives the scroll position with inertia, which is what makes every
 * scroll-linked animation on the page feel continuous instead of stepped.
 * It is disabled outright for people who ask for reduced motion.
 */
export function SmoothScroll() {
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const lenis = new Lenis({
      // `lerp` only — no `duration`. With `duration` set, every wheel event
      // starts a fixed-length tween, so a fast flick keeps gliding for the
      // full duration after the input has stopped and reads as lag.
      // Lerp chases the target each frame instead: it catches up with fast
      // input and still smooths slow input.
      lerp: 0.28,
      wheelMultiplier: 1,
      touchMultiplier: 1.6,
      syncTouch: false,
    });

    let frame = 0;
    const raf = (time: number) => {
      lenis.raf(time);
      frame = requestAnimationFrame(raf);
    };
    frame = requestAnimationFrame(raf);

    // In-page anchors ride the same easing instead of jumping.
    const onClick = (e: MouseEvent) => {
      const a = (e.target as HTMLElement)?.closest?.("a[href^='#']");
      if (!a) return;
      const id = a.getAttribute("href");
      if (!id || id === "#") return;
      const el = document.querySelector(id);
      if (!el) return;
      e.preventDefault();
      lenis.scrollTo(el as HTMLElement, { offset: -90, duration: 1.4 });
    };
    document.addEventListener("click", onClick);

    return () => {
      document.removeEventListener("click", onClick);
      cancelAnimationFrame(frame);
      lenis.destroy();
    };
  }, []);

  return null;
}
