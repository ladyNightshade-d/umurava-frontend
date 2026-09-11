'use client';

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/src/contexts/AuthContext";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

// H-4: role allowlist — TypeScript cast alone provides zero runtime protection
const VALID_ROLES = ["recruiter", "candidate"] as const;
type ValidRole = typeof VALID_ROLES[number];

const sanitizeRole = (role: string | null): ValidRole =>
  VALID_ROLES.includes(role as ValidRole) ? (role as ValidRole) : "recruiter";

// C-3: Basic JWT structure validation — ensures token is not a crafted plain string
const isValidJWTShape = (token: string): boolean => {
  const parts = token.split(".");
  if (parts.length !== 3) return false;
  try {
    // Each part must be valid base64url
    parts.forEach(p => atob(p.replace(/-/g, "+").replace(/_/g, "/")));
    return true;
  } catch {
    return false;
  }
};

// H-1: sanitize string params — strip any HTML/script injection attempts
const sanitizeParam = (value: string | null, maxLength = 256): string | null => {
  if (!value) return null;
  // Remove any HTML tags or script content
  const cleaned = value.replace(/<[^>]*>/g, "").trim().slice(0, maxLength);
  return cleaned || null;
};

const AuthCallback = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login } = useAuth();

  useEffect(() => {
    const rawToken = searchParams.get("token");
    const rawId = searchParams.get("id");
    const rawName = searchParams.get("name");
    const rawEmail = searchParams.get("email");
    const rawRole = searchParams.get("role");
    const error = searchParams.get("error");

    if (error) {
      toast.error("Google sign-in failed. Please try again.");
      router.push("/auth");
      return;
    }

    // Sanitize all URL params before using them
    const token = rawToken?.trim() ?? null;
    const id = sanitizeParam(rawId);
    const name = sanitizeParam(rawName);
    const email = sanitizeParam(rawEmail);
    // H-4: validate role against allowlist — never trust URL params for access control
    const role = sanitizeRole(rawRole);

    // C-3: validate JWT structure before accepting it
    if (!token || !isValidJWTShape(token)) {
      toast.error("Invalid authentication token. Please try again.");
      router.push("/auth");
      return;
    }

    if (id && name && email) {
      // Basic email format check
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        toast.error("Invalid account data. Please try again.");
        router.push("/auth");
        return;
      }

      login(token, { id, name, email, role });
      toast.success(`Welcome, ${name}!`);
      // H-4: route based on sanitized role, not raw URL param
      router.push(role === "candidate" ? "/candidate/jobs" : "/dashboard");
    } else {
      toast.error("Incomplete authentication data. Please try again.");
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
