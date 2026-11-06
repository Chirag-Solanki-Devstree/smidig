import { Suspense } from "react";
import type { Metadata } from "next";
import { BrowseClient } from "@/components/site/browse-client";
import { Skeleton } from "@/components/kit";

export const metadata: Metadata = {
  title: "Browse tournaments",
  description: "Search tournaments by sport, city, date, format and entry fee.",
};

export default function BrowsePage() {
  return (
    <div className="shell pt-28 pb-16 sm:pt-32">
      {/* useSearchParams reads request-time data, so it needs a boundary to
          prerender the shell around it. */}
      <Suspense fallback={<BrowseSkeleton />}>
        <BrowseClient />
      </Suspense>
    </div>
  );
}

function BrowseSkeleton() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-10 w-72" />
      <Skeleton className="h-5 w-96" />
      <Skeleton className="h-11 w-full" />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-72 w-full" />
        ))}
      </div>
    </div>
  );
}
