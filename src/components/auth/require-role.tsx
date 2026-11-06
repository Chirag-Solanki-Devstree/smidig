"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useSession } from "@/components/session-provider";
import type { Role } from "@/lib/session";

/**
 * Client-side guard for the prototype. The real build enforces this in
 * middleware with Auth.js (task 04) — this only keeps the flow honest so the
 * screens can be demoed and tested end to end.
 *
 * `children` is ALWAYS rendered, and hidden with `display: none` while the
 * check is pending or the role is wrong. Returning early instead would drop
 * the page segment from the tree, and Next's partial-prefetch validator then
 * cannot confirm the route navigates instantly — it reports the segment as
 * "dropped from rendering" and stops checking it. Hiding keeps the segment in
 * the tree, so prefetching and instant navigation keep working for every
 * guarded route.
 *
 * This is presentational only. It is not a security boundary, and never was:
 * a client guard cannot be one.
 */
export function RequireRole({
  role,
  children,
}: {
  role: Role;
  children: React.ReactNode;
}) {
  const { session, ready } = useSession();
  const router = useRouter();
  const pathname = usePathname();

  const allowed = session?.role === role;

  useEffect(() => {
    if (!ready) return;
    if (!session) {
      router.replace(`/signin?next=${encodeURIComponent(pathname)}`);
      return;
    }
    if (session.role !== role) {
      router.replace(`/signin?next=${encodeURIComponent(pathname)}&denied=1`);
    }
  }, [ready, session, role, router, pathname]);

  return (
    <>
      {!allowed ? (
        <div
          data-testid="auth-checking"
          className="grid min-h-[50vh] place-items-center text-[13px] text-fg-subtle"
        >
          Checking access…
        </div>
      ) : null}

      <div
        style={allowed ? undefined : { display: "none" }}
        aria-hidden={!allowed}
        inert={!allowed || undefined}
      >
        {children}
      </div>
    </>
  );
}
