import { MobileTabs, PublicFooter, PublicNav } from "@/components/layouts/public-shell";
import { RouteTransition } from "@/components/fx/route-transition";

export default function PublicLayout({ children }: LayoutProps<"/">) {
  return (
    <>
      <PublicNav />
      <RouteTransition>{children}</RouteTransition>
      <PublicFooter />
      <MobileTabs />
    </>
  );
}
