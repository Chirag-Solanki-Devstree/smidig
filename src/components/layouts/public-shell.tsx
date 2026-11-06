"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { AnimatePresence, motion, useMotionValueEvent, useScroll } from "motion/react";
import { Menu, Search, X } from "lucide-react";
import { useMode } from "@/components/mode-provider";
import { BallMark, Swap } from "@/components/ui";
import { Button } from "@/components/kit";
import { AccountMenu } from "@/components/auth/account-menu";
import { MOBILE_TABS, PUBLIC_LINKS } from "@/lib/nav";
import { FOOTER_COLS } from "@/lib/content";
import { cx } from "@/lib/cx";

export function PublicNav() {
  const { mode, toggle } = useMode();
  const { scrollY } = useScroll();
  const pathname = usePathname();
  const [stuck, setStuck] = useState(false);
  const [hovered, setHovered] = useState<string | null>(null);
  const [open, setOpen] = useState(false);

  useMotionValueEvent(scrollY, "change", (v) => setStuck(v > 24));

  return (
    <motion.header
      initial={{ y: -90, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
      className="fixed inset-x-0 top-0 z-50 flex justify-center px-4 pt-4"
    >
      <nav
        className={cx(
          "flex w-full items-center gap-2 rounded-full px-3 py-2",
          "transition-[max-width,background-color,border-color,box-shadow] duration-[600ms] ease-[var(--ease-out)]",
          stuck
            ? "max-w-4xl glass-blur shadow-[var(--shadow-lift)]"
            : "max-w-6xl border border-transparent bg-transparent",
        )}
      >
        <Link href="/" className="flex shrink-0 items-center gap-2.5 pl-1.5 pr-2">
          <BallMark />
          <span className="text-[15px] font-semibold tracking-tight">Smidig</span>
        </Link>

        <ul className="mx-auto hidden items-center gap-0.5 md:flex" onMouseLeave={() => setHovered(null)}>
          {PUBLIC_LINKS.map((l) => {
            const active = pathname === l.href || pathname.startsWith(l.href + "/");
            return (
              <li key={l.href} className="relative">
                <Link
                  href={l.href}
                  onMouseEnter={() => setHovered(l.href)}
                  className={cx(
                    "relative block rounded-full px-3.5 py-2 text-[13px] transition-colors duration-[var(--dur)]",
                    active ? "text-fg" : "text-fg-muted hover:text-fg",
                  )}
                >
                  {hovered === l.href ? (
                    <motion.span
                      layoutId="pubnav-hover"
                      transition={{ type: "spring", stiffness: 380, damping: 32, mass: 0.6 }}
                      className="absolute inset-0 rounded-full bg-surface-strong"
                    />
                  ) : null}
                  <span className="relative">
                    <Swap>{l.label}</Swap>
                  </span>
                  {active ? (
                    <span className="absolute inset-x-3.5 -bottom-0.5 h-px bg-[var(--accent)]" />
                  ) : null}
                </Link>
              </li>
            );
          })}
        </ul>

        <div className="ml-auto flex items-center gap-1.5 md:ml-0">
          <Link
            href="/tournaments"
            aria-label="Search tournaments"
            className="grid h-9 w-9 place-items-center rounded-full text-fg-muted transition-colors duration-[var(--dur)] hover:bg-surface-strong hover:text-fg"
          >
            <Search size={16} />
          </Link>
          <button
            onClick={toggle}
            aria-label={`Switch to ${mode === "dark" ? "light" : "dark"} mode`}
            className="group grid h-9 w-9 place-items-center rounded-full text-fg-muted transition-colors duration-[var(--dur)] hover:bg-surface-strong hover:text-fg"
          >
            <span className="block transition-transform duration-[600ms] ease-[var(--ease-out)] group-hover:rotate-180">
              <ModeIcon mode={mode} />
            </span>
          </button>
          {/* The wrapper does the hiding: Button's own `inline-flex` would
              override a `hidden` passed in via className. */}
          <span className="hidden lg:block">
            <Button href="/dashboard" variant="primary" size="sm">
              <Swap>Host a tournament</Swap>
            </Button>
          </span>
          <AccountMenu />
          <button
            onClick={() => setOpen((v) => !v)}
            aria-label="Menu"
            aria-expanded={open}
            className="grid h-9 w-9 place-items-center rounded-full text-fg-muted hover:bg-surface-strong hover:text-fg md:hidden"
          >
            {open ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </nav>

      <AnimatePresence>
        {open ? (
          <motion.ul
            initial={{ opacity: 0, y: -10, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.98 }}
            transition={{ duration: 0.34, ease: [0.22, 1, 0.36, 1] }}
            className="absolute left-4 right-4 top-[4.5rem] space-y-1 rounded-2xl glass-blur p-2 md:hidden"
          >
            {PUBLIC_LINKS.map((l, i) => (
              <motion.li
                key={l.href}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.04 + i * 0.05, duration: 0.3 }}
              >
                <Link
                  href={l.href}
                  onClick={() => setOpen(false)}
                  className="block rounded-xl px-4 py-3 text-sm text-fg-muted transition-colors hover:bg-surface-strong hover:text-fg"
                >
                  {l.label}
                </Link>
              </motion.li>
            ))}
          </motion.ul>
        ) : null}
      </AnimatePresence>
    </motion.header>
  );
}

/** Phone-only bottom tab bar, as specified for the public surface. */
export function MobileTabs() {
  const pathname = usePathname();
  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-[color-mix(in_oklab,var(--bg-elev)_94%,transparent)] md:hidden">
      <ul className="mx-auto flex max-w-md">
        {MOBILE_TABS.map((t) => {
          const active = t.href === "/" ? pathname === "/" : pathname.startsWith(t.href);
          return (
            <li key={t.href} className="flex-1">
              <Link
                href={t.href}
                className={cx(
                  "relative flex flex-col items-center gap-1 py-2.5 text-[10.5px] transition-colors duration-[var(--dur)]",
                  active ? "text-[var(--accent)]" : "text-fg-subtle",
                )}
              >
                {active ? (
                  <motion.span
                    layoutId="tabbar"
                    transition={{ type: "spring", stiffness: 420, damping: 34 }}
                    className="absolute inset-x-5 top-0 h-[2px] rounded-full bg-[var(--accent)]"
                  />
                ) : null}
                <t.icon size={17} />
                {t.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

export function PublicFooter() {
  return (
    <footer className="relative mt-10 border-t border-line py-14 pb-24 md:pb-14">
      <div className="shell">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-5">
          <div className="lg:col-span-2">
            <div className="flex items-center gap-2.5">
              <BallMark />
              <span className="text-[15px] font-semibold tracking-tight">Smidig</span>
            </div>
            <p className="mt-4 max-w-xs text-[13px] leading-relaxed text-fg-muted">
              The tournament marketplace. Create a tournament for any sport, take
              entries, tickets, sponsors and stalls in one place.
            </p>
          </div>
          {FOOTER_COLS.map((c) => (
            <div key={c.h}>
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-fg-subtle">
                {c.h}
              </p>
              <ul className="mt-4 space-y-2.5">
                {c.items.map((i) => (
                  <li key={i.label}>
                    <Link
                      href={i.href}
                      className="wipe-underline inline-block text-[13.5px] text-fg-muted transition-colors duration-[var(--dur)] hover:text-fg"
                    >
                      {i.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="mt-12 flex flex-col items-center justify-between gap-3 border-t border-line pt-6 text-[12px] text-fg-subtle sm:flex-row">
          <span>© 2026 Smidig. Prototype — no real payments.</span>
          <span>Cricket today · more sports next</span>
        </div>
      </div>
    </footer>
  );
}

function ModeIcon({ mode }: { mode: "dark" | "light" }) {
  return mode === "dark" ? (
    <svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2M12 20v2M2 12h2M20 12h2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
    </svg>
  ) : (
    <svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 14.5A8.5 8.5 0 1 1 9.5 4a6.8 6.8 0 0 0 10.5 10.5z" />
    </svg>
  );
}
