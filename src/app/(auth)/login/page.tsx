import { Suspense } from "react";
import { LoginForm } from "./LoginForm";

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-dvh items-center justify-center bg-gradient-to-b from-[#fff5fc] to-[#ffd6e8]">
          <div className="h-12 w-12 animate-pulse rounded-full bg-pink-200" />
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
