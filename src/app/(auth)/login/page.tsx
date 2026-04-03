import { Suspense } from "react";
import { LoginForm } from "./LoginForm";

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-dvh items-center justify-center bg-gradient-to-b from-[#fdfcfa] to-[#e8dfd4]">
          <div className="h-12 w-12 animate-pulse rounded-full bg-stone-200" />
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
