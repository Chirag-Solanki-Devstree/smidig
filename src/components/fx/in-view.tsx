"use client";

import { useEffect, useRef, useState } from "react";

const REDUCED = () =>
  typeof window !== "undefined" &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

function observeOnce(el: Element, onSeen: () => void, amount = 0.08, rootMargin = "0px 0px -8% 0px") {
  if (REDUCED()) {
    onSeen();
    return () => {};
  }
  const io = new IntersectionObserver(
    ([entry]) => {
      if (entry.isIntersecting) {
        onSeen();
        io.disconnect();
      }
    },
    { rootMargin, threshold: amount },
  );
  io.observe(el);
  return () => io.disconnect();
}

/**
 * Adds a class to the element the first time it is scrolled to — by touching
 * the DOM node directly, with no React state.
 *
 * That matters on a dense page. When a dozen of these cross the fold in the
 * same frame, a state-based version re-renders a dozen components at once;
 * measured on a 4x-throttled machine that cost a 70ms long task right as
 * scrolling started. A classList write costs nothing and the transition runs
 * on the compositor.
 */
export function useRevealOnce<T extends Element = HTMLDivElement>(
  options?: { rootMargin?: string; amount?: number; className?: string },
) {
  const ref = useRef<T>(null);
  const cls = options?.className ?? "in";

  useEffect(() => {
    const el = ref.current;
    if (!el || el.classList.contains(cls)) return;
    return observeOnce(el, () => el.classList.add(cls), options?.amount, options?.rootMargin);
  }, [cls, options?.amount, options?.rootMargin]);

  return ref;
}

/**
 * State-based variant, for the cases that must change what is rendered rather
 * than only how it looks. Prefer `useRevealOnce` for pure visual reveals.
 */
export function useInViewOnce<T extends Element = HTMLDivElement>(
  options?: { rootMargin?: string; amount?: number },
) {
  const ref = useRef<T>(null);
  const [seen, setSeen] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el || seen) return;
    return observeOnce(el, () => setSeen(true), options?.amount, options?.rootMargin);
  }, [seen, options?.rootMargin, options?.amount]);

  return { ref, seen };
}
