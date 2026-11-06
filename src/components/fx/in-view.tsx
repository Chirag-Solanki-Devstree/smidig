"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Fires once when the element first scrolls into view.
 *
 * Deliberately IntersectionObserver rather than a scroll listener: the browser
 * does the work off the main thread, so a page full of these costs nothing
 * while scrolling. One observer per element, disconnected as soon as it fires.
 */
export function useInViewOnce<T extends Element = HTMLDivElement>(
  options?: { rootMargin?: string; amount?: number },
) {
  const ref = useRef<T>(null);
  const [seen, setSeen] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el || seen) return;

    // Anyone who asks for reduced motion gets the end state immediately.
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setSeen(true);
      return;
    }

    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setSeen(true);
          io.disconnect();
        }
      },
      {
        rootMargin: options?.rootMargin ?? "0px 0px -8% 0px",
        threshold: options?.amount ?? 0.08,
      },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [seen, options?.rootMargin, options?.amount]);

  return { ref, seen };
}
