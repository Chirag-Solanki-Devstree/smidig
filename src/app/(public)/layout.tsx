import { MobileTabs, PublicFooter, PublicNav } from "@/components/layouts/public-shell";
import { RouteTransition } from "@/components/fx/route-transition";
import { ScrollProgress } from "@/components/fx/progress-bar";

export default function PublicLayout({ children }: LayoutProps<"/">) {
  return (
    <>
      <ScrollProgress />
      <PublicNav />
      <RouteTransition>{children}</RouteTransition>
      <PublicFooter />
      <MobileTabs />
    </>
  );
}
