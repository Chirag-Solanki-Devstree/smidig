"use client";

import { Button } from "@/components/kit";
import { useToast } from "@/components/kit/toast";

type Props = {
  children: React.ReactNode;
  title: string;
  body?: string;
  tone?: "ok" | "info" | "warn";
  variant?: "primary" | "secondary" | "ghost" | "gold" | "danger";
  size?: "sm" | "md";
  className?: string;
  disabled?: boolean;
  testId?: string;
};

/**
 * A control that is wired but has no backend yet. It confirms the action with
 * a toast instead of silently doing nothing — and marks exactly where the real
 * server action will be called.
 */
export function ActionButton({
  children,
  title,
  body,
  tone = "ok",
  variant = "secondary",
  size = "md",
  className,
  disabled,
  testId,
}: Props) {
  const toast = useToast();
  return (
    <Button
      variant={variant}
      size={size}
      className={className}
      disabled={disabled}
      data-testid={testId}
      onClick={() => toast({ title, body, tone })}
    >
      {children}
    </Button>
  );
}
