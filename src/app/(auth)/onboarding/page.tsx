import { Suspense } from "react";
import { RolePicker } from "@/components/auth/role-picker";

export const metadata = { title: "Choose your role" };

export default function Page() {
  return (
    <Suspense fallback={null}>
      <RolePicker />
    </Suspense>
  );
}
