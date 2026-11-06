import Link from "next/link";
import { BallMark } from "@/components/ui";
import { RouteTransition } from "@/components/fx/route-transition";

export default function AuthLayout({ children }: LayoutProps<"/">) {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="flex items-center justify-between px-5 py-5 sm:px-8">
        <Link href="/" className="flex items-center gap-2.5">
          <BallMark />
          <span className="text-[15px] font-semibold tracking-tight">Smidig</span>
        </Link>
        <Link
          href="/"
          className="text-[13px] text-fg-muted transition-colors duration-[var(--dur)] hover:text-fg"
        >
          Back to marketplace
        </Link>
      </header>
      <main className="flex flex-1 items-center justify-center px-5 py-10">
        <RouteTransition>{children}</RouteTransition>
      </main>
    </div>
  );
}
