import { PageTitle } from "@/components/layouts/console-shell";
import { OrdersTable } from "@/components/console/orders-table";

export const metadata = { title: "Orders & refunds" };

export default function Page() {
  return (
    <>
      <PageTitle
        title="Orders & refunds"
        sub="Search any order across the platform by id, buyer or gateway reference."
      />
      <OrdersTable admin />
    </>
  );
}
