"use client";

import type { ReactNode } from "react";
import { Children, cloneElement, isValidElement } from "react";
import { useRevealOnce } from "@/components/fx/in-view";
import { cx } from "@/lib/cx";

/** Lifts a block into place the first time it is scrolled to. */
export function Rise({
  children,
  className,
  as: Tag = "div",
}: {
  children: ReactNode;
  className?: string;
  as?: "div" | "section";
}) {
  const ref = useRevealOnce<HTMLDivElement>();
  return (
    <Tag ref={ref} className={cx("rise", className)}>
      {children}
    </Tag>
  );
}

/**
 * Same, but its direct children arrive one after another.
 * The index goes in as a CSS variable so the delay costs no JS per child.
 */
export function RiseStagger({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  const ref = useRevealOnce<HTMLDivElement>();
  return (
    <div ref={ref} className={cx("rise-stagger", className)}>
      {Children.map(children, (child, i) =>
        isValidElement<{ style?: React.CSSProperties }>(child)
          ? cloneElement(child, {
              style: { ...(child.props.style ?? {}), ["--i" as string]: i },
            })
          : child,
      )}
    </div>
  );
}
