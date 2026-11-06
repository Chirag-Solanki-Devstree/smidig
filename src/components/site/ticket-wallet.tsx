"use client";

import { motion } from "motion/react";
import { CalendarDays, MapPin, QrCode } from "lucide-react";
import { Badge, Button, Card, EmptyState } from "@/components/kit";
import { teamByShort } from "@/lib/data";

const WALLET = [
  { id: "SMD-10482", match: 14, a: "MUM", b: "PUN", type: "Premium", qty: 2, when: "Tonight · 19:30", venue: "Wankhede Ground B", state: "valid" },
  { id: "SMD-10481", match: 15, a: "DEL", b: "KOC", type: "General", qty: 4, when: "Today · 15:00", venue: "Wankhede Ground B", state: "scanned" },
  { id: "SMD-10468", match: 12, a: "KOC", b: "SUR", type: "Premium", qty: 1, when: "3 Nov · 15:00", venue: "Wankhede Ground B", state: "refunded" },
];

export function TicketWallet() {
  return (
    <>
      <h1 className="display text-[clamp(1.7rem,4vw,2.5rem)]">My tickets</h1>
      <p className="mt-2 text-[14px] text-fg-muted">
        Show the QR at the gate. One scan per ticket.
      </p>

      {WALLET.length ? (
        <div className="mt-8 space-y-4">
          {WALLET.map((t, i) => {
            const A = teamByShort(t.a);
            const B = teamByShort(t.b);
            const dead = t.state !== "valid";
            return (
              <motion.div
                key={t.id}
                initial={{ opacity: 0, y: 22 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
              >
                {/* perforated ticket: notches cut either side of the stub */}
                <Card className="group relative overflow-hidden transition-[transform,border-color] duration-[var(--dur)] ease-[var(--ease-out)] hover:-translate-y-1 hover:border-line-strong">
                  <div className="flex flex-col sm:flex-row">
                    <div className={dead ? "flex-1 p-5 opacity-55" : "flex-1 p-5"}>
                      <div className="flex flex-wrap items-center gap-2">
                        <Badge tone={t.state === "valid" ? "open" : t.state === "scanned" ? "neutral" : "closed"}>
                          {t.state}
                        </Badge>
                        <span className="text-[12px] text-fg-muted">Match {t.match}</span>
                      </div>
                      <p className="mt-3 text-[16px] font-semibold">
                        {A.name} <span className="text-fg-subtle">v</span> {B.name}
                      </p>
                      <div className="mt-2.5 flex flex-wrap gap-x-4 gap-y-1.5 text-[12.5px] text-fg-muted">
                        <span className="inline-flex items-center gap-1.5">
                          <CalendarDays size={12} /> {t.when}
                        </span>
                        <span className="inline-flex items-center gap-1.5">
                          <MapPin size={12} /> {t.venue}
                        </span>
                      </div>
                      <p className="mt-3 font-mono text-[12px] text-fg-subtle">
                        {t.type} × {t.qty} · {t.id}
                      </p>
                    </div>

                    {/* stub */}
                    <div className="flip-host relative grid shrink-0 place-items-center border-t border-dashed border-line-strong p-5 sm:w-44 sm:border-l sm:border-t-0" style={{ perspective: 800 }}>
                      <span className="absolute -top-2.5 left-1/2 hidden h-5 w-5 -translate-x-1/2 rounded-full bg-bg sm:block" />
                      <span className="absolute -bottom-2.5 left-1/2 hidden h-5 w-5 -translate-x-1/2 rounded-full bg-bg sm:block" />
                      <div className="text-center">
                        <span className="flip relative grid h-24 w-24 place-items-center">
                          <span
                            className={
                              dead
                                ? "flip-face absolute inset-0 grid place-items-center rounded-xl border border-line bg-surface text-fg-subtle opacity-50"
                                : "flip-face absolute inset-0 grid place-items-center rounded-xl border border-line bg-surface text-fg"
                            }
                          >
                            <QrCode size={54} strokeWidth={1.1} />
                          </span>
                          <span className="flip-face flip-back absolute inset-0 grid place-items-center rounded-xl border border-[var(--accent)] bg-[color-mix(in_oklab,var(--accent)_14%,transparent)] px-2 text-center font-mono text-[10px] leading-tight text-[var(--accent)]">
                            {t.type}
                            <br />× {t.qty}
                          </span>
                        </span>
                        <p className="mt-2 font-mono text-[10.5px] text-fg-subtle">{t.id}</p>
                      </div>
                    </div>
                  </div>
                </Card>
              </motion.div>
            );
          })}
        </div>
      ) : (
        <div className="mt-8">
          <EmptyState
            icon={<QrCode size={18} />}
            title="No tickets yet"
            body="Tickets you buy or claim show up here with their QR ready to scan."
            action={<Button href="/live" variant="primary" size="sm">Find a match</Button>}
          />
        </div>
      )}
    </>
  );
}
