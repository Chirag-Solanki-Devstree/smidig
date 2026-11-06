"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { AnimatePresence, motion, useMotionValueEvent, useScroll, useSpring } from "motion/react";
import { Bell, ChevronDown, Command, Menu, PanelLeftClose, X } from "lucide-react";
import { useMode } from "@/components/mode-provider";
import { BallMark } from "@/components/ui";
import { Badge } from "@/components/kit";
import { AccountMenu } from "@/components/auth/account-menu";
import { ADMIN_NAV, DASHBOARD_NAV } from "@/lib/nav";
import { cx } from "@/lib/cx";

/**
 * Shared chrome for the organizer dashboard and the platform admin panel.
 * Same component, different nav and accent label — the two consoles stay
 * consistent without duplicating layout code.
 */
export function ConsoleShell({
  surface,
  switcher,
  children,
}: {
  surface: "organizer" | "admin";
  switcher: string;
  children: React.ReactNode;
}) {
  // Resolved here, not passed in: the nav carries Lucide components, and a
  // function cannot cross the server -> client props boundary.
  const nav = surface === "admin" ? ADMIN_NAV : DASHBOARD_NAV;
  const [collapsed, setCollapsed] = useState(false);
  const [drawer, setDrawer] = useState(false);
  const [condensed, setCondensed] = useState(false);

  // The bar tightens once you leave the top of a long page, so more of the
  // table stays on screen. One motion value, no re-render per scroll frame.
  const { scrollY, scrollYProgress } = useScroll();
  useMotionValueEvent(scrollY, "change", (v) => setCondensed(v > 60));
  const rail = useSpring(scrollYProgress, { stiffness: 140, damping: 26, restDelta: 0.001 });
  const pathname = usePathname();
  const { mode, toggle } = useMode();

  const sidebar = (compact: boolean, onNav?: () => void) => (
    <>
      <Link
        href={surface === "admin" ? "/admin" : "/dashboard"}
        className="flex h-14 shrink-0 items-center gap-2.5 border-b border-line px-4"
      >
        <BallMark size={28} />
        {!compact ? (
          <span className="flex min-w-0 flex-col leading-tight">
            <span className="truncate text-[14px] font-semibold tracking-tight">Smidig</span>
            <span className="truncate text-[10px] uppercase tracking-widest text-fg-subtle">
              {surface === "admin" ? "Platform admin" : "Organizer"}
            </span>
          </span>
        ) : null}
      </Link>

      <nav className="flex-1 space-y-5 overflow-y-auto px-3 py-4 scroll-thin">
        {nav.map((group) => (
          <div key={group.heading}>
            {!compact ? (
              <p className="px-2 pb-1.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-fg-subtle">
                {group.heading}
              </p>
            ) : (
              <div className="mx-2 mb-2 border-t border-line" />
            )}
            <ul className="space-y-0.5">
              {group.items.map((item) => {
                const active =
                  item.href === "/dashboard" || item.href === "/admin"
                    ? pathname === item.href
                    : pathname.startsWith(item.href);
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      onClick={onNav}
                      title={compact ? item.label : undefined}
                      className={cx(
                        "group relative flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-[13px]",
                        "transition-[background-color,color] duration-[var(--dur)]",
                        compact && "justify-center px-0",
                        active
                          ? "bg-surface-strong font-medium text-fg"
                          : "text-fg-muted hover:bg-surface hover:text-fg",
                      )}
                    >
                      {active ? (
                        <motion.span
                          layoutId={`console-active-${surface}`}
                          transition={{ type: "spring", stiffness: 420, damping: 34, mass: 0.6 }}
                          className="absolute inset-y-1 left-0 w-[2px] rounded-full bg-[var(--accent)]"
                        />
                      ) : null}
                      <item.icon size={16} className={active ? "text-[var(--accent)]" : ""} />
                      {!compact ? (
                        <>
                          <span className="flex-1 truncate">{item.label}</span>
                          {item.badge ? (
                            <span className="rounded-full bg-[color-mix(in_oklab,var(--accent)_18%,transparent)] px-1.5 py-0.5 font-mono text-[10px] text-[var(--accent)]">
                              {item.badge}
                            </span>
                          ) : null}
                        </>
                      ) : null}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>
    </>
  );

  return (
    <div className="flex min-h-screen">
      {/* desktop rail */}
      <aside
        className={cx(
          "hidden shrink-0 flex-col border-r border-line bg-[color-mix(in_oklab,var(--bg-elev)_80%,transparent)] lg:flex",
          "transition-[width] duration-[450ms] ease-[var(--ease-out)]",
          collapsed ? "w-[4.25rem]" : "w-60",
        )}
      >
        {sidebar(collapsed)}
        <div className="border-t border-line p-3">
          <button
            data-testid="sidebar-toggle"
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            onClick={() => setCollapsed((v) => !v)}
            className={cx(
              "flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-[12px] text-fg-muted transition-colors duration-[var(--dur)] hover:bg-surface hover:text-fg",
              collapsed && "justify-center px-0",
            )}
          >
            <PanelLeftClose
              size={15}
              className={cx("transition-transform duration-[450ms] ease-[var(--ease-out)]", collapsed && "rotate-180")}
            />
            {!collapsed ? "Collapse" : null}
          </button>
        </div>
      </aside>

      {/* mobile drawer */}
      <div className={cx("lg:hidden", !drawer && "pointer-events-none")} aria-hidden={!drawer}>
        <div
          onClick={() => setDrawer(false)}
          className={cx(
            "fixed inset-0 z-40 bg-black/50 transition-opacity duration-[var(--dur)]",
            drawer ? "opacity-100" : "opacity-0",
          )}
        />
        <aside
          className={cx(
            "fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-line bg-bg-elev",
            "transition-transform duration-[380ms] ease-[var(--ease-out)]",
            drawer ? "translate-x-0" : "-translate-x-full",
          )}
        >
          <button
            onClick={() => setDrawer(false)}
            aria-label="Close menu"
            className="absolute right-2 top-3.5 grid h-8 w-8 place-items-center rounded-lg text-fg-muted hover:bg-surface hover:text-fg"
          >
            <X size={16} />
          </button>
          {sidebar(false, () => setDrawer(false))}
        </aside>
      </div>

      <div className="flex min-w-0 flex-1 flex-col">
        <header
          className={cx(
            "sticky top-0 z-30 flex shrink-0 items-center gap-3 border-b border-line bg-[color-mix(in_oklab,var(--bg-elev)_88%,transparent)] px-3 backdrop-blur sm:px-5",
            "transition-[height,box-shadow] duration-[380ms] ease-[var(--ease-out)]",
            condensed ? "h-12 shadow-[0_10px_30px_-24px_rgba(0,0,0,0.9)]" : "h-14",
          )}
        >
          {/* How far through the page you are. */}
          <motion.span
            aria-hidden
            style={{ scaleX: rail }}
            className="absolute inset-x-0 bottom-0 h-[2px] origin-left bg-[linear-gradient(90deg,var(--accent),var(--accent-2))]"
          />
          <button
            onClick={() => setDrawer(true)}
            aria-label="Open menu"
            className="grid h-9 w-9 place-items-center rounded-lg text-fg-muted hover:bg-surface hover:text-fg lg:hidden"
          >
            <Menu size={18} />
          </button>

          <button className="group flex items-center gap-2 rounded-lg border border-line bg-surface px-3 py-1.5 text-[12.5px] transition-colors duration-[var(--dur)] hover:border-line-strong hover:bg-surface-strong">
            <span className="h-1.5 w-1.5 rounded-full bg-[var(--accent)]" />
            <span className="max-w-[9rem] truncate sm:max-w-none">{switcher}</span>
            <ChevronDown size={13} className="text-fg-subtle transition-transform duration-[var(--dur)] group-hover:translate-y-0.5" />
          </button>

          <span className="ml-auto hidden items-center gap-1.5 rounded-lg border border-line bg-surface px-2.5 py-1.5 font-mono text-[11px] text-fg-subtle sm:inline-flex">
            <Command size={11} /> K
          </span>

          <button
            aria-label="Notifications"
            className="relative grid h-9 w-9 place-items-center rounded-lg text-fg-muted transition-colors duration-[var(--dur)] hover:bg-surface hover:text-fg"
          >
            <Bell size={16} />
            <span className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-[var(--accent)]" />
          </button>

          <button
            onClick={toggle}
            aria-label="Toggle colour mode"
            className="grid h-9 w-9 place-items-center rounded-lg text-fg-muted transition-colors duration-[var(--dur)] hover:bg-surface hover:text-fg"
          >
            {mode === "dark" ? "☀" : "☾"}
          </button>

          <Link href="/" className="ml-1 hidden text-[12px] text-fg-muted hover:text-fg sm:block">
            View site ↗
          </Link>

          <span className="ml-1">
            <AccountMenu compact />
          </span>
        </header>

        <main className="flex-1 px-4 py-6 sm:px-6">
          <div className="mx-auto w-full max-w-6xl">{children}</div>
        </main>
      </div>
    </div>
  );
}

export function PageTitle({
  title,
  sub,
  action,
  badge,
}: {
  title: string;
  sub?: string;
  action?: React.ReactNode;
  badge?: string;
}) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
      <div>
        <div className="flex items-center gap-2.5">
          <h1 className="display text-[clamp(1.5rem,3vw,2rem)]">{title}</h1>
          {badge ? <Badge tone="open">{badge}</Badge> : null}
        </div>
        {sub ? <p className="mt-1.5 max-w-2xl text-[13.5px] text-fg-muted">{sub}</p> : null}
      </div>
      {action}
    </div>
  );
}

export { AnimatePresence };
