import { Suspense } from "react";
import AuthCallback from "@/src/views/AuthCallback";

export default function AuthCallbackPage() {
  return (
    <Suspense>
      <AuthCallback />
    </Suspense>
  );
}
