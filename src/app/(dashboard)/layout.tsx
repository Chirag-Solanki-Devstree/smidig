import { ConsoleShell } from "@/components/layouts/console-shell";
import { RouteTransition } from "@/components/fx/route-transition";
import { RequireRole } from "@/components/auth/require-role";

export default function DashboardLayout({ children }: LayoutProps<"/">) {
  return (
    <ConsoleShell surface="organizer" switcher="Deccan Premier League 2026">
      <RequireRole role="organizer">
        <RouteTransition>{children}</RouteTransition>
      </RequireRole>
    </ConsoleShell>
  );
}
