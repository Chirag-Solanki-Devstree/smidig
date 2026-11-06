"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "motion/react";
import { AlertTriangle, ArrowRight, Mail } from "lucide-react";
import { Button, Card } from "@/components/kit";
import { useSession } from "@/components/session-provider";
import { ROLES, roleById, type Role } from "@/lib/session";
import { cx } from "@/lib/cx";

/**
 * Email + provider sign-in. In the prototype any email works and the role is
 * chosen here; the real build sends an Auth.js magic link and reads the role
 * from the database.
 */
export function SignInForm({ mode = "signin" }: { mode?: "signin" | "signup" }) {
  const router = useRouter();
  const params = useSearchParams();
  const { signIn } = useSession();

  const next = params.get("next");
  const denied = params.get("denied") === "1";

  const [email, setEmail] = useState("");
  const [role, setRole] = useState<Role>("organizer");
  const [error, setError] = useState<string | null>(null);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = email.trim();
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(trimmed)) {
      setError("Enter a valid email address.");
      return;
    }
    setError(null);
    const name = trimmed.split("@")[0].replace(/[._-]+/g, " ");
    signIn({ name, email: trimmed, role });
    router.push(next || roleById(role).home);
  };

  return (
    <Card className="w-full max-w-md p-7" data-testid="signin-card">
      <h1 className="display text-2xl">
        {mode === "signup" ? "Create your account" : "Sign in to Smidig"}
      </h1>
      <p className="mt-2 text-[13.5px] text-fg-muted">
        {mode === "signup"
          ? "One account covers hosting, playing, watching and sponsoring."
          : "We email you a link — no password to remember."}
      </p>

      {denied ? (
        <motion.p
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          data-testid="denied-notice"
          className="mt-4 flex items-start gap-2.5 rounded-xl border border-[color-mix(in_oklab,var(--warn)_40%,transparent)] bg-[color-mix(in_oklab,var(--warn)_10%,transparent)] px-3.5 py-3 text-[12.5px] text-[var(--warn)]"
        >
          <AlertTriangle size={15} className="mt-px shrink-0" />
          That area needs a different role. Pick the right one below.
        </motion.p>
      ) : null}

      <form onSubmit={submit} className="mt-6 space-y-4" noValidate>
        <label className="block">
          <span className="mb-1.5 block text-[12px] font-medium text-fg-muted">Email</span>
          <span className="flex h-11 items-center gap-2.5 rounded-xl border border-line bg-surface px-3.5 transition-colors duration-[var(--dur)] focus-within:border-[var(--accent)]">
            <Mail size={15} className="shrink-0 text-fg-subtle" />
            <input
              data-testid="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@club.com"
              className="w-full bg-transparent text-[14px] outline-none placeholder:text-fg-subtle"
            />
          </span>
        </label>

        <div>
          <span className="mb-2 block text-[12px] font-medium text-fg-muted">
            Sign in as
          </span>
          <div className="grid grid-cols-2 gap-2">
            {ROLES.map((r) => (
              <button
                key={r.id}
                type="button"
                data-testid={`role-${r.id}`}
                aria-pressed={role === r.id}
                onClick={() => setRole(r.id)}
                className={cx(
                  "rounded-xl border px-3 py-2.5 text-left text-[12.5px] font-medium transition-[border-color,background-color,transform] duration-[var(--dur)] ease-[var(--ease-out)]",
                  role === r.id
                    ? "border-[var(--accent)] bg-[color-mix(in_oklab,var(--accent)_12%,transparent)] text-[var(--accent)]"
                    : "border-line bg-surface text-fg-muted hover:-translate-y-0.5 hover:border-line-strong hover:text-fg",
                )}
              >
                {r.label}
              </button>
            ))}
          </div>
        </div>

        {error ? (
          <p data-testid="email-error" className="text-[12.5px] text-[var(--live)]">
            {error}
          </p>
        ) : null}

        <Button type="submit" variant="primary" className="w-full" data-testid="submit">
          {mode === "signup" ? "Create account" : "Continue"}
          <ArrowRight size={15} />
        </Button>
      </form>

      <div className="my-5 flex items-center gap-3 text-[11px] uppercase tracking-widest text-fg-subtle">
        <span className="h-px flex-1 bg-line" /> or <span className="h-px flex-1 bg-line" />
      </div>

      <Button variant="secondary" className="w-full" data-testid="google">
        Continue with Google
      </Button>

      <p className="mt-6 text-center text-[12.5px] text-fg-muted">
        {mode === "signup" ? (
          <>
            Already have an account?{" "}
            <Link href="/signin" className="font-semibold text-[var(--accent)]">
              Sign in
            </Link>
          </>
        ) : (
          <>
            New to Smidig?{" "}
            <Link href="/signup" className="font-semibold text-[var(--accent)]">
              Create an account
            </Link>
          </>
        )}
      </p>

      <p className="mt-4 text-center text-[11px] text-fg-subtle">
        Prototype — no email is sent and any address works.
      </p>
    </Card>
  );
}
