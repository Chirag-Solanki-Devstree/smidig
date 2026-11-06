"use client";

import { useRouter } from "next/navigation";
import { motion } from "motion/react";
import { ArrowRight } from "lucide-react";
import { Card } from "@/components/kit";
import { useSession } from "@/components/session-provider";
import { ROLES, roleById } from "@/lib/session";

export function RolePicker() {
  const router = useRouter();
  const { session, signIn } = useSession();

  return (
    <div className="w-full max-w-2xl">
      <h1 className="display text-center text-3xl">What brings you here?</h1>
      <p className="mt-2 text-center text-[13.5px] text-fg-muted">
        You can change this later — one account covers every role.
      </p>

      <div className="mt-8 grid gap-3 sm:grid-cols-2">
        {ROLES.map((r, i) => (
          <motion.button
            key={r.id}
            data-testid={`onboard-${r.id}`}
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05, duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
            onClick={() => {
              signIn({
                name: session?.name ?? "Guest",
                email: session?.email ?? "guest@smidig.app",
                role: r.id,
              });
              router.push(roleById(r.id).home);
            }}
            className="group text-left"
          >
            <Card className="h-full p-5 transition-[transform,border-color] duration-[var(--dur)] ease-[var(--ease-out)] group-hover:-translate-y-1 group-hover:border-[var(--accent)]">
              <div className="flex items-center justify-between">
                <span className="text-[14px] font-semibold">{r.label}</span>
                <ArrowRight
                  size={15}
                  className="text-fg-subtle transition-transform duration-[var(--dur)] ease-[var(--ease-out)] group-hover:translate-x-1 group-hover:text-[var(--accent)]"
                />
              </div>
              <p className="mt-1.5 text-[12.5px] leading-relaxed text-fg-muted">{r.blurb}</p>
            </Card>
          </motion.button>
        ))}
      </div>
    </div>
  );
}
