import type { Metadata } from "next";
import { BrowseClient } from "@/components/site/browse-client";

export const metadata: Metadata = {
  title: "Browse tournaments",
  description: "Search tournaments by sport, city, date, format and entry fee.",
};

export default function BrowsePage() {
  return (
    <div className="shell pt-28 pb-16 sm:pt-32">
      <BrowseClient />
    </div>
  );
}
