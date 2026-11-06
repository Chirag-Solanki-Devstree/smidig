import type { Metadata } from "next";
import { TicketWallet } from "@/components/site/ticket-wallet";

export const metadata: Metadata = { title: "My tickets" };

export default function TicketsPage() {
  return (
    <div className="shell max-w-3xl pt-28 pb-20 sm:pt-32">
      <TicketWallet />
    </div>
  );
}
