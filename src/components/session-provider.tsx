"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { SESSION_KEY, readSession, type Session } from "@/lib/session";

type Ctx = {
  session: Session | null;
  /** True once the first read from storage has happened. */
  ready: boolean;
  signIn: (s: Session) => void;
  signOut: () => void;
};

const SessionCtx = createContext<Ctx | null>(null);

export function SessionProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setSession(readSession());
    setReady(true);

    // Keep tabs in step.
    const onStorage = (e: StorageEvent) => {
      if (e.key === SESSION_KEY) setSession(readSession());
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const signIn = useCallback((s: Session) => {
    try {
      localStorage.setItem(SESSION_KEY, JSON.stringify(s));
    } catch {}
    setSession(s);
  }, []);

  const signOut = useCallback(() => {
    try {
      localStorage.removeItem(SESSION_KEY);
    } catch {}
    setSession(null);
  }, []);

  return (
    <SessionCtx.Provider value={{ session, ready, signIn, signOut }}>
      {children}
    </SessionCtx.Provider>
  );
}

export function useSession() {
  const c = useContext(SessionCtx);
  if (!c) throw new Error("useSession must be used inside <SessionProvider>");
  return c;
}
