"use client";

import { useState } from "react";
import { motion } from "motion/react";
import { Info } from "lucide-react";
import { PageTitle } from "@/components/layouts/console-shell";
import {
  Badge,
  Button,
  Card,
  Table,
  Tbody,
  Td,
  Th,
  Tr,
} from "@/components/kit";
import { FEE_RULES } from "@/lib/data";
import { formatMoney, splitFee } from "@/lib/money";
import { useToast } from "@/components/kit/toast";
import { cx } from "@/lib/cx";

/** Live fee preview — the exact wording the client asked for. */
export function FeeSettings() {
  const toast = useToast();
  const [bps, setBps] = useState(500);
  const [fixed, setFixed] = useState(500);
  const [paidBy, setPaidBy] = useState<"buyer" | "organizer">("buyer");
  const sample = 100000; // ₹1,000

  const s = splitFee(sample, { bps, fixed, paidBy });

  return (
    <>
      <PageTitle
        title="Fee settings"
        sub="One rule per money flow. Changes apply to new orders only — past orders keep the fee they were charged."
      />

      <div className="grid gap-4 lg:grid-cols-[1fr_20rem]">
        <Card className="overflow-hidden">
          <div className="border-b border-line px-5 py-3.5">
            <h2 className="text-[14px] font-semibold">Rules by flow</h2>
          </div>
          <Table>
            <thead>
              <tr>
                <Th>Flow</Th>
                <Th align="right">Percentage</Th>
                <Th align="right">Fixed</Th>
                <Th>Paid by</Th>
                <Th align="right">On ₹1,000</Th>
              </tr>
            </thead>
            <Tbody>
              {FEE_RULES.map((r) => {
                const x = splitFee(sample, { bps: r.bps, fixed: r.fixed, paidBy: r.paidBy });
                return (
                  <Tr key={r.flow}>
                    <Td className="font-medium">{r.flow}</Td>
                    <Td align="right" className="font-mono">{(r.bps / 100).toFixed(1)}%</Td>
                    <Td align="right" className="font-mono">
                      {formatMoney({ amount: r.fixed, currency: "INR" })}
                    </Td>
                    <Td>
                      <Badge tone={r.paidBy === "buyer" ? "info" : "neutral"}>{r.paidBy}</Badge>
                    </Td>
                    <Td align="right" className="font-mono text-[var(--accent)]">
                      {formatMoney({ amount: x.smidigFee, currency: "INR" })}
                    </Td>
                  </Tr>
                );
              })}
            </Tbody>
          </Table>
        </Card>

        <Card className="h-fit p-5">
          <h2 className="text-[14px] font-semibold">Edit a rule</h2>
          <p className="mt-1 text-[12px] text-fg-subtle">Match ticket</p>

          <label className="mt-5 block">
            <span className="mb-2 flex items-center justify-between text-[12px] text-fg-muted">
              Percentage <span className="font-mono text-fg">{(bps / 100).toFixed(1)}%</span>
            </span>
            <input
              type="range"
              min={0}
              max={1500}
              step={25}
              value={bps}
              onChange={(e) => setBps(Number(e.target.value))}
              className="w-full accent-[var(--accent)]"
            />
          </label>

          <label className="mt-4 block">
            <span className="mb-2 flex items-center justify-between text-[12px] text-fg-muted">
              Fixed fee{" "}
              <span className="font-mono text-fg">{formatMoney({ amount: fixed, currency: "INR" })}</span>
            </span>
            <input
              type="range"
              min={0}
              max={5000}
              step={100}
              value={fixed}
              onChange={(e) => setFixed(Number(e.target.value))}
              className="w-full accent-[var(--accent)]"
            />
          </label>

          <div className="mt-4">
            <p className="mb-2 text-[12px] text-fg-muted">Who pays it</p>
            <div className="flex gap-2">
              {(["buyer", "organizer"] as const).map((p) => (
                <button
                  key={p}
                  data-testid={`paidby-${p}`}
                  onClick={() => setPaidBy(p)}
                  className={cx(
                    "flex-1 rounded-lg border px-3 py-2 text-[12.5px] font-medium capitalize transition-colors duration-[var(--dur)]",
                    paidBy === p
                      ? "border-[var(--accent)] bg-[color-mix(in_oklab,var(--accent)_12%,transparent)] text-[var(--accent)]"
                      : "border-line bg-surface text-fg-muted hover:text-fg",
                  )}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>

          {/* live preview */}
          <motion.div
            key={`${bps}-${fixed}-${paidBy}`}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="mt-5 rounded-xl border border-line bg-surface p-4"
          >
            <p className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-fg-subtle">
              <Info size={11} /> Preview
            </p>
            <p className="mt-2.5 text-[13px] leading-relaxed">
              On a {formatMoney({ amount: sample, currency: "INR" })} ticket: buyer pays{" "}
              <span className="font-mono font-semibold">
                {formatMoney({ amount: s.buyerPays, currency: "INR" })}
              </span>
              , organizer gets{" "}
              <span className="font-mono font-semibold">
                {formatMoney({ amount: s.organizerGets, currency: "INR" })}
              </span>
              , Smidig earns{" "}
              <span className="font-mono font-semibold text-[var(--accent)]">
                {formatMoney({ amount: s.smidigFee, currency: "INR" })}
              </span>
              .
            </p>
          </motion.div>

          <Button
            variant="primary"
            className="mt-4 w-full"
            onClick={() =>
              toast({
                title: "Fee rule saved",
                body: "Applies to new orders only — past orders keep their fee.",
                tone: "ok",
              })
            }
          >
            Save rule
          </Button>
        </Card>
      </div>
    </>
  );
}
