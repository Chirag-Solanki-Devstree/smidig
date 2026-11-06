import { ConsoleShell } from "@/components/layouts/console-shell";
import { RouteTransition } from "@/components/fx/route-transition";
import { RequireRole } from "@/components/auth/require-role";

export default function AdminLayout({ children }: LayoutProps<"/">) {
  return (
    <ConsoleShell surface="admin" switcher="All of Smidig">
      <RequireRole role="admin">
        <RouteTransition>{children}</RouteTransition>
      </RequireRole>
    </ConsoleShell>
  );
}
