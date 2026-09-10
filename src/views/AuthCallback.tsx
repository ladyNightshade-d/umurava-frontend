'use client';

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/src/contexts/AuthContext";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

const AuthCallback = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login } = useAuth();

  useEffect(() => {
    const token = searchParams.get("token");
    const id = searchParams.get("id");
    const name = searchParams.get("name");
    const email = searchParams.get("email");
    const role = searchParams.get("role");
    const error = searchParams.get("error");

    if (error) {
      toast.error("Google sign-in failed. Please try again.");
      router.push("/auth");
      return;
    }

    if (token && id && name && email) {
      login(token, {
        id,
        name,
        email,
        role: (role as "recruiter" | "candidate") ?? "recruiter",
      });
      toast.success(`Welcome, ${name}!`);
      router.push(role === "candidate" ? "/candidate/jobs" : "/dashboard");
    } else {
      toast.error("Something went wrong. Please try again.");
      router.push("/auth");
    }
  }, [searchParams, login, router]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center space-y-3">
        <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
        <p className="text-sm text-muted-foreground">Signing you in with Google...</p>
      </div>
    </div>
  );
};

export default AuthCallback;
