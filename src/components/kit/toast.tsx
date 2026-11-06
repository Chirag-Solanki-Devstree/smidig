"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";
import { AnimatePresence, motion } from "motion/react";
import { Check, Info, TriangleAlert, X } from "lucide-react";
import { cx } from "@/lib/cx";

type Tone = "ok" | "info" | "warn";
type Toast = { id: number; title: string; body?: string; tone: Tone };

const ToastCtx = createContext<{ toast: (t: Omit<Toast, "id">) => void } | null>(null);

let seq = 0;

/**
 * Every control in the prototype answers with a toast instead of doing
 * nothing. It makes the flow demonstrable and, later, each call site is
 * exactly where the real server action goes.
 */
export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<Toast[]>([]);

  const toast = useCallback((t: Omit<Toast, "id">) => {
    const id = ++seq;
    setItems((cur) => [...cur.slice(-3), { ...t, id }]);
    setTimeout(() => setItems((cur) => cur.filter((x) => x.id !== id)), 4200);
  }, []);

  const value = useMemo(() => ({ toast }), [toast]);

  return (
    <ToastCtx.Provider value={value}>
      {children}
      <div
        data-testid="toast-region"
        aria-live="polite"
        className="pointer-events-none fixed bottom-20 right-4 z-[100] flex w-[min(22rem,calc(100vw-2rem))] flex-col gap-2 md:bottom-5"
      >
        <AnimatePresence initial={false}>
          {items.map((t) => (
            <motion.div
              key={t.id}
              layout
              data-testid="toast"
              initial={{ opacity: 0, y: 18, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, x: 40, scale: 0.96 }}
              transition={{ type: "spring", stiffness: 380, damping: 32, mass: 0.7 }}
              className="pointer-events-auto flex items-start gap-3 overflow-hidden rounded-xl border border-line bg-bg-elev p-3.5 shadow-[var(--shadow-lift)]"
            >
              <span
                className={cx(
                  "mt-px grid h-6 w-6 shrink-0 place-items-center rounded-full",
                  t.tone === "ok"
                    ? "bg-[color-mix(in_oklab,var(--ok)_18%,transparent)] text-[var(--ok)]"
                    : t.tone === "warn"
                      ? "bg-[color-mix(in_oklab,var(--warn)_18%,transparent)] text-[var(--warn)]"
                      : "bg-[color-mix(in_oklab,var(--info)_18%,transparent)] text-[var(--info)]",
                )}
              >
                {t.tone === "ok" ? (
                  <Check size={13} />
                ) : t.tone === "warn" ? (
                  <TriangleAlert size={13} />
                ) : (
                  <Info size={13} />
                )}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-[13px] font-semibold">{t.title}</span>
                {t.body ? (
                  <span className="mt-0.5 block text-[12px] leading-relaxed text-fg-muted">
                    {t.body}
                  </span>
                ) : null}
              </span>
              <button
                aria-label="Dismiss"
                onClick={() => setItems((cur) => cur.filter((x) => x.id !== t.id))}
                className="shrink-0 text-fg-subtle transition-colors duration-[var(--dur)] hover:text-fg"
              >
                <X size={14} />
              </button>
              <motion.span
                aria-hidden
                initial={{ scaleX: 1 }}
                animate={{ scaleX: 0 }}
                transition={{ duration: 4.2, ease: "linear" }}
                className="absolute inset-x-0 bottom-0 h-[2px] origin-left bg-[var(--accent)]"
              />
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ToastCtx.Provider>
  );
}

export function useToast() {
  const c = useContext(ToastCtx);
  if (!c) throw new Error("useToast must be used inside <ToastProvider>");
  return c.toast;
}
