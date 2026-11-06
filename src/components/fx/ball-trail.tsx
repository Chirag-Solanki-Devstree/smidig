"use client";

import { useEffect, useRef } from "react";
import {
  motion,
  useAnimationFrame,
  useMotionValue,
  useReducedMotion,
  useSpring,
  type MotionValue,
} from "motion/react";

/** Cricket ball, lit from the leading edge so it reads as hot. */
function Ball({ size }: { size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" aria-hidden>
      <defs>
        <radialGradient id="bt-body" cx="34%" cy="30%" r="78%">
          <stop offset="0%" stopColor="#ff8a5c" />
          <stop offset="55%" stopColor="#d14030" />
          <stop offset="100%" stopColor="#7d1d12" />
        </radialGradient>
      </defs>
      <circle cx="24" cy="24" r="19" fill="url(#bt-body)" />
      <path d="M12.5 13.5c4.5 5.5 4.5 15.5 0 21" fill="none" stroke="#f8eeda" strokeWidth="1.5" strokeLinecap="round" strokeDasharray="1.8 2.8" />
      <path d="M35.5 13.5c-4.5 5.5-4.5 15.5 0 21" fill="none" stroke="#f8eeda" strokeWidth="1.5" strokeLinecap="round" strokeDasharray="1.8 2.8" />
      <ellipse cx="17.5" cy="16" rx="5" ry="3.2" fill="#fff" opacity="0.32" transform="rotate(-28 17.5 16)" />
      <circle cx="24" cy="24" r="19" fill="none" stroke="rgba(255,200,140,0.5)" strokeWidth="1" />
    </svg>
  );
}

/** Points in the lag chain. Fewer points, shorter flame. */
const POINTS = 10;

/**
 * Hard cap on how far the flame reaches behind the ball, in px.
 *
 * A spring chain stretches with speed, so a fast drag would otherwise throw a
 * tail right across the hero. Clamping the gap between drawn points keeps the
 * flame the same length whatever the cursor does, while the springs keep their
 * own state so the shape and bend are unchanged.
 */
const MAX_TAIL = 120;

/**
 * Layers of the flame, drawn on top of each other.
 * `take` is how many of the chain's points each layer follows — the inner,
 * brightest layer only covers the stretch nearest the ball, so the ribbon
 * tapers from white-hot at the head to dark red at the tail.
 */
const LAYERS = [
  { take: 11, width: 15, colour: "rgba(168,32,14,0.28)" },
  { take: 9, width: 11, colour: "rgba(236,86,20,0.40)" },
  { take: 7, width: 7.5, colour: "rgba(255,142,34,0.54)" },
  { take: 5, width: 4.5, colour: "rgba(255,196,80,0.72)" },
  { take: 3, width: 2.2, colour: "rgba(255,248,224,0.92)" },
];

/** Smooth cubic path through the points, so the flame bends instead of kinking. */
function toPath(pts: number[][], take: number) {
  const p = pts.slice(0, take);
  if (p.length < 2) return "";
  let d = `M${p[0][0].toFixed(1)},${p[0][1].toFixed(1)}`;
  for (let i = 0; i < p.length - 1; i++) {
    const prev = p[i - 1] ?? p[i];
    const cur = p[i];
    const next = p[i + 1];
    const after = p[i + 2] ?? next;
    const c1x = cur[0] + (next[0] - prev[0]) / 6;
    const c1y = cur[1] + (next[1] - prev[1]) / 6;
    const c2x = next[0] - (after[0] - cur[0]) / 6;
    const c2y = next[1] - (after[1] - cur[1]) / 6;
    d += `C${c1x.toFixed(1)},${c1y.toFixed(1)} ${c2x.toFixed(1)},${c2y.toFixed(1)} ${next[0].toFixed(1)},${next[1].toFixed(1)}`;
  }
  return d;
}

/**
 * A single cricket ball that follows the cursor, trailing fire.
 *
 * Positions come from a chain of springs — each point chases the one ahead of
 * it, so the lag builds naturally and the tail bends through corners. Those
 * points are then drawn as one smooth path in five stacked strokes, which is
 * what makes the flame continuous: discrete puffs break into separate dots the
 * moment the cursor moves quickly.
 *
 * The path is rewritten imperatively each frame, so none of this costs a React
 * render. Mount inside a `position: relative` container; the layer never takes
 * pointer events.
 */
