"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { MODE_KEY, type Mode } from "@/lib/mode";

const Ctx = createContext<{ mode: Mode; toggle: () => void } | null>(null);

export function ModeProvider({ children }: { children: React.ReactNode }) {
  const [mode, setMode] = useState<Mode>("dark");

  useEffect(() => {
    const stored = localStorage.getItem(MODE_KEY);
    if (stored === "light" || stored === "dark") setMode(stored);
  }, []);

  useEffect(() => {
    document.documentElement.setAttribute("data-mode", mode);
  }, [mode]);

  const toggle = useCallback(() => {
    setMode((m) => {
      const next: Mode = m === "dark" ? "light" : "dark";
      try {
        localStorage.setItem(MODE_KEY, next);
      } catch {}
      return next;
    });
  }, []);

  return <Ctx.Provider value={{ mode, toggle }}>{children}</Ctx.Provider>;
}

export function useMode() {
  const c = useContext(Ctx);
  if (!c) throw new Error("useMode must be used inside <ModeProvider>");
  return c;
}
