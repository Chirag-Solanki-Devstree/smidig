"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { CheckCircle2, ScanLine, XCircle } from "lucide-react";
import { PageTitle } from "@/components/layouts/console-shell";
import { Badge, Button, Card, StatCard } from "@/components/kit";
import { cx } from "@/lib/cx";

const FEED = [
  { id: "SMD-10482", name: "Rohit Shetty", type: "Premium × 2", ok: true, t: "19:04" },
  { id: "SMD-10479", name: "Anita Rao", type: "General × 4", ok: true, t: "19:03" },
  { id: "SMD-10468", name: "Kevin Menon", type: "Premium × 1", ok: false, t: "19:01", why: "Already scanned" },
  { id: "SMD-10455", name: "Priya Nair", type: "General × 2", ok: true, t: "18:58" },
];

export function GateScanner() {
  const [scanning, setScanning] = useState(true);

  return (
    <>
      <PageTitle
        title="Gate scanner"
        sub="Point the camera at a ticket QR. Each ticket admits once."
        badge="Gate 2"
      />

      <div className="grid gap-4 lg:grid-cols-[1fr_1.1fr]">
        <Card className="overflow-hidden">
          <div className="relative grid aspect-square place-items-center bg-[color-mix(in_oklab,var(--bg)_70%,transparent)]">
            <div className="absolute inset-0 grid-bg opacity-40" />

            {/* viewfinder */}
            <div className="relative h-56 w-56">
              {[
                "left-0 top-0 border-l-2 border-t-2 rounded-tl-lg",
                "right-0 top-0 border-r-2 border-t-2 rounded-tr-lg",
                "left-0 bottom-0 border-l-2 border-b-2 rounded-bl-lg",
                "right-0 bottom-0 border-r-2 border-b-2 rounded-br-lg",
              ].map((c) => (
                <span key={c} className={cx("absolute h-10 w-10 border-[var(--accent)]", c)} />
              ))}

              {scanning ? (
                <motion.span
                  aria-hidden
                  initial={{ y: 0 }}
                  animate={{ y: [0, 208, 0] }}
                  transition={{ duration: 2.6, repeat: Infinity, ease: "easeInOut" }}
                  className="absolute inset-x-2 top-0 h-[2px] rounded-full bg-[linear-gradient(90deg,transparent,var(--accent),transparent)] shadow-[0_0_14px_var(--glow)]"
                />
              ) : null}

              <span className="absolute inset-0 grid place-items-center text-fg-subtle">
                <ScanLine size={40} strokeWidth={1.1} />
              </span>
            </div>

            <span className="absolute bottom-4 text-[11.5px] text-fg-subtle">
              {scanning ? "Scanning…" : "Paused"}
            </span>
          </div>
          <div className="border-t border-line p-4">
            <Button
              variant={scanning ? "secondary" : "primary"}
              className="w-full"
              onClick={() => setScanning((v) => !v)}
            >
              {scanning ? "Pause scanner" : "Resume scanner"}
            </Button>
          </div>
        </Card>

        <div className="space-y-4">
          <div className="grid gap-3 sm:grid-cols-3">
            <StatCard label="Scanned" value="286" countTo={286} />
            <StatCard label="Rejected" value="4" countTo={4} sub="duplicates" />
            <StatCard label="Remaining" value="132" countTo={132} />
          </div>

          <Card className="overflow-hidden">
            <div className="border-b border-line px-5 py-3.5">
              <h2 className="text-[14px] font-semibold">Recent scans</h2>
            </div>
            <ul className="divide-y divide-[color:var(--border)]">
              <AnimatePresence initial={false}>
                {FEED.map((f, i) => (
                  <motion.li
                    key={f.id}
                    initial={{ opacity: 0, x: 22 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.07, duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
                    className="flex items-center gap-3 px-5 py-3.5"
                  >
                    <span
                      className={cx(
                        "grid h-8 w-8 shrink-0 place-items-center rounded-full",
                        f.ok
                          ? "bg-[color-mix(in_oklab,var(--ok)_16%,transparent)] text-[var(--ok)]"
                          : "bg-[color-mix(in_oklab,var(--live)_16%,transparent)] text-[var(--live)]",
                      )}
                    >
                      {f.ok ? <CheckCircle2 size={16} /> : <XCircle size={16} />}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-[13px] font-medium">{f.name}</span>
                      <span className="block font-mono text-[11px] text-fg-subtle">
                        {f.id} · {f.type}
                      </span>
                    </span>
                    {f.ok ? (
                      <Badge tone="open">Admitted</Badge>
                    ) : (
                      <Badge tone="closed">{f.why}</Badge>
                    )}
                    <span className="font-mono text-[11px] text-fg-subtle">{f.t}</span>
                  </motion.li>
                ))}
              </AnimatePresence>
            </ul>
          </Card>
        </div>
      </div>
    </>
  );
}