export function BallTrail({ size = 28 }: { size?: number }) {
  const host = useRef<HTMLDivElement>(null);
  const paths = useRef<(SVGPathElement | null)[]>([]);
  const rect = useRef<DOMRect | null>(null);
  const client = useRef<{ x: number; y: number } | null>(null);
  const reduce = useReducedMotion();

  const x = useMotionValue(-999);
  const y = useMotionValue(-999);
  const shown = useMotionValue(0);

  const bx = useSpring(x, { stiffness: 700, damping: 38, mass: 0.3 });
  const by = useSpring(y, { stiffness: 700, damping: 38, mass: 0.3 });

  /* eslint-disable react-hooks/rules-of-hooks -- POINTS is a module constant,
     so this hook chain has the same length on every render. */
  const chain: { x: MotionValue<number>; y: MotionValue<number> }[] = [];
  let px: MotionValue<number> = bx;
  let py: MotionValue<number> = by;
  for (let i = 0; i < POINTS; i++) {
    const cfg = { stiffness: 640 - i * 26, damping: 30, mass: 0.34 };
    px = useSpring(px, cfg);
    py = useSpring(py, cfg);
    chain.push({ x: px, y: py });
  }
  /* eslint-enable react-hooks/rules-of-hooks */

  const spin = useMotionValue(0);
  const rotate = useSpring(spin, { stiffness: 80, damping: 18 });

  // Redraw the ribbon once per frame from the current spring values.
  useAnimationFrame(() => {
    if (!paths.current.length) return;
    const pts: number[][] = [[bx.get(), by.get()]];
    for (const c of chain) pts.push([c.x.get(), c.y.get()]);

    // Walk out from the ball, pulling any over-long segment back in. Direction
    // is kept, so the flame still curves the way the cursor moved.
    const maxSeg = MAX_TAIL / POINTS;
    for (let i = 1; i < pts.length; i++) {
      const dx = pts[i][0] - pts[i - 1][0];
      const dy = pts[i][1] - pts[i - 1][1];
      const d = Math.hypot(dx, dy);
      if (d > maxSeg) {
        pts[i][0] = pts[i - 1][0] + (dx / d) * maxSeg;
        pts[i][1] = pts[i - 1][1] + (dy / d) * maxSeg;
      }
    }
    for (let i = 0; i < LAYERS.length; i++) {
      paths.current[i]?.setAttribute("d", toPath(pts, LAYERS[i].take));
    }
  });

  useEffect(() => {
    if (reduce) return;
    if (!window.matchMedia("(pointer: fine)").matches) return;

    const parent = host.current?.parentElement;
    if (!parent) return;

    const measure = () => {
      rect.current = parent.getBoundingClientRect();
    };
    measure();

    let last: { x: number; y: number } | null = null;

    const place = (cx: number, cy: number) => {
      const r = rect.current;
      if (!r) return;
      const lx = cx - r.left;
      const ly = cy - r.top;

      if (lx < 0 || ly < 0 || lx > r.width || ly > r.height) {
        shown.set(0);
        last = null;
        return;
      }

      if (shown.get() === 0) {
        // Entering: collapse the chain here, so the flame does not sweep in
        // from wherever the cursor happened to leave.
        x.jump(lx);
        y.jump(ly);
        bx.jump(lx);
        by.jump(ly);
        for (const c of chain) {
          c.x.jump(lx);
          c.y.jump(ly);
        }
      }

      if (last) spin.set(spin.get() + Math.hypot(lx - last.x, ly - last.y) * 1.5);
      last = { x: lx, y: ly };

      shown.set(1);
      x.set(lx);
      y.set(ly);
    };

    const onMove = (e: PointerEvent) => {
      client.current = { x: e.clientX, y: e.clientY };
      place(e.clientX, e.clientY);
    };

    // One layout read per scroll frame, then re-place against the new rect so
    // the ball stays under the cursor while the page moves.
    let queued = false;
    const onScroll = () => {
      if (queued) return;
      queued = true;
      requestAnimationFrame(() => {
        queued = false;
        measure();
        const c = client.current;
        if (c) place(c.x, c.y);
      });
    };

    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", measure, { passive: true });
    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", measure);
    };
  }, [reduce, x, y, bx, by, shown, spin, chain]);

  // Deliberately NOT `if (reduce) return null`: useReducedMotion resolves on
  // the client, so bailing here would render the container on the server and
  // nothing on the client — a hydration mismatch.
  return (
    <div
      ref={host}
      aria-hidden
      data-testid="ball-trail"
      className="pointer-events-none absolute inset-0 z-0 overflow-hidden"
      style={{ contain: "layout paint" }}
    >
      {/* No viewBox: user units are CSS pixels, which is what the chain holds. */}
      <motion.svg
        className="absolute inset-0 h-full w-full"
        style={{ opacity: shown }}
      >
        {LAYERS.map((l, i) => (
          <path
            key={i}
            ref={(el) => {
              paths.current[i] = el;
            }}
            fill="none"
            stroke={l.colour}
            strokeWidth={l.width}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        ))}
      </motion.svg>

      <motion.span
        style={{
          x: bx,
          y: by,
          rotate,
          opacity: shown,
          position: "absolute",
          left: 0,
          top: 0,
          marginLeft: -size / 2,
          marginTop: -size / 2,
          willChange: "transform",
        }}
      >
        <Ball size={size} />
      </motion.span>
    </div>
  );
}
