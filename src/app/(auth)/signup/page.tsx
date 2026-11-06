import { Suspense } from "react";
import { SignInForm } from "@/components/auth/sign-in-form";

export const metadata = { title: "Create an account" };

export default function Page() {
  return (
    <Suspense fallback={null}>
      <SignInForm mode="signup" />
    </Suspense>
  );
}
