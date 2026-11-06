"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "motion/react";
import { LogOut, Ticket, UserRound } from "lucide-react";
import { useSession } from "@/components/session-provider";
import { roleById } from "@/lib/session";
import { cx } from "@/lib/cx";

export function AccountMenu({ compact }: { compact?: boolean }) {
  const { session, ready, signOut } = useSession();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", onDoc);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDoc);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  // Render the signed-out control until the session is read, so the markup is
  // stable between server and client.
  if (!ready || !session) {
    return (
      <Link
        href="/signin"
        data-testid="nav-signin"
        className={cx(
          "inline-flex h-9 items-center rounded-full border border-line bg-surface px-4 text-[13px] font-semibold text-fg",
          "transition-[transform,border-color,background-color] duration-[var(--dur)] ease-[var(--ease-out)]",
          "hover:-translate-y-0.5 hover:border-line-strong hover:bg-surface-strong",
          compact && "px-3",
        )}
      >
        Sign in
      </Link>
    );
  }

  const initials = session.name
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <div className="relative" ref={ref}>
      <button
        data-testid="account-button"
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-2 rounded-full border border-line bg-surface px-1 py-1 pr-3 transition-[border-color,transform] duration-[var(--dur)] ease-[var(--ease-out)] hover:-translate-y-0.5 hover:border-line-strong"
      >
        <span className="grid h-7 w-7 place-items-center rounded-full bg-[linear-gradient(135deg,var(--accent),var(--accent-2))] text-[10.5px] font-bold text-[var(--accent-fg)]">
          {initials}
        </span>
        <span className="hidden max-w-[7rem] truncate text-[12.5px] capitalize sm:block">
          {session.name}
        </span>
      </button>

      <AnimatePresence>
        {open ? (
          <motion.div
            role="menu"
            data-testid="account-menu"
            initial={{ opacity: 0, y: -8, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.97 }}
            transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
            className="absolute right-0 z-50 mt-2 w-60 overflow-hidden rounded-2xl border border-line bg-bg-elev shadow-[var(--shadow-lift)]"
          >
            <div className="border-b border-line px-4 py-3">
              <p className="truncate text-[13px] font-semibold capitalize">{session.name}</p>
              <p className="truncate text-[11.5px] text-fg-subtle">{session.email}</p>
              <p className="mt-1.5 inline-flex rounded-full bg-[color-mix(in_oklab,var(--accent)_14%,transparent)] px-2 py-0.5 text-[10.5px] font-semibold text-[var(--accent)]">
                {roleById(session.role).label}
              </p>
            </div>
            <div className="p-1.5">
              <Link
                href={roleById(session.role).home}
                onClick={() => setOpen(false)}
                data-testid="menu-home"
                className="flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-[13px] text-fg-muted transition-colors duration-[var(--dur)] hover:bg-surface hover:text-fg"
              >
                <UserRound size={15} /> My space
              </Link>
              <Link
                href="/me/tickets"
                onClick={() => setOpen(false)}
                className="flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-[13px] text-fg-muted transition-colors duration-[var(--dur)] hover:bg-surface hover:text-fg"
              >
                <Ticket size={15} /> My tickets
              </Link>
              <Link
                href="/onboarding"
                onClick={() => setOpen(false)}
                className="flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-[13px] text-fg-muted transition-colors duration-[var(--dur)] hover:bg-surface hover:text-fg"
              >
                <UserRound size={15} /> Switch role
              </Link>
              <button
                data-testid="sign-out"
                onClick={() => {
                  signOut();
                  setOpen(false);
                  router.push("/");
                }}
                className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2.5 text-left text-[13px] text-fg-muted transition-colors duration-[var(--dur)] hover:bg-surface hover:text-[var(--live)]"
              >
                <LogOut size={15} /> Sign out
              </button>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
